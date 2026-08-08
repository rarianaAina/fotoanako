import { supabase } from '@/lib/supabase';
import { normalizeModules } from '@/config/modules';
import { normalizeLabels } from '@/config/labels';
import type {
  BusinessSettings,
  BusinessHours,
  CurrencyPosition,
  UpdateBusinessSettingsDto,
} from '@/types';

interface BusinessSettingsRow {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  hours: BusinessHours[] | null;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  currency_code: string;
  currency_symbol: string;
  currency_position: string;
  locale: string;
  timezone: string;
  modules: unknown;
  labels: unknown;
  updated_at: string | null;
}

/**
 * Valeurs de repli lorsque la table est vide — au premier démarrage, ou si la
 * requête échoue. L'application doit rester affichable dans tous les cas :
 * une page blanche est un échec bien pire qu'un nom générique.
 */
export const FALLBACK_SETTINGS: BusinessSettings = {
  name: 'Mon entreprise',
  tagline: '',
  description: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  hours: [],
  primaryColor: 'hsl(30 60% 45%)',
  accentColor: 'hsl(35 55% 48%)',
  currencyCode: 'EUR',
  currencySymbol: '€',
  currencyPosition: 'suffix',
  locale: 'fr-FR',
  timezone: 'Europe/Paris',
  modules: normalizeModules(null),
  labels: normalizeLabels(null),
};

function rowToSettings(r: BusinessSettingsRow): BusinessSettings {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    address: r.address,
    phone: r.phone,
    whatsapp: r.whatsapp,
    email: r.email,
    website: r.website ?? undefined,
    facebook: r.facebook ?? undefined,
    instagram: r.instagram ?? undefined,
    tiktok: r.tiktok ?? undefined,
    hours: r.hours ?? [],
    primaryColor: r.primary_color,
    accentColor: r.accent_color,
    logoUrl: r.logo_url ?? undefined,
    faviconUrl: r.favicon_url ?? undefined,
    currencyCode: r.currency_code,
    currencySymbol: r.currency_symbol,
    currencyPosition: (r.currency_position as CurrencyPosition) ?? 'suffix',
    locale: r.locale,
    timezone: r.timezone,
    modules: normalizeModules(r.modules),
    labels: normalizeLabels(r.labels),
    updatedAt: r.updated_at ?? undefined,
  };
}

/** Traduction camelCase → snake_case, champ par champ pour ne rien écraser par mégarde. */
function settingsToRow(data: UpdateBusinessSettingsDto): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const map: Record<keyof UpdateBusinessSettingsDto, string> = {
    name: 'name',
    tagline: 'tagline',
    description: 'description',
    address: 'address',
    phone: 'phone',
    whatsapp: 'whatsapp',
    email: 'email',
    website: 'website',
    facebook: 'facebook',
    instagram: 'instagram',
    tiktok: 'tiktok',
    hours: 'hours',
    primaryColor: 'primary_color',
    accentColor: 'accent_color',
    logoUrl: 'logo_url',
    faviconUrl: 'favicon_url',
    currencyCode: 'currency_code',
    currencySymbol: 'currency_symbol',
    currencyPosition: 'currency_position',
    locale: 'locale',
    timezone: 'timezone',
    modules: 'modules',
    labels: 'labels',
  };

  for (const [key, column] of Object.entries(map)) {
    const value = data[key as keyof UpdateBusinessSettingsDto];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

export const settingsService = {
  async get(): Promise<BusinessSettings> {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return FALLBACK_SETTINGS;

    return rowToSettings(data as BusinessSettingsRow);
  },

  async update(data: UpdateBusinessSettingsDto): Promise<BusinessSettings> {
    const row = settingsToRow(data);

    const { data: existing } = await supabase
      .from('business_settings')
      .select('id')
      .maybeSingle();

    const query = existing
      ? supabase.from('business_settings').update(row).eq('id', existing.id)
      : supabase.from('business_settings').insert(row);

    const { data: saved, error } = await query.select().single();
    if (error) throw error;

    return rowToSettings(saved as BusinessSettingsRow);
  },
};