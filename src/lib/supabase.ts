import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * La configuration est-elle exploitable ?
 *
 * `main.tsx` s'en sert pour afficher un écran explicite plutôt que de laisser
 * l'application démarrer sans base. Cette version ne lève pas d'exception :
 * un `throw` au chargement du module produisait une page blanche, avec
 * l'explication reléguée dans la console — introuvable pour qui déploie sans
 * l'avoir ouverte.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const missingEnvVars = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean) as string[];

if (!isSupabaseConfigured) {
  console.error(
    'Configuration Supabase incomplète. Variables manquantes :',
    missingEnvVars.join(', '),
  );
}

export const supabase = createClient(
  // Valeurs de repli syntaxiquement valides : elles évitent que createClient
  // échoue avant que l'écran de configuration ait pu s'afficher.
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'fotoanako-auth',
    },
  },
);

/** Vérification manuelle de la connexion, utile au diagnostic. */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('business_settings').select('id').limit(1);
    if (error) {
      console.error('Connexion Supabase impossible :', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Connexion Supabase impossible :', error);
    return false;
  }
};