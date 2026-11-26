-- Création sécurisée du compte administrateur initial
-- 1. Créez le compte depuis le site (/compte/inscription) OU depuis Supabase :
--    Authentication > Users > "Add user" (cochez "Auto Confirm User"), avec un mot de passe long et unique.
-- 2. Dans Supabase > SQL Editor, exécutez la requête ci-dessous en remplaçant l'adresse e-mail.
-- Le rôle "admin" ne peut PAS être attribué depuis le site : uniquement ici, avec les droits du propriétaire du projet.

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'adresse-du-gerant@exemple.fr');

-- Vérification
select u.email, p.role from public.profiles p join auth.users u on u.id = p.id where p.role = 'admin';
