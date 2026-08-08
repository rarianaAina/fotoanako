import { useBusinessConfig } from '@/contexts/BusinessConfigContext';
import type { BusinessSettings, UpdateBusinessSettingsDto } from '@/types';

interface UseSettingsReturn {
  settings: BusinessSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (data: UpdateBusinessSettingsDto) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Accès aux réglages de l'entreprise.
 *
 * Lit le contexte partagé au lieu de déclencher sa propre requête : la ligne
 * `business_settings` est un singleton, et l'ancienne implémentation la
 * rechargeait dans chacun des composants qui en avait besoin.
 *
 * `settings` n'est jamais `null` — en cas d'échec, les valeurs de repli
 * prennent le relais et `error` est renseigné.
 */
export function useSettings(): UseSettingsReturn {
  const { settings, loading, error, update, refresh } = useBusinessConfig();
  return { settings, loading, error, updateSettings: update, refresh };
}