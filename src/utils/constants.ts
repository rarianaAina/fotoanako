import type { AppointmentStatus } from '@/types/appointment';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/**
 * Couleur du point d'état.
 *
 * L'état est porté par un point, pas par un fond teinté sur toute l'étiquette.
 * Sur une liste de trente rendez-vous, quatre couleurs de fond en aplat
 * transforment le tableau en damier ; quatre points de 6 px se lisent en
 * balayant la colonne.
 *
 * Les teintes sont désaturées et sombres pour tenir sur fond papier sans
 * vibrer, et restent distinguables en vision dichromate — le confirmé et
 * l'annulé s'opposent en clarté, pas seulement en teinte.
 */
export const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: 'bg-[hsl(38_82%_46%)]',
  confirmed: 'bg-[hsl(158_58%_30%)]',
  completed: 'bg-[hsl(30_5%_55%)]',
  cancelled: 'bg-[hsl(4_66%_46%)]',
};

/**
 * Variante en aplat, pour les rares emplacements où l'étiquette doit être
 * repérable sans lecture — le calendrier, où les libellés sont tronqués.
 */
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-[hsl(38_82%_94%)] text-[hsl(38_82%_26%)]',
  confirmed: 'bg-[hsl(158_40%_92%)] text-[hsl(158_58%_20%)]',
  completed: 'bg-secondary text-muted-foreground',
  cancelled: 'bg-[hsl(4_60%_95%)] text-[hsl(4_66%_34%)]',
};

export const GALLERY_CATEGORIES = ['Toutes'] as const;

/**
 * Teintes proposées à l'administration.
 *
 * Toutes profondes et peu saturées : sur une page presque monochrome, l'accent
 * n'apparaît que sur un bouton et deux ou trois détails. Une couleur claire ou
 * fluorescente y perdrait sa lisibilité et son autorité. Le contraste avec le
 * blanc est vérifié pour chacune.
 */
export const COLOR_PRESETS = [
  { name: 'Terre cuite', primary: 'hsl(12 68% 44%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Encre', primary: 'hsl(222 47% 28%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Forêt', primary: 'hsl(158 48% 24%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Bordeaux', primary: 'hsl(348 58% 34%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Prune', primary: 'hsl(285 32% 34%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Ardoise', primary: 'hsl(205 25% 30%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Ocre', primary: 'hsl(35 72% 36%)', accent: 'hsl(30 8% 11%)' },
  { name: 'Olive', primary: 'hsl(78 34% 28%)', accent: 'hsl(30 8% 11%)' },
] as const;