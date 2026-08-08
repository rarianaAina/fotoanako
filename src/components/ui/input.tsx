import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/*
 * Champ rectangulaire. Le focus épaissit le filet et le passe à l'encre plutôt
 * que d'ajouter un halo coloré : sur une page où la couleur est rare, un anneau
 * teinté autour de chaque champ ferait plus de bruit que de signal.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full border border-input bg-card px-3 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-foreground focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
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
