import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store, Clock, Share2, CreditCard, Calendar, Bell, Palette, Tag, Gift, Sparkles, Image,
  ToggleLeft, Languages, Globe, Images,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useModules } from '@/hooks/useModules';
import type { ModuleKey } from '@/config/modules';

/** `module` absent = section toujours disponible. */
const SECTIONS: {
  id: string;
  label: string;
  icon: typeof Store;
  path: string;
  module?: ModuleKey;
}[] = [
  { id: 'general', label: 'Général', icon: Store, path: '/admin/parametres/general' },
  { id: 'hours', label: 'Horaires', icon: Clock, path: '/admin/parametres/horaires' },
  { id: 'social', label: 'Réseaux sociaux', icon: Share2, path: '/admin/parametres/reseaux' },
  { id: 'colors', label: 'Couleurs', icon: Palette, path: '/admin/parametres/couleurs' },
  { id: 'regional', label: 'Devise et région', icon: Globe, path: '/admin/parametres/regional' },
  { id: 'vocabulary', label: 'Vocabulaire', icon: Languages, path: '/admin/parametres/vocabulaire' },
  { id: 'modules', label: 'Modules', icon: ToggleLeft, path: '/admin/parametres/modules' },
  { id: 'categories', label: 'Catégories', icon: Tag, path: '/admin/parametres/categories' },
  { id: 'timeslots', label: 'Créneaux', icon: Clock, path: '/admin/parametres/creneaux' },
  { id: 'cancellation', label: 'Annulation', icon: Calendar, path: '/admin/parametres/annulation' },
  { id: 'payment', label: 'Paiements', icon: CreditCard, path: '/admin/parametres/paiements', module: 'payments' },
  { id: 'reminders', label: 'Rappels', icon: Bell, path: '/admin/parametres/rappels', module: 'reminders' },
  { id: 'loyalty', label: 'Fidélité', icon: Gift, path: '/admin/parametres/fidelite', module: 'loyalty' },
  { id: 'informations', label: 'Infos spéciales', icon: Sparkles, path: '/admin/parametres/informations', module: 'specialInfos' },
  { id: 'images', label: 'Images de référence', icon: Images, path: '/admin/parametres/images', module: 'referenceImages' },
  { id: 'galerie', label: 'Galerie', icon: Image, path: '/admin/parametres/galerie', module: 'gallery' },
];

export default function SettingsLayout() {
  const location = useLocation();
  const isEnabled = useModules();
  const sections = SECTIONS.filter((s) => !s.module || isEnabled(s.module));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personnalisez les informations et l'apparence de votre site.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <NavLink
              key={section.id}
              to={section.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive || (section.id === 'general' && location.pathname === '/admin/parametres')
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </NavLink>
          );
        })}
      </div>

      {/* Contenu de la sous-page */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}