/*
# Réservation publique

La prise de rendez-vous sans compte demande quatre opérations que les
politiques RLS ferment à juste titre : chercher une fiche client par email,
la créer, insérer le rendez-vous, puis relire la ligne créée.

Les ouvrir à `anon` reviendrait à rendre le fichier clients lisible par
Internet. On passe donc par une fonction SECURITY DEFINER, qui expose
exactement l'opération métier voulue et rien de plus.

Deux failles disparaissent au passage :

1. Le tarif. Le client envoyait le tableau `services` avec ses prix. Une
   requête forgée pouvait donc réserver à zéro. Les prix et durées sont
   désormais relus en base et le contenu reçu est ignoré.

2. L'énumération. L'ancien code relisait le rendez-vous en filtrant sur
   nom + téléphone + date + heure. Avec une lecture ouverte à `anon`, cela
   permettait de deviner les rendez-vous d'autrui. La fonction ne renvoie
   que l'identifiant de la ligne qu'elle vient de créer.

La double réservation d'un même créneau est également rejetée ici, côté
serveur — la vérification côté navigateur ne protège de rien.
*/

CREATE OR REPLACE FUNCTION public.create_public_appointment(
  p_client_name       text,
  p_phone             text,
  p_email             text,
  p_service_ids       uuid[],
  p_date              date,
  p_time              text,
  p_payment_method_id uuid    DEFAULT NULL,
  p_reference_images  jsonb   DEFAULT '[]'::jsonb,
  p_client_notes      text    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_services       jsonb;
  v_client_id      uuid;
  v_appointment_id uuid;
  v_reminder       public.reminder_settings%ROWTYPE;
BEGIN
  IF coalesce(trim(p_client_name), '') = '' OR coalesce(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'Nom et téléphone sont requis';
  END IF;

  -- Prix et durées relus en base : ce que le client a envoyé n'est pas utilisé.
  SELECT jsonb_agg(
           jsonb_build_object(
             'id', s.id, 'name', s.name, 'price', s.price, 'duration', s.duration
           )
           ORDER BY s.sort_order, s.name
         )
    INTO v_services
    FROM public.services s
   WHERE s.id = ANY(p_service_ids)
     AND s.active;

  IF v_services IS NULL THEN
    RAISE EXCEPTION 'Aucune prestation valide sélectionnée';
  END IF;

  -- Le créneau doit être ouvert…
  IF NOT EXISTS (
    SELECT 1 FROM public.time_slots ts
     WHERE ts.date = p_date AND ts.label = p_time AND ts.active
  ) THEN
    RAISE EXCEPTION 'Ce créneau n''est pas ouvert à la réservation';
  END IF;

  -- …et encore libre. Contrôle serveur : celui du navigateur ne protège de rien.
  IF EXISTS (
    SELECT 1 FROM public.appointments a
     WHERE a.date = p_date
       AND a.time = p_time
       AND a.status IN ('pending', 'confirmed')
  ) THEN
    RAISE EXCEPTION 'Ce créneau vient d''être réservé';
  END IF;

  -- Fiche client : rattachée si l'email est déjà connu, créée sinon.
  IF coalesce(trim(p_email), '') <> '' THEN
    SELECT c.id INTO v_client_id
      FROM public.clients c
     WHERE lower(c.email) = lower(trim(p_email))
     LIMIT 1;

    IF v_client_id IS NULL THEN
      INSERT INTO public.clients (name, phone, email)
      VALUES (trim(p_client_name), trim(p_phone), trim(p_email))
      RETURNING id INTO v_client_id;
    END IF;
  END IF;

  INSERT INTO public.appointments (
    client_id, client_name, phone, email, services,
    date, time, status, payment_method_id, reference_images, client_notes
  )
  VALUES (
    v_client_id,
    trim(p_client_name),
    trim(p_phone),
    nullif(trim(coalesce(p_email, '')), ''),
    v_services,
    p_date,
    p_time,
    'pending',
    p_payment_method_id,
    coalesce(p_reference_images, '[]'::jsonb),
    nullif(trim(coalesce(p_client_notes, '')), '')
  )
  RETURNING id INTO v_appointment_id;

  -- Le rappel est créé ici plutôt que côté navigateur : ses réglages sont
  -- réservés aux administrateurs, et un visiteur anonyme ne peut pas les lire.
  -- L'opération devient atomique — plus de rendez-vous sans son rappel.
  SELECT * INTO v_reminder FROM public.reminder_settings LIMIT 1;

  IF FOUND AND v_reminder.enabled THEN
    INSERT INTO public.reminders (
      appointment_id, client_name, client_phone, client_email,
      service_name, appointment_date, appointment_time, scheduled_at, recipients
    )
    SELECT
      v_appointment_id,
      trim(p_client_name),
      trim(p_phone),
      nullif(trim(coalesce(p_email, '')), ''),
      (SELECT string_agg(e ->> 'name', ' + ') FROM jsonb_array_elements(v_services) e),
      p_date,
      p_time,
      (p_date + p_time::time) - make_interval(hours => v_reminder.delay_hours),
      v_reminder.recipients;
  END IF;

  RETURN v_appointment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_public_appointment(
  text, text, text, uuid[], date, text, uuid, jsonb, text
) FROM public;

GRANT EXECUTE ON FUNCTION public.create_public_appointment(
  text, text, text, uuid[], date, text, uuid, jsonb, text
) TO anon, authenticated;

/*
# Rappels tenus à jour par la base

Le service côté navigateur supprimait et recréait les rappels à chaque
changement de statut, de date ou d'heure. Trois problèmes :

- il fallait lire `reminder_settings`, réservé aux administrateurs, ce qui
  cassait l'annulation par le client lui-même ;
- entre la suppression et la recréation, le rendez-vous se retrouvait
  momentanément sans rappel ;
- toute autre voie d'écriture (administration, script) contournait la règle.

La base s'en charge désormais, pour tout le monde et en une transaction.
*/
CREATE OR REPLACE FUNCTION public.sync_appointment_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_settings public.reminder_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM public.reminder_settings LIMIT 1;
  IF NOT FOUND OR NOT v_settings.enabled THEN
    DELETE FROM public.reminders WHERE appointment_id = NEW.id AND NOT sent;
    RETURN NEW;
  END IF;

  -- Annulé ou terminé : le rappel n'a plus d'objet.
  IF NEW.status IN ('cancelled', 'completed') THEN
    DELETE FROM public.reminders WHERE appointment_id = NEW.id AND NOT sent;

  -- Déplacé : le rappel suit la nouvelle échéance.
  ELSIF NEW.date IS DISTINCT FROM OLD.date
     OR NEW.time IS DISTINCT FROM OLD.time
     OR NEW.services IS DISTINCT FROM OLD.services THEN
    UPDATE public.reminders
       SET appointment_date = NEW.date,
           appointment_time = NEW.time,
           service_name = (
             SELECT string_agg(e ->> 'name', ' + ') FROM jsonb_array_elements(NEW.services) e
           ),
           scheduled_at = (NEW.date + NEW.time::time)
                          - make_interval(hours => v_settings.delay_hours)
     WHERE appointment_id = NEW.id AND NOT sent;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_sync_reminders
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_reminders();

-- L'insertion directe n'a plus lieu d'être : tout passe par la fonction.
DROP POLICY IF EXISTS appointments_insert_public ON public.appointments;
DROP POLICY IF EXISTS reminders_insert_public ON public.reminders;

-- Un client connecté réserve par le même chemin ; seule l'administration
-- crée encore des rendez-vous directement.
CREATE POLICY appointments_insert_admin ON public.appointments FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());