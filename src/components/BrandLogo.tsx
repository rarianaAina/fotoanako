import { cn } from '@/utils/cn';
import { useSettings } from '@/hooks/useSettings';

interface BrandLogoProps {
  /** Diamètre en unités Tailwind (10 → h-10 w-10). */
  size?: 9 | 10 | 12;
  className?: string;
}

const SIZES = {
  9: { box: 'h-9 w-9', text: 'text-base' },
  10: { box: 'h-10 w-10', text: 'text-lg' },
  12: { box: 'h-12 w-12', text: 'text-xl' },
} as const;

/**
 * Marque visuelle du déploiement : le logo configuré, ou l'initiale du nom.
 *
 * Chaque écran répétait ce bloc avec une URL codée en dur. Le repli sur
 * l'initiale évite l'image cassée tant qu'aucun logo n'a été téléversé — cas
 * garanti au premier démarrage de chaque nouveau client.
 */
export default function BrandLogo({ size = 10, className }: BrandLogoProps) {
  const { settings } = useSettings();
  const { box, text } = SIZES[size];

  if (settings.logoUrl) {
    return (
      <img
        src={settings.logoUrl}
        alt={settings.name}
        className={cn(box, 'rounded-full border-2 border-primary/20 object-cover', className)}
      />
    );
  }

  return (
    <span
      className={cn(
        box,
        text,
        'grid place-items-center rounded-full border-2 border-primary/20 bg-primary/10 font-display text-primary',
        className,
      )}
      aria-label={settings.name}
    >
      {settings.name.charAt(0).toUpperCase()}
    </span>
  );
}