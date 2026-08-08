/*
# Preset — Cabinet de santé (kinésithérapie, ostéopathie, podologie…)

À exécuter après `seed.sql`.

Galerie, avis et fidélité sont coupés : ils n'ont pas de sens ici, et pour
plusieurs professions réglementées la publicité et les témoignages de
patients sont encadrés, voire interdits. Mieux vaut les désactiver par
défaut que laisser le praticien s'exposer.

Les images de référence restent actives — une ordonnance ou une imagerie
transmise avant la séance a une vraie utilité.
*/

UPDATE public.business_settings SET
  tagline  = 'Prenez rendez-vous en ligne',
  modules  = '{
    "gallery": false, "reviews": false, "loyalty": false, "referenceImages": true,
    "payments": true, "reminders": true, "clientSpace": true,
    "publicAvailability": true, "multiServiceBooking": false, "specialInfos": true
  }'::jsonb,
  labels   = '{
    "customer": {"one": "Patient",     "many": "Patients"},
    "service":  {"one": "Séance",      "many": "Séances"},
    "booking":  {"one": "Rendez-vous", "many": "Rendez-vous"},
    "staff":    {"one": "Praticien",   "many": "Praticiens"},
    "review":   {"one": "Avis",        "many": "Avis"},
    "gallery":  {"one": "Réalisation", "many": "Réalisations"}
  }'::jsonb;

INSERT INTO public.service_categories (name, sort_order) VALUES
  ('Première consultation', 1), ('Suivi', 2), ('Rééducation', 3), ('Bilan', 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.image_slots (key, label, hint, max_files, required, sort_order) VALUES
  ('ordonnance', 'Ordonnance',  'Photographiez la prescription de votre médecin', 2, false, 1),
  ('imagerie',   'Imagerie',    'Radiographie, IRM ou échographie, si vous en avez', 4, false, 2)
ON CONFLICT (key) DO NOTHING;