/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Points de rupture calés sur la grille éditoriale, pas sur des tailles
    // d'appareils : la mise en page change quand la colonne devient trop
    // large pour être lue, pas quand un modèle de téléphone sort.
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      // Échelle typographique à progression franche. Les paliers intermédiaires
      // ont été retirés : trop de tailles voisines produisent une hiérarchie
      // molle, où rien ne domine.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.6' }],
        lg: ['1.0625rem', { lineHeight: '1.55' }],
        xl: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.011em' }],
        '2xl': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.016em' }],
        '3xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '4xl': ['3rem', { lineHeight: '1.04', letterSpacing: '-0.024em' }],
        '5xl': ['4rem', { lineHeight: '0.98', letterSpacing: '-0.028em' }],
        '6xl': ['5.5rem', { lineHeight: '0.94', letterSpacing: '-0.032em' }],
      },

      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'hsl(var(--border-strong))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },

      // Angles droits. Les deux valeurs rondes restantes servent aux formes
      // qui signifient : pastilles d'état, jetons de couleur, avatars.
      borderRadius: {
        none: '0',
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        pill: '999px',
        full: '9999px',
      },

      // Aucune ombre. Conservées en transparent plutôt que supprimées : les
      // composants shadcn y font référence, et un jeton neutre vaut mieux
      // qu'une classe inconnue silencieusement ignorée.
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        soft: 'none',
        glow: 'none',
      },

      // Gouttière de la grille éditoriale.
      spacing: {
        gutter: '1.5rem',
        'gutter-lg': '2.5rem',
      },

      maxWidth: {
        prose: '68ch',
        grid: '84rem',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.18s ease-out',
        'accordion-up': 'accordion-up 0.18s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};