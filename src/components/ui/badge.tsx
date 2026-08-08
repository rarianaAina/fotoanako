import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
 * Étiquette d'état. En mono, petites capitales espacées : elle se lit comme une
 * donnée, pas comme du texte. Rectangulaire, sauf `dot` — la seule forme ronde
 * conservée, parce qu'un point rond signifie un état par convention.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-2xs font-medium uppercase tracking-[0.1em] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-foreground px-2 py-1 text-background',
        primary: 'bg-primary px-2 py-1 text-primary-foreground',
        outline: 'border border-border px-2 py-1 text-muted-foreground',
        secondary: 'bg-secondary px-2 py-1 text-secondary-foreground',
        destructive: 'bg-destructive px-2 py-1 text-destructive-foreground',
        /* Pastille d'état : le point coloré porte l'information, le texte la nomme. */
        dot: 'gap-2 px-0 text-foreground',
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
