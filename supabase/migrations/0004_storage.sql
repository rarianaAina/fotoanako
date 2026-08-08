/*
# Stockage des images

Un seul bucket public, `images`, organisé par dossier :

  logos/         logo, favicon, visuel d'accueil
  services/      illustrations du catalogue
  gallery/       réalisations
  appointments/  images de référence jointes par le client

Le bucket est public en lecture : les images s'affichent sur le site vitrine
sans authentification. L'écriture, elle, est cloisonnée.

Le point délicat est `appointments/` : la réservation sans compte permet de
joindre des photos, donc un visiteur anonyme doit pouvoir y téléverser. On
lui ouvre l'insertion dans ce seul dossier — ni ailleurs, ni en écrasement,
ni en suppression. Sans cela, un visiteur pourrait remplacer le logo de
l'entreprise.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,  -- 5 Mo, aligné sur la limite appliquée côté formulaire
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS images_public_read   ON storage.objects;
DROP POLICY IF EXISTS images_admin_write   ON storage.objects;
DROP POLICY IF EXISTS images_booking_upload ON storage.objects;

-- Lecture : ouverte, c'est le propre d'un site vitrine.
CREATE POLICY images_public_read ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

-- Écriture : réservée à l'administration.
CREATE POLICY images_admin_write ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'images' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND public.is_admin());

-- Exception : les images de référence d'une réservation, en insertion seule
-- et confinées à leur dossier.
CREATE POLICY images_booking_upload ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'appointments'
  );