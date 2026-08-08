import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { useModules } from '@/hooks/useModules';
import type { ModuleKey } from '@/config/modules';


// `module` absent = lien toujours visible.
const LINKS: { to: string; label: string; module?: ModuleKey }[] = [
  { to: '/', label: 'Accueil' },
  { to: '/prestations', label: 'Prestations' },
  { to: '/galerie', label: 'Galerie', module: 'gallery' },
  { to: '/contact', label: 'Contact' },
  { to: '/disponibilites', label: 'Disponibilités', module: 'publicAvailability' },
];

export default function Navbar() {
  const { settings } = useSettings();
  const isEnabled = useModules();
  const links = LINKS.filter((l) => !l.module || isEnabled(l.module));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-soft'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-primary/20 bg-primary/10 font-display text-lg text-primary">
              {settings.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl font-semibold text-foreground">
              {settings.name}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'relative text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link to="/connexion">Connexion</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/reservation">Prendre rendez-vous</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/60 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-secondary'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Button asChild variant="outline" className="mt-2 rounded-full">
                <Link to="/connexion">Connexion</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/reservation">Prendre rendez-vous</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}