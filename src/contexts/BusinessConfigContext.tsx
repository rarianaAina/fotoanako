import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsService, FALLBACK_SETTINGS } from '@/services/settingsService';
import { toHslTriplet, readableForeground } from '@/utils/color';
import type { ModuleKey } from '@/config/modules';
import type { LabelKey } from '@/config/labels';
import type { BusinessSettings, UpdateBusinessSettingsDto } from '@/types';

interface BusinessConfigValue {
  settings: BusinessSettings;
  loading: boolean;
  error: string | null;

  /** Un module est-il actif pour ce déploiement ? */
  isEnabled: (module: ModuleKey) => boolean;
  /** Vocabulaire métier, ex. `label('customer')` → « Patient ». */
  label: (key: LabelKey, form?: 'one' | 'many') => string;
  /** Montant formaté selon la devise et la locale du déploiement. */
  formatMoney: (amount: number) => string;

  update: (data: UpdateBusinessSettingsDto) => Promise<void>;
  refresh: () => Promise<void>;
}

const BusinessConfigContext = createContext<BusinessConfigValue | null>(null);

/**
 * Applique le branding au document : variables CSS, titre, description, favicon.
 *
 * Les couleurs sont écrites sur `documentElement`, donc en surcharge des valeurs
 * par défaut de `index.css`. Chaque couleur reçoit aussi son `-foreground`,
 * calculé par contraste : sans cela, un client choisissant une teinte claire
 * obtiendrait du texte blanc illisible.
 */
function applyBranding(settings: BusinessSettings): void {
  const root = document.documentElement;

  const primary = toHslTriplet(settings.primaryColor);
  if (primary) {
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-foreground', readableForeground(primary));
    root.style.setProperty('--ring', primary);
  }

  const accent = toHslTriplet(settings.accentColor);
  if (accent) {
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-foreground', readableForeground(accent));
  }

  if (settings.name) {
    document.title = settings.tagline
      ? `${settings.name} — ${settings.tagline}`
      : settings.name;
  }

  const description = settings.description || settings.tagline;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }

  if (settings.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }
}

export function BusinessConfigProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSettings(await settingsService.get());
      setError(null);
    } catch (e) {
      // On conserve les valeurs de repli : l'application reste utilisable même
      // si la configuration est injoignable.
      setError(e instanceof Error ? e.message : 'Configuration indisponible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    applyBranding(settings);
  }, [settings]);

  const update = useCallback(async (data: UpdateBusinessSettingsDto) => {
    setSettings(await settingsService.update(data));
  }, []);

  const value = useMemo<BusinessConfigValue>(() => {
    const moneyFormatter = new Intl.NumberFormat(settings.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return {
      settings,
      loading,
      error,

      isEnabled: (module) => settings.modules[module] ?? false,

      label: (key, form = 'one') => settings.labels[key][form],

      // On formate le nombre selon la locale, puis on accole le symbole
      // manuellement. `Intl` en mode `currency` produit « MGA 25 000 » pour
      // l'ariary là où l'usage local écrit « 25 000 Ar » : le contrôle
      // explicite du symbole et de sa position évite ce genre d'écart.
      formatMoney: (amount) => {
        const n = moneyFormatter.format(amount);
        const symbol = settings.currencySymbol;
        if (!symbol) return n;
        return settings.currencyPosition === 'prefix' ? `${symbol} ${n}` : `${n} ${symbol}`;
      },

      update,
      refresh: load,
    };
  }, [settings, loading, error, update, load]);

  return (
    <BusinessConfigContext.Provider value={value}>
      {children}
    </BusinessConfigContext.Provider>
  );
}

export function useBusinessConfig(): BusinessConfigValue {
  const ctx = useContext(BusinessConfigContext);
  if (!ctx) {
    throw new Error('useBusinessConfig doit être utilisé dans un BusinessConfigProvider');
  }
  return ctx;
}