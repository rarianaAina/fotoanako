import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Sur-titre en petites capitales, dans la couleur du client. */
  eyebrow: string;
  title: string;
  lead?: string;
  /** Contenu à droite du titre : filtres, compteur, action. */
  aside?: ReactNode;
}

/*
 * En-tête de page, posé sur une surface sable arrondie.
 *
 * Les quatre pages publiques répétaient le même bloc centré. Ici le texte est
 * aligné à gauche — le centré ralentit la lecture dès qu'il dépasse une
 * ligne — et le fond teinté détache l'en-tête du contenu sans avoir besoin
 * d'un filet.
 */
export default function PageHeader({ eyebrow, title, lead, aside }: PageHeaderProps) {
  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-grid rounded-3xl bg-secondary/60 px-6 py-12 sm:px-10 sm:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
            {lead && <p className="mt-4 max-w-prose text-base text-muted-foreground sm:text-lg">{lead}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </div>
    </header>
  );
}