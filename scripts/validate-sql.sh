#!/usr/bin/env bash
#
# Rejoue tout le SQL du dépôt sur une base Postgres jetable, puis vérifie le
# comportement de la réservation publique et des rappels.
#
# À lancer après toute modification de supabase/ — une erreur de syntaxe
# découverte ici coûte une minute ; découverte chez un client, elle coûte
# un déploiement raté.
#
#   ./scripts/validate-sql.sh
#
# Prérequis : les binaires PostgreSQL (initdb, pg_ctl, psql). Aucune base
# existante n'est touchée : le script crée son propre cluster dans un
# répertoire temporaire et le supprime en sortant.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
PORT=55432

for dir in /usr/lib/postgresql/*/bin; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done
command -v initdb >/dev/null || { echo "initdb introuvable — installez PostgreSQL."; exit 1; }

cleanup() {
  pg_ctl -D "$WORK/data" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "▸ Cluster temporaire"
initdb -D "$WORK/data" -U postgres --auth=trust >/dev/null
pg_ctl -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" \
       -l "$WORK/log" start >/dev/null
sleep 2

run() { psql -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q "$@"; }

echo "▸ Simulacre de l'environnement Supabase"
run <<'SQL'
CREATE SCHEMA auth;
CREATE SCHEMA storage;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
CREATE TABLE storage.buckets (
  id text PRIMARY KEY, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
CREATE TABLE storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION storage.foldername(name text) RETURNS text[]
  LANGUAGE sql AS $$ SELECT string_to_array(name, '/') $$;
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;

-- Supabase interdit la suppression directe dans les tables de stockage.
-- Reproduit ici pour que le harnais refuse tout SQL qui l'ignorerait.
CREATE FUNCTION storage.protect_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.';
END $$;
CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION storage.protect_delete();
CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets
  FOR EACH ROW EXECUTE FUNCTION storage.protect_delete();
SQL

echo "▸ Migrations, amorçage et preset"
for f in "$REPO"/supabase/migrations/*.sql "$REPO"/supabase/seed.sql \
         "$REPO"/supabase/presets/salon-beaute.sql; do
  run -f "$f" >/dev/null
  echo "  ✅ $(basename "$f")"
done

echo "▸ Les autres presets s'appliquent-ils ?"
for f in "$REPO"/supabase/presets/*.sql; do
  [ "$(basename "$f")" = 'salon-beaute.sql' ] && continue
  run -f "$f" >/dev/null
  echo "  ✅ $(basename "$f")"
done

echo "▸ Comportement de la réservation publique"
run <<'SQL' >/dev/null
DO $$
DECLARE
  v_service uuid;
  v_date    date;
  v_time    text;
  v_id      uuid;
  v_price   numeric;
  v_count   int;
BEGIN
  INSERT INTO public.services (name, category, price, duration)
  VALUES ('Test', 'Test', 45.00, 30) RETURNING id INTO v_service;

  SELECT date, label INTO v_date, v_time
    FROM public.time_slots ORDER BY date, sort_order LIMIT 1;

  -- Réservation nominale
  v_id := public.create_public_appointment(
    'Testeur', '0600000000', 'test@exemple.fr',
    ARRAY[v_service], v_date, v_time);
  IF v_id IS NULL THEN RAISE EXCEPTION 'La réservation n''a rien retourné'; END IF;

  -- Le tarif doit venir de la base
  SELECT (services -> 0 ->> 'price')::numeric INTO v_price
    FROM public.appointments WHERE id = v_id;
  IF v_price <> 45.00 THEN RAISE EXCEPTION 'Tarif incorrect : %', v_price; END IF;

  -- La fiche client doit être créée
  SELECT count(*) INTO v_count FROM public.clients WHERE email = 'test@exemple.fr';
  IF v_count <> 1 THEN RAISE EXCEPTION 'Fiche client absente'; END IF;

  -- Le rappel doit être programmé
  SELECT count(*) INTO v_count FROM public.reminders WHERE appointment_id = v_id;
  IF v_count <> 1 THEN RAISE EXCEPTION 'Rappel non programmé'; END IF;

  -- Le créneau ne doit plus être réservable
  BEGIN
    PERFORM public.create_public_appointment(
      'Doublon', '0600000001', 'doublon@exemple.fr',
      ARRAY[v_service], v_date, v_time);
    RAISE EXCEPTION 'La double réservation aurait dû être refusée';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%aurait dû%' THEN RAISE; END IF;
  END;

  -- L'annulation doit retirer le rappel
  UPDATE public.appointments SET status = 'cancelled' WHERE id = v_id;
  SELECT count(*) INTO v_count FROM public.reminders WHERE appointment_id = v_id;
  IF v_count <> 0 THEN RAISE EXCEPTION 'Rappel non supprimé à l''annulation'; END IF;
END $$;
SQL
echo "  ✅ tarif relu en base, fiche client, rappel, anti-doublon, annulation"

echo "▸ Amorçage de l'administrateur"
run <<'SQL' >/dev/null
DO $$
DECLARE v_role text; v_count int;
BEGIN
  -- Un compte créé hors de l'application (dashboard Supabase)
  INSERT INTO auth.users (email, raw_user_meta_data)
  VALUES ('patron@exemple.fr', '{"name": "Patron"}'::jsonb);

  -- Le profil doit exister sans intervention
  SELECT count(*) INTO v_count FROM public.users WHERE email = 'patron@exemple.fr';
  IF v_count <> 1 THEN RAISE EXCEPTION 'Profil non créé par le déclencheur'; END IF;

  -- ...et en simple client
  SELECT role INTO v_role FROM public.users WHERE email = 'patron@exemple.fr';
  IF v_role <> 'client' THEN RAISE EXCEPTION 'Rôle initial incorrect : %', v_role; END IF;

  -- La promotion depuis l'éditeur SQL doit aboutir
  PERFORM public.promote_to_admin('patron@exemple.fr');
  SELECT role INTO v_role FROM public.users WHERE email = 'patron@exemple.fr';
  IF v_role <> 'admin' THEN RAISE EXCEPTION 'Promotion sans effet : %', v_role; END IF;

  -- Une adresse inconnue doit lever une erreur, pas réussir en silence
  BEGIN
    PERFORM public.promote_to_admin('personne@exemple.fr');
    RAISE EXCEPTION 'Une adresse inconnue aurait dû être refusée';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%aurait dû%' THEN RAISE; END IF;
  END;
END $$;
SQL
echo "  ✅ profil créé automatiquement, promotion effective, adresse inconnue refusée"

echo "▸ Remise à zéro, puis reconstruction complète"
# Un objet et un compte préexistants, pour que les garde-fous soient sollicités.
run <<'SQL' >/dev/null
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'gallery/vieux.webp');
INSERT INTO auth.users (email) VALUES ('ancien@exemple.fr');
SQL
run -f "$REPO/supabase/reset.sql" >/dev/null
for f in "$REPO"/supabase/migrations/*.sql "$REPO"/supabase/seed.sql \
         "$REPO"/supabase/presets/salon-beaute.sql; do
  run -f "$f" >/dev/null
done
run -c "SELECT 1 / count(*) FROM public.business_settings;" >/dev/null
echo "  ✅ le cycle reset → migrations → seed → preset aboutit à une base utilisable"

echo
echo "Tout le SQL du dépôt est valide."