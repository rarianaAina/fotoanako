import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useServiceCatalog } from '@/hooks/useServiceCatalog';
import { useSettings } from '@/hooks/useSettings';
import { useSpecialInfos } from '@/hooks/useSpecialInfos';
import { useMoney } from '@/hooks/useMoney';
import { useLabels } from '@/hooks/useLabels';
import { useModules } from '@/hooks/useModules';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types';

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, '0')}`;
};

export default function Home() {
  const { settings } = useSettings();
  const { services } = useServiceCatalog();
  const { infos: specialInfos } = useSpecialInfos();
  const money = useMoney();
  const t = useLabels();
  const isEnabled = useModules();

  const [gallery, setGallery] = useState<Pick<GalleryItem, 'id' | 'title' | 'image'>[]>([]);

  useEffect(() => {
    if (!isEnabled('gallery')) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image')
        .order('created_at', { ascending: false })
        .limit(6);
      if (mounted) setGallery(data ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, [isEnabled]);

  const featured = services.filter((s) => s.active).slice(0, 4);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const todayHours = settings.hours.find((h) => h.day.toLowerCase() === today.toLowerCase());

  return (
    <>
      {/*
        Le visuel occupe presque tout l'écran, arrondi et détaché du bord —
        un cadre posé sur l'ivoire, pas une bannière collée en haut de page.
        Le texte se pose dessus, en bas à gauche, protégé par un voile
        dégradé : on ne maîtrise pas la photo que le client téléversera.
      */}
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-[100rem]">
          <div
            className={cn(
              'frame frame-veil h-[min(84vh,46rem)] rounded-3xl',
              !settings.heroImageUrl && 'frame-empty',
            )}
          >
            {settings.heroImageUrl && (
              <img
                src={settings.heroImageUrl}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Contenu en superposition, pas dans le flux : la hauteur du cadre
              reste maîtrisée quelle que soit la longueur du texte. */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <div className="max-w-3xl">
              {settings.tagline && (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                  {settings.tagline}
                </p>
              )}
              <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl lg:text-6xl">
                {settings.name}
              </h1>
              {settings.description && (
                <p className="mt-5 max-w-prose text-base text-white/85 sm:text-lg">
                  {settings.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/reservation">
                    Prendre rendez-vous
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20"
                >
                  <Link to="/prestations">Voir les {t('service', 'many').toLowerCase()}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau pratique : trois faits utiles, sur des surfaces sable. */}
      <section className="mx-auto max-w-grid px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {todayHours && (
            <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-5 py-4">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm">
                {todayHours.closed ? (
                  <>Fermé aujourd&apos;hui</>
                ) : (
                  <>
                    Ouvert aujourd&apos;hui{' '}
                    <span className="font-semibold">
                      {todayHours.open}–{todayHours.close}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
          {settings.address && (
            <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-5 py-4">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <p className="truncate text-sm">{settings.address}</p>
            </div>
          )}
          {settings.phone && (
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-5 py-4 transition-colors hover:bg-accent"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm font-medium">{settings.phone}</p>
            </a>
          )}
        </div>
      </section>

      {/*
        Catalogue en cartes photographiques : ici l'image compte autant que le
        prix, on choisit une prestation en la voyant. Format portrait, tarif
        posé en gélule sur le coin de l'image.
      */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-grid px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Notre carte</p>
              <h2 className="mt-2 font-display text-3xl lg:text-4xl">{t('service', 'many')}</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/prestations">
                Tout voir <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((s) => (
              <Link key={s.id} to="/reservation" className="group">
                <div className={cn('frame aspect-[4/5]', !s.image && 'frame-empty')}>
                  {s.image && <img src={s.image} alt={s.name} loading="lazy" decoding="async" />}
                  <span className="absolute right-3 top-3 rounded-pill bg-card/92 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
                    {s.price === 0 ? 'Devis' : money(s.price)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg transition-colors group-hover:text-primary">
                  {s.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{formatDuration(s.duration)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isEnabled('specialInfos') && specialInfos.length > 0 && (
        <section className="mx-auto max-w-grid px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {specialInfos.slice(0, 3).map((info) => (
              <div key={info.id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <span aria-hidden className="text-2xl">
                  {info.icon}
                </span>
                <h3 className="mt-3 font-display text-lg">{info.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{info.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*
        Mosaïque irrégulière : la première image occupe deux colonnes et deux
        rangées. Une grille de vignettes identiques met tout sur le même plan ;
        ici la composition a un point d'entrée.
      */}
      {isEnabled('gallery') && gallery.length > 0 && (
        <section className="mx-auto max-w-grid px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Nos réalisations</p>
              <h2 className="mt-2 font-display text-3xl lg:text-4xl">{t('gallery', 'many')}</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/galerie">
                Tout voir <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid auto-rows-[10rem] grid-cols-2 gap-4 sm:auto-rows-[12rem] lg:grid-cols-4">
            {gallery.slice(0, 6).map((g, i) => (
              <Link
                key={g.id}
                to="/galerie"
                className={cn('frame group', i === 0 && 'col-span-2 row-span-2', i === 3 && 'lg:col-span-2')}
              >
                <img src={g.image} alt={g.title} loading="lazy" decoding="async" />
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-sm text-white transition-transform duration-300 ease-out group-hover:translate-y-0">
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Appel final, sur un aplat de la couleur du client. */}
      <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-grid overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground shadow-lg sm:px-14 sm:py-20">
          <h2 className="mx-auto max-w-[18ch] font-display text-3xl sm:text-4xl lg:text-5xl">
            Réservez votre place en quelques clics
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base opacity-85">
            En ligne, à toute heure. La confirmation arrive immédiatement.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground hover:brightness-95"
          >
            <Link to="/reservation">
              Prendre rendez-vous
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}