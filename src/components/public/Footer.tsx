import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useLabels } from '@/hooks/useLabels';
import { useModules } from '@/hooks/useModules';

/*
 * Pied de page en colophon.
 *
 * Quatre colonnes égales et un titre « Navigation » disparaissent : c'est la
 * disposition de tous les pieds de page générés. Ici l'information suit son
 * ordre d'utilité — où venir, quand, comment joindre — dans une grille
 * asymétrique, et les liens tiennent sur une ligne en bas.
 *
 * Les horaires sont un tableau, parce que ce sont des données à comparer
 * ligne à ligne, pas une phrase.
 */
export default function Footer() {
  const { settings } = useSettings();
  const t = useLabels();
  const isEnabled = useModules();

  const socials = [
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
    { label: 'TikTok', href: settings.tiktok },
    {
      label: 'WhatsApp',
      href: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '',
    },
    { label: 'Site', href: settings.website },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  const links = [
    { to: '/prestations', label: t('service', 'many') },
    isEnabled('gallery') && { to: '/galerie', label: t('gallery', 'many') },
    isEnabled('publicAvailability') && { to: '/disponibilites', label: 'Disponibilités' },
    { to: '/contact', label: 'Contact' },
    { to: '/reservation', label: 'Réservation' },
  ].filter(Boolean) as { to: string; label: string }[];

  const openDays = settings.hours.filter((h) => !h.closed);

  return (
    <footer className="mt-24 border-t border-border-strong">
      <div className="mx-auto max-w-grid px-gutter py-16 lg:px-gutter-lg">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.02em]">{settings.name}</p>
            {settings.tagline && (
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">{settings.tagline}</p>
            )}
          </div>

          <div>
            <p className="label-mono">Adresse</p>
            <address className="mt-3 space-y-1 not-italic text-sm">
              {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
              {settings.phone && (
                <p>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="link-underline">
                    {settings.phone}
                  </a>
                </p>
              )}
              {settings.email && (
                <p>
                  <a href={`mailto:${settings.email}`} className="link-underline">
                    {settings.email}
                  </a>
                </p>
              )}
            </address>
          </div>

          {openDays.length > 0 && (
            <div>
              <p className="label-mono">Horaires</p>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {openDays.map((h) => (
                    <tr key={h.day}>
                      <th scope="row" className="py-0.5 pr-4 text-left font-normal text-muted-foreground">
                        {h.day}
                      </th>
                      <td className="figure py-0.5 text-right text-xs">
                        {h.open}–{h.close}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="link-underline hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>

          {socials.length > 0 && (
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}

          <p className="figure">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}