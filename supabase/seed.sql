/*
# Amorçage générique

À exécuter une fois, après les migrations, sur une base vierge.
Crée les lignes singleton et un jeu de valeurs neutres — aucun métier.

Pour un déploiement réel, enchaînez ensuite avec un preset :
`supabase/presets/<métier>.sql`. Chaque preset écrase ces valeurs par
celles de son secteur.

Ce fichier est réexécutable : rien n'est dupliqué à la seconde exécution.
*/

-- ---------------------------------------------------------------------------
-- Singletons
-- ---------------------------------------------------------------------------
INSERT INTO public.business_settings (name, tagline, description)
SELECT 'Mon entreprise', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.business_settings);

INSERT INTO public.appointment_settings (cancellation_deadline_hours, cancellation_deadline_label)
SELECT 24, '24 heures'
WHERE NOT EXISTS (SELECT 1 FROM public.appointment_settings);

INSERT INTO public.loyalty_settings (points_per_visit, reward_threshold, reward_label)
SELECT 10, 500, 'récompense'
WHERE NOT EXISTS (SELECT 1 FROM public.loyalty_settings);

INSERT INTO public.reminder_settings (enabled, delay_hours, recipients)
SELECT true, 24, 'both'
WHERE NOT EXISTS (SELECT 1 FROM public.reminder_settings);

-- ---------------------------------------------------------------------------
-- Horaires : semaine ouvrée, à ajuster depuis l'administration
-- ---------------------------------------------------------------------------
UPDATE public.business_settings
   SET hours = '[
         {"day": "Lundi",    "open": "09:00", "close": "18:00"},
         {"day": "Mardi",    "open": "09:00", "close": "18:00"},
         {"day": "Mercredi", "open": "09:00", "close": "18:00"},
         {"day": "Jeudi",    "open": "09:00", "close": "18:00"},
         {"day": "Vendredi", "open": "09:00", "close": "18:00"},
         {"day": "Samedi",   "open": "09:00", "close": "13:00"},
         {"day": "Dimanche", "open": "00:00", "close": "00:00", "closed": true}
       ]'::jsonb
 WHERE hours = '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Moyens de paiement
-- ---------------------------------------------------------------------------
INSERT INTO public.payment_methods (name, label, icon, sort_order)
VALUES ('especes', 'Espèces', '💵', 1),
       ('carte',   'Carte bancaire', '💳', 2),
       ('virement','Virement', '🏦', 3)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Créneaux : les trente prochains jours, toutes les 30 minutes, hors dimanche.
-- L'administration les ajuste ensuite jour par jour.
-- ---------------------------------------------------------------------------
INSERT INTO public.time_slots (date, label, sort_order)
SELECT d::date,
       to_char(t, 'HH24:MI'),
       (EXTRACT(HOUR FROM t) * 60 + EXTRACT(MINUTE FROM t))::int
  FROM generate_series(current_date, current_date + 30, '1 day')      AS d,
       generate_series('09:00'::time, '17:30'::time, '30 minutes')    AS t
 WHERE EXTRACT(ISODOW FROM d) <> 7
ON CONFLICT (date, label) DO NOTHING;

/*
# Après ce fichier

1. Créez le compte administrateur depuis l'application (page Inscription).
2. Promouvez-le, une seule fois, depuis l'éditeur SQL :

     UPDATE public.users SET role = 'admin' WHERE email = 'vous@exemple.fr';

   La promotion ne peut pas se faire depuis l'application : un déclencheur
   interdit à un compte de s'attribuer le rôle admin lui-même.
*/