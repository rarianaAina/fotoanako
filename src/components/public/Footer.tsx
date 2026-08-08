import { Link } from 'react-router-dom';
import { CalendarHeart, Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useLabels } from '@/hooks/useLabels';

export default function Footer() {
  const { settings } = useSettings();
  const t = useLabels();

  // ✅ Fonction pour remonter en haut de page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Seuls les réseaux renseignés sont affichés : sans cela, un client sans
  // page Facebook hériterait d'une icône pointant dans le vide.
  const socials = [
    { label: 'Facebook', href: settings.facebook, Icon: Facebook },
    { label: 'Instagram', href: settings.instagram, Icon: Instagram },
    {
      label: 'WhatsApp',
      href: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '',
      Icon: MessageCircle,
    },
  ].filter((s): s is { label: string; href: string; Icon: typeof Facebook } => Boolean(s.href));

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <CalendarHeart className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">{settings.name}</p>
              </div>
            </div>
            {(settings.description || settings.tagline) && (
              <p className="mt-4 text-sm text-muted-foreground">
                {settings.description || settings.tagline}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ['/', 'Accueil'],
                ['/prestations', t('service', 'many')],
                ['/galerie', t('gallery', 'many')],
                ['/contact', 'Contact'],
                ['/reservation', 'Réservation'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={scrollToTop} // ✅ Ajouter le scroll
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>

          {socials.length > 0 && (
            <div>
              <h4 className="font-display text-lg font-semibold">Suivez-nous</h4>
              <div className="mt-4 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}