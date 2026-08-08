/**
 * Emplacement d'image demandé au client lors de la réservation.
 *
 * Remplace le trio figé « main gauche / main droite / inspiration ».
 * Un tatoueur configurera « emplacement » et « inspiration », un
 * kinésithérapeute « ordonnance », un carrossier « dégâts ».
 */
export interface ImageSlot {
  id: string;
  /** Identifiant stable stocké dans les rendez-vous. Ne pas modifier après coup. */
  key: string;
  label: string;
  hint?: string;
  maxFiles: number;
  required: boolean;
  sortOrder: number;
  active: boolean;
}

export interface CreateImageSlotDto {
  key: string;
  label: string;
  hint?: string;
  maxFiles?: number;
  required?: boolean;
  sortOrder?: number;
}

export type UpdateImageSlotDto = Partial<Omit<ImageSlot, 'id'>>;