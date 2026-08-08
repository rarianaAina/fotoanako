import type { Modules } from '@/config/modules';
import type { Labels } from '@/config/labels';

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ColorPreset {
  name: string;
  primary: string;
  accent: string;
}

export type CurrencyPosition = 'prefix' | 'suffix';

/**
 * Ligne unique de `business_settings` : tout ce qui distingue un déploiement
 * d'un autre. Cette table est lisible publiquement — n'y placez aucun secret.
 */
export interface BusinessSettings {
  id?: string;

  // Identité
  name: string;
  tagline: string;
  description: string;

  // Contact
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;

  hours: BusinessHours[];

  // Branding
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Régionalisation
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: CurrencyPosition;
  locale: string;
  timezone: string;

  modules: Modules;
  labels: Labels;

  updatedAt?: string;
}

export type UpdateBusinessSettingsDto = Partial<Omit<BusinessSettings, 'id' | 'updatedAt'>>;