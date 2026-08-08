import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
 * Étiquette en gélule. La forme ronde est ici assumée : une étiquette d'état
 * n'est pas une surface de contenu, et sa silhouette la distingue au premier
 * regard du texte qui l'entoure.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/12 text-primary',
        solid: 'bg-primary text-primary-foreground',
        neutral: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border bg-card/60 text-muted-foreground',
        destructive: 'bg-destructive/12 text-destructive',
        /* Point coloré : l'état sur fond neutre, pour les listes denses. */
        dot: 'gap-2 bg-secondary/80 pl-2.5 text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
