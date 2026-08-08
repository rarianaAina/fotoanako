/*
# Création du profil et amorçage de l'administrateur

Deux défauts de conception apparus au premier déploiement réel.

## 1. Un compte d'authentification n'avait pas de profil

Supabase sépare `auth.users`, qui gère l'identité et le mot de passe, de
`public.users`, qui porte le nom, le téléphone et le rôle. Seul le formulaire
d'inscription de l'application créait la seconde ligne.

Un compte créé depuis le dashboard Supabase n'avait donc pas de profil, et la
connexion échouait sur « Profil introuvable » — sans que rien n'indique où
regarder. Le profil est désormais créé par la base, quelle que soit la voie
d'entrée.

## 2. Le premier administrateur était impossible à créer

`guard_user_role()` interdit de s'attribuer le rôle `admin`, en s'appuyant sur
`is_admin()`. Depuis l'éditeur SQL, `auth.uid()` est nul : la fonction
répondait donc « non » et bloquait aussi la promotion légitime.

Pire, le refus était muet dans le cas courant. Un `UPDATE ... WHERE email = …`
sur une table sans ligne correspondante réussit en modifiant zéro ligne :
l'éditeur affichait un succès, et rien n'avait changé.

Le garde-fou ne s'applique plus qu'aux requêtes venues de l'API publique.
*/

-- ---------------------------------------------------------------------------
-- Garde-fou sur le rôle, restreint aux appels passant par l'API
--
-- La fonction n'est plus SECURITY DEFINER, et c'est le point clé : sous
-- SECURITY DEFINER, `current_user` vaut le propriétaire de la fonction, ce qui
-- rendait impossible de distinguer un appel d'API d'un accès SQL direct. En
-- INVOKER, `current_user` reflète l'appelant réel — `anon` ou `authenticated`
-- pour PostgREST, `postgres` depuis l'éditeur SQL.
--
-- Elle appelle `is_admin()`, qui reste SECURITY DEFINER : c'est cette
-- fonction-là qui a besoin de lire `public.users` outre la RLS.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_user_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Accès SQL direct ou clé de service : opération d'administration légitime.
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Une inscription crée toujours un client, jamais un administrateur.
    IF NOT public.is_admin() THEN
      NEW.role := 'client';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Modification du rôle interdite';
  END IF;

  RETURN NEW;
END;
$$;

-- Même correctif pour la validation des avis : depuis l'éditeur SQL, un avis
-- inséré était forcé en non validé, sans explication.
CREATE OR REPLACE FUNCTION public.guard_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT public.is_admin() THEN
    NEW.verified := false;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Création automatique du profil
--
-- Vaut pour toutes les voies d'entrée : formulaire d'inscription, dashboard
-- Supabase, invitation, connexion par lien magique. Le rôle est toujours
-- `client` ; la promotion reste un geste explicite.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role)
  VALUES (
    NEW.id,
    coalesce(
      nullif(trim(NEW.raw_user_meta_data ->> 'name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    nullif(trim(NEW.raw_user_meta_data ->> 'phone'), ''),
    'client'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Rattrapage des comptes déjà créés sans profil
-- ---------------------------------------------------------------------------
INSERT INTO public.users (id, name, email, role)
SELECT au.id,
       coalesce(nullif(trim(au.raw_user_meta_data ->> 'name'), ''), split_part(au.email, '@', 1)),
       au.email,
       'client'
  FROM auth.users au
 WHERE au.email IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Promotion d'un compte en administrateur
--
-- Passe par une fonction plutôt qu'un UPDATE à recopier : un UPDATE dont le
-- WHERE ne correspond à aucune ligne réussit en n'en modifiant aucune, et
-- l'éditeur SQL affiche un succès trompeur. Ici, une adresse inconnue lève
-- une erreur explicite.
--
--     SELECT public.promote_to_admin('vous@exemple.fr');
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seul un administrateur peut en promouvoir un autre';
  END IF;

  SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(trim(p_email));

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Aucun compte pour « % ». Créez-le d''abord, depuis la page d''inscription ou le dashboard.', p_email;
  END IF;

  -- Le profil existe déjà via le déclencheur, sauf pour un compte antérieur
  -- à cette migration dont l'adresse aurait changé entre-temps.
  INSERT INTO public.users (id, name, email, role)
  SELECT v_id, split_part(p_email, '@', 1), p_email, 'admin'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_id);

  UPDATE public.users SET role = 'admin' WHERE id = v_id;

  RETURN format('%s est désormais administrateur.', p_email);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.promote_to_admin(text) FROM public;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated;