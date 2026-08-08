import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

import { useServiceCatalog } from '@/hooks/useServiceCatalog';
import { useActiveConfig } from '@/hooks/useActiveConfig';
import { useMoney } from '@/hooks/useMoney';
import { useLabels } from '@/hooks/useLabels';
import PageHeader from '@/components/public/PageHeader';

export default function Services() {
  const t = useLabels();
  const money = useMoney();
  const { services } = useServiceCatalog();
  const { categories } = useActiveConfig();
  const [active, setActive] = useState<string>('Toutes');

  const allCategories = useMemo(() => ['Toutes', ...categories], [categories]);

  const filtered = useMemo(
    () => (active === 'Toutes' ? services : services.filter((s) => s.category === active)),
    [services, active]
  );

  // Fonction pour afficher le prix ou "Devis"
  const displayPrice = (price: number) => {
    return price === 0 ? 'Devis' : money(price);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={t('service', 'many')}
        lead={`Durées et tarifs à jour. La réservation se fait en ligne, à toute heure.`}
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pb-2">
            {allCategories.map((c) => (
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div key={s.id} >
                <Card className="group h-full overflow-hidden border-border bg-card">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={s.image} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                    {s.popular && (
                      <Badge className="absolute left-3 top-3 gap-1 bg-primary text-primary-foreground shadow"> Populaire
                      </Badge>
                    )}
                    <Badge className="absolute right-3 top-3 bg-white/90 text-foreground shadow">{s.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold">{s.name}</h3>
                      <span className="whitespace-nowrap text-lg font-semibold text-primary">
                        {displayPrice(s.price)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {s.duration} min
                      </span>
                      <Button asChild size="sm" >
                        <Link to="/reservation"><CalendarHeart className="mr-1.5 h-3.5 w-3.5" /> Réserver</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}