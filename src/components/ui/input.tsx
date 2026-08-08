import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/*
 * Champ arrondi, creusé plutôt que posé : son fond est légèrement plus sombre
 * que la carte qui le porte. Au focus il remonte au blanc et prend l'anneau
 * de la couleur du client.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-transparent bg-secondary/70 px-4 text-sm text-foreground transition-all duration-200',
        'placeholder:text-muted-foreground/65',
        'focus-visible:border-primary/40 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
