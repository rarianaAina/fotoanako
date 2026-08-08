import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { useLabels } from '@/hooks/useLabels';
import PageHeader from '@/components/public/PageHeader';

export default function Gallery() {
  const t = useLabels();
  const { settings } = useSettings();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('Toutes');

  // Récupérer les images de la galerie depuis Supabase
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGalleryItems(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement de la galerie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Extraire les catégories uniques depuis les données
  const uniqueCategories = useMemo(() => {
    const cats = new Set(galleryItems.map((g) => g.category));
    return ['Toutes', ...Array.from(cats)];
  }, [galleryItems]);

  const filtered = useMemo(
    () =>
      active === 'Toutes'
        ? galleryItems
        : galleryItems.filter((g) => g.category === active),
    [galleryItems, active]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title={t('gallery', 'many')}
        lead={`Une sélection signée ${settings.name}.`}
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pb-2">
            {uniqueCategories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  'whitespace-nowrap  border px-4 py-2 text-sm font-medium transition-all',
                  active === c
                    ? 'border-primary bg-primary text-primary-foreground '
                    : 'border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-secondary animate-pulse"
                  style={{ height: `${150 + Math.random() * 200}px` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-14 text-center text-muted-foreground">
              <p>Aucune image dans cette catégorie pour le moment.</p>
            </div>
          ) : (
            <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
              {filtered.map((g) => (
                <div
                  key={g.id}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl"
                >
                  <img
                    src={g.image}
                    alt={g.title}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="p-4 text-white">
                      <p className="text-xs uppercase tracking-wider text-white/80">{g.category}</p>
                      <p className="text-lg font-semibold">{g.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}