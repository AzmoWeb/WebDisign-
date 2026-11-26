-- Catégories de départ (modifiables depuis l'administration).
-- Aucun produit n'est créé : le catalogue réel est saisi par le commerçant.
insert into public.categories (slug, name, gender, position) values
  ('baskets', 'Baskets', 'femme', 1),
  ('bottines', 'Bottines', 'femme', 2),
  ('bottes', 'Bottes', 'femme', 3),
  ('escarpins', 'Escarpins', 'femme', 4),
  ('mocassins', 'Mocassins', 'femme', 5),
  ('sandales', 'Sandales', 'femme', 6),
  ('chaussures-de-ville', 'Chaussures de ville', 'femme', 7),
  ('chaussons', 'Chaussons', 'femme', 8),
  ('baskets', 'Baskets', 'homme', 1),
  ('chaussures-de-ville', 'Chaussures de ville', 'homme', 2),
  ('mocassins', 'Mocassins', 'homme', 3),
  ('chaussures-habillees', 'Chaussures habillées', 'homme', 4),
  ('bottines', 'Bottines', 'homme', 5),
  ('sandales', 'Sandales', 'homme', 6),
  ('chaussons', 'Chaussons', 'homme', 7)
on conflict (gender, slug) do nothing;
