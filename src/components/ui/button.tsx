import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
 * Boutons rectangulaires, sans ombre.
 *
 * L'échelle de hauteur est franche — 32, 40, 52 px — plutôt que trois valeurs
 * voisines. Un bouton doit se lire comme primaire, courant ou discret au seul
 * coup d'œil, sans comparer.
 *
 * L'état survolé inverse ou assombrit ; il ne translate ni n'agrandit. Un
 * bouton qui bouge sous le curseur est une signature d'interface générée.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Aplat de la couleur du client. Rare par construction : un seul par écran.
        default: 'bg-primary text-primary-foreground hover:bg-primary/88',

        // L'action neutre de référence, en encre.
        solid: 'bg-foreground text-background hover:bg-foreground/86',

        // Filet et fond transparent. S'inverse au survol plutôt que de se teinter.
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-foreground hover:text-background',

        secondary: 'bg-secondary text-secondary-foreground hover:bg-border',

        ghost: 'text-foreground hover:bg-secondary',

        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/88',

        // Lien souligné au survol, de la gauche vers la droite.
        link: 'link-underline h-auto p-0 text-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        default: 'h-10 px-5 text-sm [&_svg]:size-4',
        lg: 'h-[3.25rem] px-8 text-base [&_svg]:size-[1.125rem]',
        icon: 'h-10 w-10 [&_svg]:size-4',
        'icon-sm': 'h-8 w-8 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };