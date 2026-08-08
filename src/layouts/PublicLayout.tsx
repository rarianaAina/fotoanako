import { Outlet } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {/* Décalage de la hauteur exacte du bandeau fixe, une fois pour toutes :
          chaque page compensait la sienne, avec des valeurs divergentes. */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
