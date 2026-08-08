import { useBusinessConfig } from '@/contexts/BusinessConfigContext';

/**
 * Formateur monétaire du déploiement.
 *
 *   const money = useMoney();
 *   money(25000)   // « 25 000 € », « 25 000 Ar », « $ 25,000 »…
 *
 * Remplace l'ancien `formatAriary`, qui codait en dur la locale `fr-FR` et le
 * symbole `€` — malgré son nom.
 */
export function useMoney(): (amount: number) => string {
  return useBusinessConfig().formatMoney;
}