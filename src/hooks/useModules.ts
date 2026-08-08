import { useBusinessConfig } from '@/contexts/BusinessConfigContext';
import type { ModuleKey } from '@/config/modules';

/**
 * Un module est-il actif ?
 *
 *   const hasGallery = useModule('gallery');
 *   if (!hasGallery) return null;
 */
export function useModule(module: ModuleKey): boolean {
  return useBusinessConfig().isEnabled(module);
}

/** Variante pour tester plusieurs modules d'un coup. */
export function useModules(): (module: ModuleKey) => boolean {
  return useBusinessConfig().isEnabled;
}