import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Sur-titre en petites capitales — situe la page dans le site. */
  eyebrow: string;
  title: string;
  lead?: string;
  /** Contenu aligné à droite du titre : filtres, compteur, action. */
  aside?: ReactNode;
}

/*
 * En-tête de page.
 *
 * Les quatre pages publiques répétaient le même bloc : bandeau-pastille avec
 * icône d'étincelles, titre en serif centré, paragraphe centré, le tout en
 * fondu au chargement sur un dégradé rose. Quatre copies du même geste.
 *
 * Ici, alignement à gauche — le texte centré ralentit la lecture dès qu'il
 * dépasse une ligne — et un filet appuyé referme le bloc au lieu d'un dégradé.
 */
export default function PageHeader({ eyebrow, title, lead, aside }: PageHeaderProps) {
  return (
    <header className="border-b border-border-strong">
      <div className="mx-auto max-w-grid px-gutter py-14 lg:px-gutter-lg lg:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="label-mono">{eyebrow}</p>
            <h1 className="mt-4 text-3xl font-semibold lg:text-5xl">{title}</h1>
            {lead && <p className="mt-5 max-w-prose text-lg text-muted-foreground">{lead}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </div>
    </header>
  );
}