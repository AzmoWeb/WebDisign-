-- Mention « Visité en … » affichée par Google, conservée telle quelle (pas de date inventée)
alter table public.reviews add column if not exists visited_label text check (char_length(visited_label) <= 60);

-- Avis réels relevés sur la fiche Google « Aux Jolis Pas » le 26/11/2026, reproduits mot pour mot.
-- Les avis tronqués par Google (« plus ») ne reprennent que l'extrait visible, suivi de […] :
-- complétez-les depuis Administration → Avis Google si vous souhaitez le texte intégral.
insert into public.reviews (author_name, rating, text, visited_label, source, verified, publication_authorized, published) values
  ('Laur3009', 5, 'Très bon accueil, une propriétaire à l’écoute et beaucoup de choix!', 'Visité en juin 2026', 'google', true, true, true),
  ('Denis B. 59', 5, 'Beaucoup de choix dans ce petit magasin de proximité. Ça vaut le détour !', 'Visité en avril 2024', 'google', true, true, true),
  ('Dany Douyere', 5, 'Chaussures de très bonne qualité. De très jolis modèles et une commerçante très sympathique .... je recommande cette boutique.', 'Visité en octobre 2021', 'google', true, true, true),
  ('EVELYNE BRODDES', 5, 'Beau magasin avec de belles chaussures et la patronne super sympa', 'Visité en juin 2021', 'google', true, true, true),
  ('Steph Leg', 5, 'Allez y les yeux fermés. Du choix du choix du choix Tendance, marque, public il y en a vraiment […]', 'Visité en mai 2022', 'google', true, true, true),
  ('Loïc Paillez', 5, 'Super magasin, du choix pour tout le monde et toujours à la pointe des tendances pour nous satisfaire...... […]', 'Visité en septembre 2019', 'google', true, true, true);
