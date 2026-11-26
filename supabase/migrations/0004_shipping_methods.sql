-- Plusieurs transporteurs (Colissimo, Mondial Relay…) : le mode d'expédition devient un identifiant libre,
-- son libellé et le point relais choisi par le client sont conservés sur la commande.
alter table public.orders drop constraint if exists orders_shipping_method_check;
alter table public.orders add constraint orders_shipping_method_check check (shipping_method ~ '^[a-z0-9-]{2,40}$');
alter table public.orders add column if not exists shipping_label text check (char_length(shipping_label) <= 120);
alter table public.orders add column if not exists relay_point text check (char_length(relay_point) <= 300);
