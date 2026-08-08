import { useBusinessConfig } from '@/contexts/BusinessConfigContext';
import type { LabelKey } from '@/config/labels';

/**
 * Vocabulaire métier.
 *
 *   const t = useLabels();
 *   <h2>Nos {t('service', 'many')}</h2>   // « Nos Prestations » / « Nos Séances »
 *
 * Pour une insertion en milieu de phrase, `lower` évite les majuscules
 * parasites : « Ajouter un {tLower('customer')} ».
 */
export function useLabels() {
  return useBusinessConfig().label;
}

export function useLabel(key: LabelKey, form: 'one' | 'many' = 'one'): string {
  return useBusinessConfig().label(key, form);
}

/** Même chose, en minuscule initiale, pour les usages en milieu de phrase. */
export function useLowerLabel(key: LabelKey, form: 'one' | 'many' = 'one'): string {
  const value = useBusinessConfig().label(key, form);
  return value.charAt(0).toLowerCase() + value.slice(1);
}