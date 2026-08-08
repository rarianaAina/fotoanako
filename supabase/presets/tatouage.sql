/*
# Preset — Salon de tatouage / perçage

À exécuter après `seed.sql`.

Le portfolio est ici l'argument commercial principal, et le client arrive
presque toujours avec une référence visuelle. Galerie et images de
référence sont donc centrales.

La réservation multi-prestations est coupée : une séance de tatouage se
réserve seule, sa durée se négocie au projet.
*/

UPDATE public.business_settings SET
  tagline  = 'Réservez votre projet',
  modules  = '{
    "gallery": true, "reviews": true, "loyalty": false, "referenceImages": true,
    "payments": true, "reminders": true, "clientSpace": true,
    "publicAvailability": true, "multiServiceBooking": false, "specialInfos": true
  }'::jsonb,
  labels   = '{
    "customer": {"one": "Client",      "many": "Clients"},
    "service":  {"one": "Projet",      "many": "Projets"},
    "booking":  {"one": "Séance",      "many": "Séances"},
    "staff":    {"one": "Tatoueur",    "many": "Tatoueurs"},
    "review":   {"one": "Avis",        "many": "Avis"},
    "gallery":  {"one": "Réalisation", "many": "Réalisations"}
  }'::jsonb;

INSERT INTO public.service_categories (name, sort_order) VALUES
  ('Petit motif', 1), ('Pièce moyenne', 2), ('Grande pièce', 3),
  ('Retouche', 4), ('Perçage', 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.image_slots (key, label, hint, max_files, required, sort_order) VALUES
  ('inspiration', 'Inspirations', 'Les références visuelles de votre projet', 8, true,  1),
  ('emplacement', 'Emplacement',  'La zone du corps concernée', 4, true,  2),
  ('existant',    'Tatouage existant', 'À renseigner s''il s''agit d''une couverture ou d''une retouche', 4, false, 3)
ON CONFLICT (key) DO NOTHING;