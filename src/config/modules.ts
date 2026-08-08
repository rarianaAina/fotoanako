/**
 * Modules activables.
 *
 * Chaque module regroupe un bloc fonctionnel complet : ses routes, son entrée
 * de menu et ses sections de page apparaissent ou disparaissent ensemble.
 * L'état est stocké dans `business_settings.modules`, et se règle depuis
 * Réglages → Modules.
 *
 * Un kinésithérapeute coupe `gallery` et `loyalty` ; un tatoueur garde
 * `gallery` et `referenceImages` ; un salon garde tout.
 */

export const MODULE_KEYS = [
  'gallery',
  'reviews',
  'loyalty',
  'referenceImages',
  'payments',
  'reminders',
  'clientSpace',
  'publicAvailability',
  'multiServiceBooking',
  'specialInfos',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export type Modules = Record<ModuleKey, boolean>;

interface ModuleDescriptor {
  /** Libellé affiché dans le panneau d'administration. */
  label: string;
  /** Ce que le module apporte, formulé pour le gérant, pas pour le développeur. */
  description: string;
  /** Ce qui disparaît si le module est coupé. */
  affects: string;
}

export const MODULE_CATALOG: Record<ModuleKey, ModuleDescriptor> = {
  gallery: {
    label: 'Galerie',
    description: 'Portfolio public de vos réalisations, avec catégories.',
    affects: 'Page Galerie, gestion de la galerie en administration.',
  },
  reviews: {
    label: 'Avis clients',
    description: 'Recueil et affichage des avis, après validation de votre part.',
    affects: 'Section avis sur l’accueil, dépôt d’avis, modération.',
  },
  loyalty: {
    label: 'Fidélité',
    description: 'Points cumulés à chaque visite, visibles par le client.',
    affects: 'Compteur de points, réglages de fidélité.',
  },
  referenceImages: {
    label: 'Images de référence',
    description:
      'Le client joint des photos à sa réservation. Les emplacements demandés se configurent librement.',
    affects: 'Étape photos de la réservation, visualisation côté administration.',
  },
  payments: {
    label: 'Moyens de paiement',
    description: 'Le client indique comment il souhaite régler.',
    affects: 'Choix du paiement à la réservation, réglages des moyens de paiement.',
  },
  reminders: {
    label: 'Rappels',
    description: 'Rappels de rendez-vous programmés avant l’échéance.',
    affects: 'Page Rappels, réglages des rappels.',
  },
  clientSpace: {
    label: 'Espace client',
    description: 'Compte personnel : historique des rendez-vous et fidélité.',
    affects: 'Inscription, connexion, espace client.',
  },
  publicAvailability: {
    label: 'Disponibilités publiques',
    description: 'Page listant les créneaux libres, consultable sans réserver.',
    affects: 'Page Disponibilités et son entrée de menu.',
  },
  multiServiceBooking: {
    label: 'Réservation multi-prestations',
    description: 'Plusieurs prestations cumulables dans un même rendez-vous.',
    affects:
      'Sélection multiple à la réservation. Désactivé, une réservation porte sur une seule prestation.',
  },
  specialInfos: {
    label: 'Informations spéciales',
    description: 'Encarts libres affichés sur le site public (promotions, congés…).',
    affects: 'Encarts d’information, réglages associés.',
  },
};

/**
 * Tout est actif par défaut. Un preset métier restreint ensuite, plutôt que
 * l'inverse : un module oublié reste visible, ce qui se remarque — alors qu'un
 * module manquant par défaut passerait inaperçu.
 */
export const DEFAULT_MODULES: Modules = MODULE_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: true }),
  {} as Modules,
);

/** Complète une valeur venue de la base, potentiellement partielle ou obsolète. */
export function normalizeModules(raw: unknown): Modules {
  const input = (raw ?? {}) as Partial<Record<string, unknown>>;
  return MODULE_KEYS.reduce((acc, key) => {
    const value = input[key];
    acc[key] = typeof value === 'boolean' ? value : DEFAULT_MODULES[key];
    return acc;
  }, {} as Modules);
}