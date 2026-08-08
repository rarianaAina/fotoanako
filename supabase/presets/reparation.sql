/*
# Preset — Atelier de réparation (garage, informatique, électroménager…)

À exécuter après `seed.sql`.

Le cas où les images de référence pèsent le plus : une photo des dégâts ou
du numéro de série évite un aller-retour et permet souvent de chiffrer avant
même la prise en charge. Les deux emplacements sont obligatoires.

Ni galerie ni fidélité : on ne revient pas régulièrement chez un réparateur,
et il n'expose pas de portfolio.
*/

UPDATE public.business_settings SET
  tagline  = 'Prenez rendez-vous en ligne',
  modules  = '{
    "gallery": false, "reviews": true, "loyalty": false, "referenceImages": true,
    "payments": true, "reminders": true, "clientSpace": true,
    "publicAvailability": true, "multiServiceBooking": true, "specialInfos": true
  }'::jsonb,
  labels   = '{
    "customer": {"one": "Client",      "many": "Clients"},
    "service":  {"one": "Intervention","many": "Interventions"},
    "booking":  {"one": "Rendez-vous", "many": "Rendez-vous"},
    "staff":    {"one": "Technicien",  "many": "Techniciens"},
    "review":   {"one": "Avis",        "many": "Avis"},
    "gallery":  {"one": "Réalisation", "many": "Réalisations"}
  }'::jsonb;

INSERT INTO public.service_categories (name, sort_order) VALUES
  ('Diagnostic', 1), ('Réparation', 2), ('Entretien', 3), ('Devis', 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.image_slots (key, label, hint, max_files, required, sort_order) VALUES
  ('probleme',    'Le problème',    'Photographiez la panne ou les dégâts', 6, true, 1),
  ('identification', 'Identification', 'Plaque, numéro de série ou référence de l''appareil', 2, true, 2)
ON CONFLICT (key) DO NOTHING;