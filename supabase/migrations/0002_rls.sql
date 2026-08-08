/*
# Fotoanako — Row Level Security

Principe directeur : la clé publishable est embarquée dans le bundle JS, donc
publique. Tout ce qu'`anon` peut faire, n'importe qui sur Internet peut le faire.
Les politiques ci-dessous partent donc du refus et n'ouvrent que le strict
nécessaire.

Trois cercles :
  1. Vitrine publique  — lecture seule, uniquement les contenus destinés à être vus
                         (catalogue actif, galerie, avis validés, horaires).
  2. Client connecté   — lit et gère ses propres données, rien d'autre.
  3. Admin             — accès complet.

Deux écritures sont ouvertes à `anon`, car indispensables au produit :
  - créer un rendez-vous (réservation sans compte) ;
  - déposer un avis (forcé en non validé par un déclencheur).
*/

-- ---------------------------------------------------------------------------
-- Fonctions d'aide
--
-- SECURITY DEFINER est indispensable : ces fonctions lisent `public.users`,
-- table elle-même protégée par RLS. Sans cela, toute politique les appelant
-- déclencherait une récursion infinie.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Identifiant de la fiche client rattachée à l'utilisateur connecté.
CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
REVOKE EXECUTE ON FUNCTION public.current_client_id() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_client_id() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Activation de RLS sur toutes les tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_slots          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_infos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders            ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users
--
-- Un utilisateur lit et modifie son propre profil ; l'admin voit tout.
-- L'escalade de privilège est bloquée par déclencheur, pas par politique :
-- une politique WITH CHECK ne peut pas comparer l'ancienne et la nouvelle
-- valeur de `role`.
-- ---------------------------------------------------------------------------
CREATE POLICY users_select_self ON public.users FOR SELECT
  TO authenticated USING (id = auth.uid() OR public.is_admin());

CREATE POLICY users_insert_self ON public.users FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY users_update_self ON public.users FOR UPDATE
  TO authenticated USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY users_delete_admin ON public.users FOR DELETE
  TO authenticated USING (public.is_admin());

-- Empêche un compte de s'attribuer le rôle admin.
CREATE OR REPLACE FUNCTION public.guard_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Une inscription crée toujours un client, jamais un admin.
    IF NOT public.is_admin() THEN
      NEW.role := 'client';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Modification du rôle interdite';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_guard_role
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_role();

-- ---------------------------------------------------------------------------
-- Contenus de vitrine : lecture publique, écriture réservée à l'admin.
-- ---------------------------------------------------------------------------

-- business_settings : lisible par tous (le site public en a besoin pour
-- s'afficher). Ne doit donc jamais accueillir de secret.
CREATE POLICY business_settings_read ON public.business_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY business_settings_write ON public.business_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY service_categories_read ON public.service_categories FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY service_categories_write ON public.service_categories FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY services_read ON public.services FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY services_write ON public.services FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY gallery_read ON public.gallery FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY gallery_write ON public.gallery FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY payment_methods_read ON public.payment_methods FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY payment_methods_write ON public.payment_methods FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY time_slots_read ON public.time_slots FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY time_slots_write ON public.time_slots FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY special_infos_read ON public.special_infos FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY special_infos_write ON public.special_infos FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY image_slots_read ON public.image_slots FOR SELECT
  TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY image_slots_write ON public.image_slots FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY appointment_settings_read ON public.appointment_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY appointment_settings_write ON public.appointment_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY loyalty_settings_read ON public.loyalty_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY loyalty_settings_write ON public.loyalty_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews — dépôt public, publication après validation
-- ---------------------------------------------------------------------------
CREATE POLICY reviews_read_verified ON public.reviews FOR SELECT
  TO anon, authenticated USING (verified OR public.is_admin());

CREATE POLICY reviews_insert_public ON public.reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY reviews_update_admin ON public.reviews FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reviews_delete_admin ON public.reviews FOR DELETE
  TO authenticated USING (public.is_admin());

-- Un avis déposé publiquement ne peut pas s'auto-valider.
CREATE OR REPLACE FUNCTION public.guard_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.verified := false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_guard_verified
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.guard_review_verified();

-- ---------------------------------------------------------------------------
-- clients — données personnelles : jamais exposées publiquement
-- ---------------------------------------------------------------------------
CREATE POLICY clients_select_own ON public.clients FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY clients_update_own ON public.clients FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY clients_insert_admin ON public.clients FOR INSERT
  TO authenticated WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY clients_delete_admin ON public.clients FOR DELETE
  TO authenticated USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- appointments
--
-- La réservation sans compte impose d'ouvrir l'INSERT à `anon`. En revanche
-- la lecture reste fermée : un visiteur anonyme ne peut pas relire les
-- rendez-vous des autres. La disponibilité des créneaux passe par la vue
-- `public_busy_slots` ci-dessous, qui n'expose aucune donnée personnelle.
-- ---------------------------------------------------------------------------
CREATE POLICY appointments_insert_public ON public.appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY appointments_select_own ON public.appointments FOR SELECT
  TO authenticated USING (
    public.is_admin() OR client_id = public.current_client_id()
  );

CREATE POLICY appointments_update_own ON public.appointments FOR UPDATE
  TO authenticated USING (
    public.is_admin() OR client_id = public.current_client_id()
  ) WITH CHECK (
    public.is_admin() OR client_id = public.current_client_id()
  );

CREATE POLICY appointments_delete_admin ON public.appointments FOR DELETE
  TO authenticated USING (public.is_admin());

-- Créneaux déjà pris, sans aucune donnée personnelle : c'est tout ce dont
-- la page de réservation publique a besoin.
-- La vue s'exécute avec les droits de son propriétaire, ce qui court-circuite
-- volontairement la RLS de `appointments` : c'est ce qui permet d'exposer les
-- créneaux occupés sans ouvrir la table. C'est le comportement par défaut —
-- ne pas y ajouter `security_invoker`, qui l'annulerait.
CREATE OR REPLACE VIEW public.public_busy_slots AS
  SELECT date, time
  FROM public.appointments
  WHERE status IN ('pending', 'confirmed');

GRANT SELECT ON public.public_busy_slots TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- reminders — usage strictement interne
-- ---------------------------------------------------------------------------
CREATE POLICY reminder_settings_read_admin ON public.reminder_settings FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY reminder_settings_write_admin ON public.reminder_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reminders_read_admin ON public.reminders FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY reminders_write_admin ON public.reminders FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Le rappel est créé au moment de la réservation, donc potentiellement par
-- un visiteur anonyme. On autorise l'insertion seule, jamais la lecture.
CREATE POLICY reminders_insert_public ON public.reminders FOR INSERT
  TO anon, authenticated WITH CHECK (true);