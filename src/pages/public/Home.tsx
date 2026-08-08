import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useServiceCatalog } from '@/hooks/useServiceCatalog';
import { useSettings } from '@/hooks/useSettings';
import { useSpecialInfos } from '@/hooks/useSpecialInfos';
import { useMoney } from '@/hooks/useMoney';
import { useLabels } from '@/hooks/useLabels';
import { useModules } from '@/hooks/useModules';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@/types';

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${String(mins).padStart(2, '0')}`;
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
        .limit(5);
      if (mounted) setGallery(data ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, [isEnabled]);

  const featured = services.filter((s) => s.active).slice(0, 6);
  const openDays = settings.hours.filter((h) => !h.closed);

  return (
    <>
      {/*
        Titre à gauche, informations pratiques à droite, sur une grille
        asymétrique. L'ancien héros centrait un bandeau-pastille au-dessus
        d'un titre au-dessus de deux boutons, le tout flottant sur des taches
        floues — la composition la plus reproduite du web.

        Ce qu'un visiteur cherche en arrivant, ce n'est pas une accroche :
        c'est de savoir si c'est ouvert, où c'est, et comment réserver.
      */}
      <section className="border-b border-border-strong">
        <div className="mx-auto max-w-grid px-gutter pb-16 pt-16 lg:px-gutter-lg lg:pb-24 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
            <div>
              <h1 className="text-4xl font-semibold lg:text-6xl">
                {settings.tagline || 'Prendre rendez-vous en ligne'}
              </h1>

              {settings.description && (
                <p className="mt-7 max-w-prose text-lg text-muted-foreground">
                  {settings.description}
                </p>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Button asChild size="lg">
                  <Link to="/reservation">
                    Prendre rendez-vous
                    <ArrowRight />
                  </Link>
                </Button>
                <Link to="/prestations" className="link-underline text-sm">
                  Voir les {t('service', 'many').toLowerCase()}
                </Link>
              </div>
            </div>

            {/* Colonne des faits. Alignée en bas du titre, séparée par un
                filet vertical sur grand écran. */}
            <dl className="grid content-end gap-6 border-border pt-2 text-sm lg:border-l lg:pl-16 lg:pt-0">
              {openDays.length > 0 && (
                <div>
                  <dt className="label-mono">Ouvert</dt>
                  <dd className="mt-2 space-y-0.5">
                    {openDays.map((h) => (
                      <div key={h.day} className="flex justify-between gap-6">
                        <span className="text-muted-foreground">{h.day}</span>
                        <span className="figure text-xs">
                          {h.open}–{h.close}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              )}

              {settings.address && (
                <div>
                  <dt className="label-mono">Adresse</dt>
                  <dd className="mt-2 whitespace-pre-line">{settings.address}</dd>
                </div>
              )}

              {settings.phone && (
                <div>
                  <dt className="label-mono">Téléphone</dt>
                  <dd className="mt-2">
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="link-underline">
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* Informations spéciales : un bandeau de filets, pas des cartes
          flottantes. Elles annoncent un congé ou une promotion — c'est une
          brève, pas une fonctionnalité. */}
      {isEnabled('specialInfos') && specialInfos.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-grid px-gutter lg:px-gutter-lg">
            <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
              {specialInfos.slice(0, 3).map((info) => (
                <div key={info.id} className="flex gap-3 py-6 md:px-8 md:first:pl-0 md:last:pr-0">
                  <span aria-hidden className="text-base leading-tight">
                    {info.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{info.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/*
        Catalogue en liste tabulaire numérotée, pas en grille de cartes.
        Un prix se compare verticalement : aligné en colonne, l'œil descend.
        Réparti en cartes, il faut sauter de l'un à l'autre.
      */}
      {featured.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-grid px-gutter py-20 lg:px-gutter-lg">
            <div className="flex items-end justify-between gap-8">
              <h2 className="text-2xl font-semibold lg:text-3xl">{t('service', 'many')}</h2>
              <Link to="/prestations" className="link-underline shrink-0 text-sm">
                Tout voir
              </Link>
            </div>

            <ul className="mt-10 border-t border-border-strong">
              {featured.map((s, i) => (
                <li key={s.id} className="border-b border-border">
                  <Link
                    to="/reservation"
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-secondary/60 sm:grid-cols-[3rem_1fr_7rem_7rem] sm:gap-6"
                  >
                    <span className="figure text-2xs text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-medium">{s.name}</span>
                      {s.description && (
                        <span className="mt-0.5 block max-w-prose truncate text-sm text-muted-foreground">
                          {s.description}
                        </span>
                      )}
                    </span>

                    <span className="figure hidden text-sm text-muted-foreground sm:block">
                      {formatDuration(s.duration)}
                    </span>

                    <span className="figure text-right text-sm font-medium sm:text-base">
                      {s.price === 0 ? 'Devis' : money(s.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/*
        Galerie en bande à défilement horizontal. Une grille de vignettes
        carrées toutes identiques aplatit le propos ; une bande impose un
        rythme et laisse la première image respirer.
      */}
      {isEnabled('gallery') && gallery.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-grid px-gutter py-20 lg:px-gutter-lg">
            <div className="flex items-end justify-between gap-8">
              <h2 className="text-2xl font-semibold lg:text-3xl">{t('gallery', 'many')}</h2>
              <Link to="/galerie" className="link-underline shrink-0 text-sm">
                Tout voir
              </Link>
            </div>
          </div>

          {/* Débordement volontaire hors de la gouttière : la bande se
              poursuit au-delà du bord, ce qui indique qu'elle défile. */}
          <div className="-mt-4 flex snap-x snap-mandatory gap-px overflow-x-auto pb-20">
            {gallery.map((g, i) => (
              <Link
                key={g.id}
                to="/galerie"
                className={`group relative shrink-0 snap-start ${
                  i === 0 ? 'ml-gutter lg:ml-gutter-lg' : ''
                }`}
              >
                <img
                  src={g.image}
                  alt={g.title}
                  loading="lazy"
                  decoding="async"
                  className={`object-cover ${
                    i === 0 ? 'h-[26rem] w-[20rem] sm:w-[26rem]' : 'h-[26rem] w-[16rem] sm:w-[19rem]'
                  }`}
                />
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground px-3 py-2 text-xs text-background transition-transform group-hover:translate-y-0">
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Appel final : une seule ligne, pleine largeur, en négatif. */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex max-w-grid flex-col gap-8 px-gutter py-16 lg:flex-row lg:items-center lg:justify-between lg:px-gutter-lg">
          <h2 className="max-w-[24ch] text-2xl font-semibold lg:text-3xl">
            Réservez en ligne, à toute heure.
          </h2>
          <Link
            to="/reservation"
            className="group inline-flex shrink-0 items-center gap-3 self-start border-b border-background/40 pb-1 text-lg transition-colors hover:border-background"
          >
            Prendre rendez-vous
            <ArrowUpRight className="h-5 w-5 transition-transform group- group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}