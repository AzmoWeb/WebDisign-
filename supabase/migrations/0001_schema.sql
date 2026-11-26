-- =====================================================================
-- AUX JOLIS PAS — schéma de base de données (Supabase / PostgreSQL)
-- Toutes les tables sont protégées par Row Level Security (RLS).
-- Les écritures sensibles (commandes, paiements, stocks) passent
-- exclusivement par le serveur avec la clé service_role.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profils & rôles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (char_length(first_name) <= 80),
  last_name text check (char_length(last_name) <= 80),
  phone text check (char_length(phone) <= 30),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'first_name', ''), 80),
    left(coalesce(new.raw_user_meta_data->>'last_name', ''), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  gender text not null check (gender in ('femme', 'homme')),
  description text,
  position int not null default 0,
  active boolean not null default true,
  unique (gender, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 160),
  brand text not null default '',
  description text not null default '',
  gender text not null check (gender in ('femme', 'homme', 'mixte')),
  category_id uuid references public.categories(id) on delete set null,
  price_cents int not null check (price_cents > 0),
  sale_price_cents int check (sale_price_cents is null or (sale_price_cents > 0 and sale_price_cents < price_cents)),
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_featured boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_active_idx on public.products (active, gender);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null default '',
  color text,
  position int not null default 0
);
create index product_images_product_idx on public.product_images (product_id, position);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null,
  color_hex text not null default '#141210' check (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  size text not null,
  stock int not null default 0 check (stock >= 0),
  sku text,
  unique (product_id, color, size)
);
create index product_variants_product_idx on public.product_variants (product_id);

-- ---------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  first_name text not null,
  last_name text not null,
  line1 text not null,
  line2 text,
  postal_code text not null,
  city text not null,
  country text not null default 'FR',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AJP-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  shipping_method text not null check (shipping_method in ('home', 'pickup')),
  shipping_address jsonb,
  notes text,
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int not null default 0 check (shipping_cents >= 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  amount_paid_cents int,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending','paid','preparing','shipped','ready_for_pickup','completed','cancelled','payment_failed','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded','expired')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  tracking_number text,
  tracking_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  brand text not null default '',
  size text not null,
  color text not null,
  image_url text,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity int not null check (quantity between 1 and 20)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_events (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Idempotence des webhooks Stripe
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Contenu du site & avis
-- ---------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  review_date date,
  source text not null default 'google' check (source in ('google')),
  source_url text,
  -- Garde-fous : un avis n'est publié que s'il est vérifié ET que sa reproduction est autorisée
  verified boolean not null default false,
  publication_authorized boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  ip_hash text,
  created_at timestamptz not null default now()
);

-- Preuve de consentement cookies (aucune donnée directement identifiante)
create table public.consent_logs (
  id bigserial primary key,
  consent_id uuid not null,
  policy_version text not null,
  action text not null check (action in ('accept_all', 'reject_all', 'custom', 'withdraw')),
  choices jsonb not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index consent_logs_consent_idx on public.consent_logs (consent_id);

-- Limitation de débit partagée entre instances serveur
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null
);

create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

-- ---------------------------------------------------------------------
-- Finalisation atomique d'une commande payée (appelée par le webhook Stripe)
-- Décrémente les stocks et passe la commande à "paid" une seule fois.
-- ---------------------------------------------------------------------
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
  -- Le montant encaissé + les remises Stripe (codes promo) doit correspondre au total calculé par le serveur
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
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.finalize_paid_order(uuid, text, int, int) to service_role;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- updated_at automatique
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.stripe_events enable row level security;
alter table public.site_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;
alter table public.consent_logs enable row level security;
alter table public.rate_limits enable row level security;

-- Profils : chacun lit le sien ; mise à jour limitée aux champs non sensibles
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, phone) on public.profiles to authenticated;

-- Catalogue : lecture publique des éléments actifs, écriture admin
create policy "categories_read" on public.categories for select using (active or public.is_admin());
create policy "categories_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_read" on public.products for select using (active or public.is_admin());
create policy "products_admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "images_read" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy "images_admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "variants_read" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy "variants_admin" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- Adresses et favoris : propriétaire uniquement
create policy "addresses_own" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "favorites_own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Commandes : le client lit les siennes, l'admin lit et met à jour. Création via service_role uniquement.
create policy "orders_select" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "order_items_select" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "order_events_select" on public.order_events for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "order_events_admin_insert" on public.order_events for insert with check (public.is_admin());

-- Contenu : lecture publique, écriture admin
create policy "settings_read" on public.site_settings for select using (true);
create policy "settings_admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "reviews_read" on public.reviews for select
  using ((published and verified and publication_authorized) or public.is_admin());
create policy "reviews_admin" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- Messages : lecture/gestion admin ; insertion via service_role (formulaire protégé côté serveur)
create policy "contact_admin" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
create policy "consent_admin_read" on public.consent_logs for select using (public.is_admin());
-- stripe_events et rate_limits : aucune policy → inaccessibles hors service_role.

-- =====================================================================
-- STOCKAGE DES IMAGES
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "site_images_public_read" on storage.objects for select using (bucket_id = 'site-images');
create policy "site_images_admin_insert" on storage.objects for insert with check (bucket_id = 'site-images' and public.is_admin());
create policy "site_images_admin_update" on storage.objects for update using (bucket_id = 'site-images' and public.is_admin());
create policy "site_images_admin_delete" on storage.objects for delete using (bucket_id = 'site-images' and public.is_admin());
