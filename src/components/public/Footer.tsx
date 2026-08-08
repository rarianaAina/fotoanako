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
    <footer className="px-4 pb-4 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-grid rounded-3xl bg-secondary/60 px-6 py-14 sm:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl">{settings.name}</p>
            {settings.tagline && (
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">{settings.tagline}</p>
            )}
          </div>

          <div>
            <p className="eyebrow">Adresse</p>
            <address className="mt-3 space-y-1 not-italic text-sm">
              {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
              {settings.phone && (
                <p>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="underline-offset-4 transition-colors hover:text-primary hover:underline">
                    {settings.phone}
                  </a>
                </p>
              )}
              {settings.email && (
                <p>
                  <a href={`mailto:${settings.email}`} className="underline-offset-4 transition-colors hover:text-primary hover:underline">
                    {settings.email}
                  </a>
                </p>
              )}
            </address>
          </div>

          {openDays.length > 0 && (
            <div>
              <p className="eyebrow">Horaires</p>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {openDays.map((h) => (
                    <tr key={h.day}>
                      <th scope="row" className="py-0.5 pr-4 text-left font-normal text-muted-foreground">
                        {h.day}
                      </th>
                      <td className="py-0.5 text-right text-xs tabular-nums">
                        {h.open}–{h.close}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="underline-offset-4 transition-colors hover:text-primary hover:underline">
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
                  className="underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}

          <p className="tabular-nums">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}