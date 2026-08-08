import { useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { ImageSlot } from '@/types';
import type { ReferenceImage } from '@/types';

const MAX_BYTES = 5 * 1024 * 1024;

interface ImageSlotUploadProps {
  slot: ImageSlot;
  images: ReferenceImage[];
  onAdd: (slotKey: string, file: File) => void;
  onRemove: (slotKey: string, imageId: string) => void;
  onCaptionChange: (slotKey: string, imageId: string, caption: string) => void;
}

/**
 * Champ de dépôt d'images pour un emplacement configuré.
 *
 * Déclaré au niveau module, et non dans le composant parent : une fonction
 * composant recréée à chaque rendu produit un nouveau type d'élément, donc
 * un remontage complet — le champ de légende perdait le focus à chaque
 * caractère saisi.
 */
export default function ImageSlotUpload({
  slot,
  images,
  onAdd,
  onRemove,
  onCaptionChange,
}: ImageSlotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const full = images.length >= slot.maxFiles;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onAdd(slot.key, file);
    // Permet de re-sélectionner le même fichier après suppression.
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium">
          {slot.label}
          {slot.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{slot.maxFiles}
        </span>
      </div>
      {slot.hint && <p className="text-xs text-muted-foreground">{slot.hint}</p>}

      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div
            key={img.id}
           
            className="group relative"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/60">
              <img
                src={img.url}
                alt={img.caption || slot.label}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="Retirer l'image"
                onClick={() => onRemove(slot.key, img.id)}
                className="absolute -right-1 -top-1 bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Légende…"
              value={img.caption ?? ''}
              onChange={(e) => onCaptionChange(slot.key, img.id, e.target.value)}
              className="mt-1 w-20 border-b border-transparent bg-transparent text-[10px] transition-colors hover:border-border focus:border-primary focus:outline-none"
            />
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">Ajouter</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

export { MAX_BYTES };