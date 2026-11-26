-- =====================================================================
-- Alertes retour en stock · Codes promo · Réservation en magasin
-- =====================================================================

-- ---------------------------------------------------------------------
-- Alertes « prévenez-moi » sur une pointure épuisée
-- ---------------------------------------------------------------------
create table public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null check (char_length(email) <= 160),
  created_at timestamptz not null default now(),
  notified_at timestamptz
);
create unique index stock_alerts_pending_unique on public.stock_alerts (variant_id, lower(email)) where notified_at is null;
create index stock_alerts_variant_idx on public.stock_alerts (variant_id) where notified_at is null;
alter table public.stock_alerts enable row level security;
create policy "stock_alerts_admin" on public.stock_alerts for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Codes promo gérés depuis l'administration
-- ---------------------------------------------------------------------
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,30}$'),
  kind text not null check (kind in ('percent', 'amount')),
  value int not null check (value > 0),
  min_subtotal_cents int not null default 0 check (min_subtotal_cents >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int check (max_uses is null or max_uses > 0),
  uses int not null default 0,
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90)
);
alter table public.promo_codes enable row level security;
create policy "promo_codes_admin" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists expected_discount_cents int not null default 0 check (expected_discount_cents >= 0);

-- La finalisation compte désormais l'utilisation du code promo
create or replace function public.finalize_paid_order(p_order_id uuid, p_payment_intent text, p_amount_cents int, p_discount_cents int default 0)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_stock int;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return 'not_found';
  end if;
  if v_order.payment_status = 'paid' then
    return 'already_paid';
  end if;
  if p_amount_cents + coalesce(p_discount_cents, 0) <> v_order.total_cents then
    insert into public.order_events (order_id, status, note)
    values (p_order_id, v_order.status, 'Montant payé (' || p_amount_cents || ' + remise ' || coalesce(p_discount_cents, 0) || ') différent du total attendu (' || v_order.total_cents || ') — vérification manuelle requise');
    return 'amount_mismatch';
  end if;

  for v_item in select variant_id, quantity, name, size from public.order_items where order_id = p_order_id and variant_id is not null loop
    select stock into v_stock from public.product_variants where id = v_item.variant_id for update;
    if v_stock is null or v_stock < v_item.quantity then
      insert into public.order_events (order_id, status, note)
      values (p_order_id, 'paid', 'Stock insuffisant pour ' || v_item.name || ' (pointure ' || v_item.size || ') — à traiter manuellement');
    end if;
    update public.product_variants set stock = greatest(stock - v_item.quantity, 0) where id = v_item.variant_id;
  end loop;

  if v_order.promo_code is not null then
    update public.promo_codes set uses = uses + 1 where code = v_order.promo_code;
  end if;

  update public.orders
    set status = 'paid', payment_status = 'paid', paid_at = now(),
        stripe_payment_intent_id = p_payment_intent, amount_paid_cents = p_amount_cents,
        discount_cents = coalesce(p_discount_cents, 0), updated_at = now()
    where id = p_order_id;

  insert into public.order_events (order_id, status, note) values (p_order_id, 'paid', 'Paiement confirmé par Stripe');
  return 'ok';
end;
$$;
revoke all on function public.finalize_paid_order(uuid, text, int, int) from public, anon, authenticated;
grant execute on function public.finalize_paid_order(uuid, text, int, int) to service_role;

-- ---------------------------------------------------------------------
-- Réserver en ligne, payer en magasin
-- La paire est retirée du stock en ligne pendant la réservation,
-- puis remise en stock si la réservation est annulée ou expire.
-- ---------------------------------------------------------------------
create sequence public.reservation_number_seq start 101;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_number text not null unique default ('RES-' || nextval('public.reservation_number_seq')),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  brand text not null default '',
  size text not null,
  color text not null,
  price_cents int not null check (price_cents >= 0),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'collected', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reservations_status_idx on public.reservations (status, created_at desc);
create index reservations_email_idx on public.reservations (lower(email)) where status in ('pending', 'ready');
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();

alter table public.reservations enable row level security;
create policy "reservations_select" on public.reservations for select using (user_id = auth.uid() or public.is_admin());
create policy "reservations_admin_update" on public.reservations for update using (public.is_admin()) with check (public.is_admin());

-- Création atomique : vérifie et bloque une paire du stock
create or replace function public.create_reservation(
  p_variant_id uuid, p_user_id uuid, p_first_name text, p_last_name text, p_email text, p_phone text, p_hold_hours int
) returns table (reservation_id uuid, reservation_number text, result text)
language plpgsql security definer set search_path = public
as $$
declare
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_active int;
  v_id uuid;
  v_number text;
begin
  select * into v_variant from public.product_variants where id = p_variant_id for update;
  if not found then
    return query select null::uuid, null::text, 'not_found'; return;
  end if;
  select * into v_product from public.products where id = v_variant.product_id;
  if not found or not v_product.active then
    return query select null::uuid, null::text, 'not_found'; return;
  end if;
  if v_variant.stock < 1 then
    return query select null::uuid, null::text, 'out_of_stock'; return;
  end if;
  select count(*) into v_active from public.reservations where lower(email) = lower(p_email) and status in ('pending', 'ready');
  if v_active >= 3 then
    return query select null::uuid, null::text, 'too_many'; return;
  end if;

  update public.product_variants set stock = stock - 1 where id = p_variant_id;
  insert into public.reservations (user_id, product_id, variant_id, product_name, brand, size, color, price_cents, first_name, last_name, email, phone, expires_at)
  values (p_user_id, v_product.id, v_variant.id, v_product.name, v_product.brand, v_variant.size, v_variant.color,
          coalesce(v_product.sale_price_cents, v_product.price_cents), p_first_name, p_last_name, p_email, p_phone,
          now() + make_interval(hours => greatest(1, least(p_hold_hours, 720))))
  returning id, reservations.reservation_number into v_id, v_number;
  return query select v_id, v_number, 'ok';
end;
$$;

-- Changement de statut : remise en stock si annulée ou expirée
create or replace function public.set_reservation_status(p_id uuid, p_status text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v public.reservations%rowtype;
begin
  select * into v from public.reservations where id = p_id for update;
  if not found then return 'not_found'; end if;
  if v.status in ('collected', 'cancelled', 'expired') then return 'closed'; end if;
  if p_status not in ('ready', 'collected', 'cancelled', 'expired') then return 'invalid'; end if;
  if p_status in ('cancelled', 'expired') and v.variant_id is not null then
    update public.product_variants set stock = stock + 1 where id = v.variant_id;
  end if;
  update public.reservations set status = p_status where id = p_id;
  return 'ok';
end;
$$;

-- Expiration automatique des réservations dépassées (appelée par la tâche planifiée et l'administration)
create or replace function public.expire_reservations()
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  n int := 0;
begin
  for v_id in select id from public.reservations where status = 'pending' and expires_at < now() for update skip locked loop
    perform public.set_reservation_status(v_id, 'expired');
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.create_reservation(uuid, uuid, text, text, text, text, int) from public, anon, authenticated;
grant execute on function public.create_reservation(uuid, uuid, text, text, text, text, int) to service_role;
-- Réservé au serveur (clé service_role), appelé après vérification du rôle administrateur
revoke all on function public.set_reservation_status(uuid, text) from public, anon, authenticated;
grant execute on function public.set_reservation_status(uuid, text) to service_role;
revoke all on function public.expire_reservations() from public, anon, authenticated;
grant execute on function public.expire_reservations() to service_role;
