import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { useModules } from '@/hooks/useModules';
import { useLabels } from '@/hooks/useLabels';
import type { ModuleKey } from '@/config/modules';
import type { LabelKey } from '@/config/labels';

// `module` absent = lien toujours visible.
const LINKS: { to: string; label?: string; labelKey?: LabelKey; module?: ModuleKey }[] = [
  { to: '/prestations', labelKey: 'service' },
  { to: '/galerie', labelKey: 'gallery', module: 'gallery' },
  { to: '/disponibilites', label: 'Disponibilités', module: 'publicAvailability' },
  { to: '/contact', label: 'Contact' },
];

/*
 * Bandeau fixe, opaque, posé sur un filet.
 *
 * L'ancienne version devenait translucide au défilement et flottait sur une
 * ombre. Un en-tête n'a pas à changer d'état : il tient la page. Il est donc
 * opaque d'emblée, et seule l'épaisseur du filet inférieur marque le
 * défilement — assez pour détacher le bandeau, trop peu pour se remarquer.
 *
 * Le lien courant est signalé par un trait sous le mot, sans animation
 * partagée : le glissement du soulignement d'un lien à l'autre était joli et
 * parfaitement inutile.
 */
export default function Navbar() {
  const { settings } = useSettings();
  const isEnabled = useModules();
  const t = useLabels();
  const location = useLocation();

  const links = LINKS.filter((l) => !l.module || isEnabled(l.module)).map((l) => ({
    to: l.to,
    label: l.labelKey ? t(l.labelKey, 'many') : (l.label as string),
  }));

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-background transition-[border-color] duration-200',
        scrolled ? 'border-b border-border' : 'border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-grid items-center justify-between gap-8 px-gutter lg:px-gutter-lg">
        {/* Le nom EST le logo. Une pastille ronde à côté du nom faisait double
            emploi ; l'image n'apparaît que si le client en a fourni une. */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="" className="h-7 w-7 object-contain" />
          )}
          <span className="text-base font-semibold tracking-[-0.02em]">{settings.name}</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'relative py-1 text-sm transition-colors',
                  isActive
                    ? 'text-foreground after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <Link
            to="/connexion"
            className="link-underline text-sm text-muted-foreground hover:text-foreground"
          >
            Connexion
          </Link>
          <Button asChild size="sm">
            <Link to="/reservation">Prendre rendez-vous</Link>
          </Button>
        </div>

        <button
          className="-mr-2 grid h-10 w-10 place-items-center text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Le menu mobile n'est pas animé : sur un appui, l'ouverture immédiate
          est plus nette qu'un dépliement de 200 ms. */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col px-gutter py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'border-b border-border py-3.5 text-sm transition-colors last:border-b-0',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 border-t border-border py-4">
              <Button asChild size="lg">
                <Link to="/reservation">Prendre rendez-vous</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/connexion">Connexion</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}