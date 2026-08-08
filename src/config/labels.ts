/**
 * Vocabulaire métier.
 *
 * C'est ce qui permet au même code de servir un salon et un cabinet de
 * kinésithérapie. Sans cette couche, une application pour kiné afficherait
 * « Nos prestations pour nos clientes » — et ne serait pas utilisable.
 *
 * Stocké dans `business_settings.labels`, réglable depuis
 * Réglages → Vocabulaire.
 */

export const LABEL_KEYS = [
  'customer',
  'service',
  'booking',
  'staff',
  'review',
  'gallery',
] as const;

export type LabelKey = (typeof LABEL_KEYS)[number];

export interface Label {
  /** Singulier, ex. « Client ». */
  one: string;
  /** Pluriel, ex. « Clients ». */
  many: string;
}

export type Labels = Record<LabelKey, Label>;

/** Ce que chaque clé désigne — affiché comme aide dans le panneau d'administration. */
export const LABEL_CATALOG: Record<LabelKey, string> = {
  customer: 'La personne qui réserve',
  service: 'Ce que vous vendez',
  booking: 'Le rendez-vous pris',
  staff: 'La personne qui exécute',
  review: 'Le retour laissé par un client',
  gallery: 'Vos réalisations',
};

export const DEFAULT_LABELS: Labels = {
  customer: { one: 'Client', many: 'Clients' },
  service: { one: 'Prestation', many: 'Prestations' },
  booking: { one: 'Rendez-vous', many: 'Rendez-vous' },
  staff: { one: 'Praticien', many: 'Praticiens' },
  review: { one: 'Avis', many: 'Avis' },
  gallery: { one: 'Réalisation', many: 'Réalisations' },
};

/** Complète une valeur venue de la base, potentiellement partielle. */
export function normalizeLabels(raw: unknown): Labels {
  const input = (raw ?? {}) as Partial<Record<string, unknown>>;
  return LABEL_KEYS.reduce((acc, key) => {
    const value = input[key] as Partial<Label> | undefined;
    acc[key] = {
      one: typeof value?.one === 'string' && value.one ? value.one : DEFAULT_LABELS[key].one,
      many: typeof value?.many === 'string' && value.many ? value.many : DEFAULT_LABELS[key].many,
    };
    return acc;
  }, {} as Labels);
}