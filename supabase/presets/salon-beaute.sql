/*
# Preset — Salon de beauté / onglerie / coiffure

À exécuter après `seed.sql`.
Modules : tous actifs. Un salon vit de ses photos et de la fidélisation.
*/

UPDATE public.business_settings SET
  tagline  = 'Prenez rendez-vous en ligne',
  modules  = '{
    "gallery": true, "reviews": true, "loyalty": true, "referenceImages": true,
    "payments": true, "reminders": true, "clientSpace": true,
    "publicAvailability": true, "multiServiceBooking": true, "specialInfos": true
  }'::jsonb,
  labels   = '{
    "customer": {"one": "Client",      "many": "Clients"},
    "service":  {"one": "Prestation",  "many": "Prestations"},
    "booking":  {"one": "Rendez-vous", "many": "Rendez-vous"},
    "staff":    {"one": "Praticien",   "many": "Praticiens"},
    "review":   {"one": "Avis",        "many": "Avis"},
    "gallery":  {"one": "Réalisation", "many": "Réalisations"}
  }'::jsonb;

INSERT INTO public.service_categories (name, sort_order) VALUES
  ('Manucure', 1), ('Pédicure', 2), ('Soins', 3), ('Coiffure', 4), ('Épilation', 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.image_slots (key, label, hint, max_files, required, sort_order) VALUES
  ('inspiration', 'Photos d''inspiration', 'Le rendu que vous souhaitez obtenir', 6, false, 1),
  ('etat-actuel', 'État actuel',           'Une photo de l''existant nous aide à préparer', 4, false, 2)
ON CONFLICT (key) DO NOTHING;

UPDATE public.loyalty_settings
   SET points_per_visit = 10, reward_threshold = 500, reward_label = 'soin offert';