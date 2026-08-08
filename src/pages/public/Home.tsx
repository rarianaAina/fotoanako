import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  CalendarHeart,
  Sparkles,
  Clock,
  Phone,
  MapPin,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useNailServices } from '@/hooks/useNailServices';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/lib/supabase';
import { useSpecialInfos } from '@/hooks/useSpecialInfos';
import { useMoney } from '@/hooks/useMoney';
import { useLabels } from '@/hooks/useLabels';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

// ✅ Fonction pour formater la durée (ex: 85 → "1h25")
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

export default function Home() {
  const money = useMoney();
  const t = useLabels();
  const { services } = useNailServices();
  const { settings } = useSettings();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const { infos: specialInfos, loading: loadingInfos } = useSpecialInfos();
  // Les deux premières alimentent les pastilles du visuel principal.
  const heroBadges = specialInfos.slice(0, 2);

  // Récupérer les images de la galerie
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('id, title, category, image')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setGalleryItems(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement de la galerie:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[92vh] gradient-rose">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            {settings.tagline && (
              <Badge
                variant="secondary"
                className="mb-6 gap-1.5 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5" /> {settings.tagline}
              </Badge>
            )}
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-balance text-foreground sm:text-6xl lg:text-7xl">
              <span className="block italic text-primary">{settings.name}</span>
            </h1>
            {settings.description && (
              <p className="mx-auto mt-6 max-w-xl text-base text-foreground/70 lg:mx-0">
                {settings.description}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="rounded-full px-7 shadow-glow">
                <Link to="/reservation">
                  <CalendarHeart className="mr-2 h-4 w-4" /> Prendre rendez-vous
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-white/60 px-7 backdrop-blur">
                <Link to="/prestations">Découvrir nos prestations</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
              {settings.logoUrl && (
                <Link to="/">
                  <img
                    src={settings.logoUrl}
                    alt={settings.name}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover transition-transform hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              )}
              <div className="text-left">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('customer', 'many')} satisfaits
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-glow ring-1 ring-primary/10">
              {settings.heroImageUrl ? (
                <img
                  src={settings.heroImageUrl}
                  alt={settings.name}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                // Sans visuel configuré, un aplat aux couleurs de la marque
                // plutôt qu'une image cassée.
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
                  <span className="font-display text-6xl text-primary/40">
                    {settings.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
            </div>
            {/* Les deux pastilles reprennent les premières informations
                spéciales configurées. Le contenu appartenait au métier
                (« SANS TPO, SANS HEMA ») : il est désormais éditable depuis
                Réglages → Informations spéciales. */}
            {heroBadges.map((info, i) => (
              <motion.div
                key={info.id}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.2 }}
                className={
                  i === 0
                    ? 'absolute -left-4 top-12 max-w-[13rem] rounded-2xl bg-white/90 p-3 shadow-soft backdrop-blur sm:-left-8'
                    : 'absolute -right-4 bottom-16 max-w-[13rem] rounded-2xl bg-white/90 p-3 shadow-soft backdrop-blur sm:-right-8'
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${
                      i === 0 ? 'bg-primary/10' : 'bg-accent/15'
                    }`}
                  >
                    {info.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{info.title}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">{info.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION INFORMATIONS SPÉCIALES */}
      {!loadingInfos && specialInfos.length > 0 && (
        <section className="relative -mt-10 pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialInfos.map((info, index) => (
                <motion.div
                  key={info.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl bg-white/80 backdrop-blur-sm border border-primary/10 p-5 shadow-soft hover:shadow-glow transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{info.icon}</span>
                    <div>
                      <h2 className="font-display text-base font-semibold">{info.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{info.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NOS PRESTATIONS */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                Nos prestations
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
                Des soins pour chaque envie
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/prestations">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s, i) => (
              <motion.div
                key={s.id}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group h-full overflow-hidden border-border/60 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    {s.popular && (
                      <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-primary text-primary-foreground shadow">
                        <Sparkles className="h-3 w-3" /> Populaire
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl font-semibold">{s.name}</h2>
                      <span className="text-sm font-semibold text-primary">
                        {s.price === 0 ? 'Devis' : money(s.price)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(s.duration)} {/* ✅ Affichage formaté */}
                      </span>
                      <Button asChild size="sm" variant="secondary" className="rounded-full">
                        <Link to="/reservation">Réserver</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              Galerie
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">
              Nos plus belles réalisations
            </h2>
          </motion.div>

          {loadingGallery ? (
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-2xl bg-secondary"
                />
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="mt-14 text-center text-muted-foreground">
              <p>Aucune image dans la galerie pour le moment.</p>
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {galleryItems.slice(0, 8).map((g, i) => (
                <motion.div
                  key={g.id}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl shadow-soft aspect-square"
                >
                  <img
                    src={g.image}
                    alt={g.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="p-4 text-white">
                      <p className="text-xs uppercase tracking-wider text-white/80">{g.category}</p>
                      <p className="font-display text-lg font-semibold">{g.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COORDONNÉES */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                Coordonnées
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-foreground">
                Venez nous rencontrer
              </h2>
              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">{settings.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}