/*
# ⚠️ REMISE À ZÉRO — DESTRUCTIF

Efface l'intégralité des données applicatives : rendez-vous, fiches clients,
catalogue, galerie, avis, réglages, images téléversées et comptes
utilisateurs.

Aucune sauvegarde n'est faite. À n'exécuter que sur un projet de mise au
point, ou sur un projet neuf dont on veut repartir proprement.

Après ce fichier, rejouer dans l'ordre :

    supabase/migrations/0001_schema.sql
    supabase/migrations/0002_rls.sql
    supabase/migrations/0003_booking_rpc.sql
    supabase/migrations/0004_storage.sql
    supabase/seed.sql
    supabase/presets/<métier>.sql
*/

-- ---------------------------------------------------------------------------
-- 1. Schéma applicatif
-- ---------------------------------------------------------------------------
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

/*
Le point à ne pas oublier.

Recréer le schéma `public` détruit aussi les droits que Supabase y avait
posés. Sans les rétablir, PostgREST ne voit plus aucune table : l'API
répond 401 sur tout, et le diagnostic est déroutant — les tables existent
bel et bien, elles sont simplement inaccessibles.

Les droits par défaut comptent autant que les droits actuels : sans eux,
les tables créées par les migrations qui suivent naîtraient inaccessibles.
*/
ALTER SCHEMA public OWNER TO pg_database_owner;
COMMENT ON SCHEMA public IS 'standard public schema';

GRANT USAGE  ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT CREATE ON SCHEMA public TO postgres, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES    TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON ROUTINES  TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Stockage
--
-- Les politiques vivent sur storage.objects, table gérée par Supabase : elle
-- survit au DROP SCHEMA ci-dessus et doit être nettoyée à part.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS images_public_read    ON storage.objects;
DROP POLICY IF EXISTS images_admin_write    ON storage.objects;
DROP POLICY IF EXISTS images_booking_upload ON storage.objects;

DELETE FROM storage.objects WHERE bucket_id = 'images';
DELETE FROM storage.buckets WHERE id = 'images';

-- ---------------------------------------------------------------------------
-- 3. Comptes utilisateurs
--
-- Commentez ce bloc pour conserver les comptes existants. Les garder laisse
-- des inscriptions orphelines : `public.users` ayant disparu avec le schéma,
-- une nouvelle inscription avec la même adresse sera refusée pour doublon.
-- ---------------------------------------------------------------------------
DELETE FROM auth.users;

-- ---------------------------------------------------------------------------
-- 4. Contrôle
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_tables int;
BEGIN
  SELECT count(*) INTO v_tables
    FROM information_schema.tables WHERE table_schema = 'public';
  IF v_tables <> 0 THEN
    RAISE EXCEPTION 'Le schéma public contient encore % table(s).', v_tables;
  END IF;
  RAISE NOTICE 'Base remise à zéro. Rejouez les migrations, puis seed.sql et un preset.';
END $$;