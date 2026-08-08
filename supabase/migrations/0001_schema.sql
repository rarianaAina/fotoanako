/*
# Fotoanako — Schéma de base

Socle générique pour toute entreprise de services sur rendez-vous.
Aucune table, colonne ou valeur n'est spécifique à un métier : ce qui varie
d'un client à l'autre vit dans `business_settings` (branding, devise, modules,
vocabulaire) ou dans les tables de configuration (catégories, créneaux,
moyens de paiement, emplacements d'images).

Ordre d'exécution : 0001_schema.sql → 0002_rls.sql → seed.sql
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Déclencheur générique de mise à jour d'horodatage
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- users — profil applicatif adossé à auth.users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  role        text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON public.users (lower(email));
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

CREATE TRIGGER users_touch BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- business_settings — identité, branding, régionalisation, modules, vocabulaire
-- Singleton : une seule ligne par déploiement.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identité
  name              text NOT NULL DEFAULT 'Mon entreprise',
  tagline           text NOT NULL DEFAULT '',
  description       text NOT NULL DEFAULT '',

  -- Contact
  address           text NOT NULL DEFAULT '',
  phone             text NOT NULL DEFAULT '',
  whatsapp          text NOT NULL DEFAULT '',
  email             text NOT NULL DEFAULT '',
  website           text,
  facebook          text,
  instagram         text,
  tiktok            text,

  -- Horaires d'ouverture : [{ day, open, close, closed }]
  hours             jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Branding
  primary_color     text NOT NULL DEFAULT 'hsl(30 60% 45%)',
  accent_color      text NOT NULL DEFAULT 'hsl(35 55% 48%)',
  logo_url          text,
  favicon_url       text,

  -- Régionalisation
  currency_code     text NOT NULL DEFAULT 'EUR',
  currency_symbol   text NOT NULL DEFAULT '€',
  currency_position text NOT NULL DEFAULT 'suffix' CHECK (currency_position IN ('prefix', 'suffix')),
  locale            text NOT NULL DEFAULT 'fr-FR',
  timezone          text NOT NULL DEFAULT 'Europe/Paris',

  -- Modules activables : { "gallery": true, "loyalty": false, ... }
  modules           jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Vocabulaire métier : { "customer": "Client", "service": "Prestation", ... }
  labels            jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Garantit le singleton : toute seconde insertion échoue.
CREATE UNIQUE INDEX IF NOT EXISTS business_settings_singleton
  ON public.business_settings ((true));

CREATE TRIGGER business_settings_touch BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- service_categories — catégories du catalogue, éditables par l'admin
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS service_categories_name_key
  ON public.service_categories (lower(name));

CREATE TRIGGER service_categories_touch BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- services — le catalogue de prestations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  category    text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  duration    integer NOT NULL DEFAULT 30 CHECK (duration > 0),  -- minutes
  price       numeric(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  image       text NOT NULL DEFAULT '',
  popular     boolean NOT NULL DEFAULT false,
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_active_idx ON public.services (active);
CREATE INDEX IF NOT EXISTS services_category_idx ON public.services (category);

CREATE TRIGGER services_touch BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- clients — fiche client de l'entreprise (distincte du compte auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES public.users(id) ON DELETE SET NULL,
  name           text NOT NULL,
  phone          text NOT NULL,
  email          text,
  notes          text,
  visit_count    integer NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
  total_spent    numeric(12, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  loyalty_points integer NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  last_visit     date,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS clients_phone_idx ON public.clients (phone);

CREATE TRIGGER clients_touch BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- image_slots — emplacements d'images de référence, configurables par métier
-- Remplace le trio figé « main gauche / main droite / inspiration ».
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.image_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL,               -- identifiant stable, ex. 'inspiration'
  label       text NOT NULL,               -- libellé affiché, ex. 'Photo d''inspiration'
  hint        text,                        -- aide contextuelle sous le champ
  max_files   integer NOT NULL DEFAULT 3 CHECK (max_files > 0),
  required    boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS image_slots_key_key ON public.image_slots (key);

CREATE TRIGGER image_slots_touch BEFORE UPDATE ON public.image_slots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- payment_methods
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  label       text NOT NULL,
  icon        text,
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_name_key
  ON public.payment_methods (lower(name));

CREATE TRIGGER payment_methods_touch BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- appointments — les rendez-vous
-- `services` et `reference_images` sont dénormalisés en JSONB : on fige le prix
-- et le libellé au moment de la réservation pour que l'historique reste juste
-- même si le catalogue change ensuite.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name       text NOT NULL,
  phone             text NOT NULL,
  email             text,
  services          jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{id,name,price,duration}]
  date              date NOT NULL,
  time              text NOT NULL,                        -- 'HH:mm'
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  reference_images  jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{id,url,slot,caption}]
  client_notes      text,
  notes             text,                                 -- note interne, jamais exposée au client
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments (date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments (status);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON public.appointments (client_id);

CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- gallery — réalisations / portfolio (module optionnel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  category    text NOT NULL DEFAULT '',
  image       text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_category_idx ON public.gallery (category);

CREATE TRIGGER gallery_touch BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- reviews — avis clients (module optionnel)
-- `verified` conditionne l'affichage public : un avis déposé n'est visible
-- qu'après validation par l'admin.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text NOT NULL,
  service     text,
  verified    boolean NOT NULL DEFAULT false,
  date        date NOT NULL DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_verified_idx ON public.reviews (verified);

CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- time_slots — créneaux ouverts à la réservation, par date
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.time_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date NOT NULL,
  label       text NOT NULL,               -- 'HH:mm'
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS time_slots_date_label_key
  ON public.time_slots (date, label);
CREATE INDEX IF NOT EXISTS time_slots_date_idx ON public.time_slots (date);

CREATE TRIGGER time_slots_touch BEFORE UPDATE ON public.time_slots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- special_infos — encarts d'information affichés côté public
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.special_infos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text NOT NULL,
  icon        text NOT NULL DEFAULT '✨',
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER special_infos_touch BEFORE UPDATE ON public.special_infos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- appointment_settings — règles d'annulation (singleton)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointment_settings (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cancellation_deadline_hours  integer NOT NULL DEFAULT 24 CHECK (cancellation_deadline_hours >= 0),
  cancellation_deadline_label  text NOT NULL DEFAULT '24 heures',
  allow_cancellation           boolean NOT NULL DEFAULT true,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS appointment_settings_singleton
  ON public.appointment_settings ((true));

CREATE TRIGGER appointment_settings_touch BEFORE UPDATE ON public.appointment_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- loyalty_settings — programme de fidélité (singleton, module optionnel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_visit integer NOT NULL DEFAULT 10 CHECK (points_per_visit >= 0),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_settings_singleton
  ON public.loyalty_settings ((true));

CREATE TRIGGER loyalty_settings_touch BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- reminder_settings / reminders — rappels de rendez-vous (module optionnel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled      boolean NOT NULL DEFAULT true,
  delay_hours  integer NOT NULL DEFAULT 24 CHECK (delay_hours > 0),
  recipients   text NOT NULL DEFAULT 'both' CHECK (recipients IN ('client', 'admin', 'both')),
  admin_phone  text,
  admin_email  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS reminder_settings_singleton
  ON public.reminder_settings ((true));

CREATE TRIGGER reminder_settings_touch BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.reminders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id    uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_name       text NOT NULL,
  client_phone      text NOT NULL,
  client_email      text,
  service_name      text NOT NULL,
  appointment_date  date NOT NULL,
  appointment_time  text NOT NULL,
  scheduled_at      timestamptz NOT NULL,
  recipients        text NOT NULL DEFAULT 'both' CHECK (recipients IN ('client', 'admin', 'both')),
  sent              boolean NOT NULL DEFAULT false,
  sent_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reminders_appointment_id_idx ON public.reminders (appointment_id);
CREATE INDEX IF NOT EXISTS reminders_scheduled_at_idx ON public.reminders (scheduled_at) WHERE NOT sent;
