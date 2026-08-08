import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ConfigurationError from './components/ConfigurationError.tsx';
import { isSupabaseConfigured, missingEnvVars } from './lib/supabase.ts';
import './index.css';

// Sans configuration, l'application ne peut rien afficher d'utile. Mieux vaut
// un écran qui explique quoi faire qu'une page blanche et une erreur en console.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? <App /> : <ConfigurationError missing={missingEnvVars} />}
  </StrictMode>,
);