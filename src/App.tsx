import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { BusinessConfigProvider } from '@/contexts/BusinessConfigContext';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    // La configuration englobe tout : elle pilote le thème, les modules actifs
    // et le vocabulaire, dont dépendent aussi bien les routes que les écrans
    // d'authentification.
    <BusinessConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </BusinessConfigProvider>
  );
}

export default App;
