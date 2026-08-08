/*
# Preset — Cours particuliers, école, atelier

À exécuter après `seed.sql`.

Ni galerie ni images de référence : on n'inscrit pas un élève avec une
photo. La fidélité reste active, sous forme de cours offert au bout d'un
certain nombre de séances — un usage courant dans ce secteur.
*/

UPDATE public.business_settings SET
  tagline  = 'Réservez votre cours',
  modules  = '{
    "gallery": false, "reviews": true, "loyalty": true, "referenceImages": false,
    "payments": true, "reminders": true, "clientSpace": true,
    "publicAvailability": true, "multiServiceBooking": false, "specialInfos": true
  }'::jsonb,
  labels   = '{
    "customer": {"one": "Élève",       "many": "Élèves"},
    "service":  {"one": "Cours",       "many": "Cours"},
    "booking":  {"one": "Inscription", "many": "Inscriptions"},
    "staff":    {"one": "Professeur",  "many": "Professeurs"},
    "review":   {"one": "Témoignage",  "many": "Témoignages"},
    "gallery":  {"one": "Réalisation", "many": "Réalisations"}
  }'::jsonb;

INSERT INTO public.service_categories (name, sort_order) VALUES
  ('Cours d''essai', 1), ('Débutant', 2), ('Intermédiaire', 3),
  ('Avancé', 4), ('Préparation examen', 5)
ON CONFLICT DO NOTHING;

UPDATE public.loyalty_settings
   SET points_per_visit = 1, reward_threshold = 10, reward_label = 'cours offert';