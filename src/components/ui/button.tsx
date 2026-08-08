import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
 * Boutons arrondis et enveloppants, avec une vraie réponse au geste.
 *
 * Le bouton principal porte un halo de sa propre couleur — pas une ombre
 * grise. Au survol il s'assombrit légèrement et son halo s'étend : la surface
 * paraît se rapprocher sans que rien ne se déplace, ce qui évite le
 * sautillement de la carte qui décolle.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'rounded-xl bg-primary text-primary-foreground shadow-ring hover:brightness-[0.94] hover:shadow-lg',
        solid:
          'rounded-xl bg-foreground text-background shadow-md hover:brightness-125 hover:shadow-lg',
        outline:
          'rounded-xl border border-input bg-card/70 text-foreground hover:border-primary/45 hover:bg-card hover:shadow-md',
        secondary: 'rounded-xl bg-secondary text-secondary-foreground hover:bg-accent',
        ghost: 'rounded-xl text-foreground hover:bg-secondary',
        destructive:
          'rounded-xl bg-destructive text-destructive-foreground hover:brightness-[0.94] hover:shadow-md',
        link: 'h-auto p-0 text-primary underline-offset-[6px] hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        default: 'h-11 px-6 text-sm [&_svg]:size-4',
        lg: 'h-[3.375rem] px-8 text-base [&_svg]:size-[1.125rem]',
        icon: 'h-11 w-11 [&_svg]:size-[1.125rem]',
        'icon-sm': 'h-9 w-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
