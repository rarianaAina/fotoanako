/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },

      // Contraste d'échelle marqué : les titres montent haut, le texte reste
      // confortable. C'est l'écart entre les deux qui crée la respiration,
      // pas le vide autour.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.15rem' }],
        sm: ['0.8438rem', { lineHeight: '1.35rem' }],
        base: ['0.9688rem', { lineHeight: '1.65' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.375rem', { lineHeight: '1.4' }],
        '2xl': ['1.75rem', { lineHeight: '1.22' }],
        '3xl': ['2.375rem', { lineHeight: '1.12' }],
        '4xl': ['3.25rem', { lineHeight: '1.04' }],
        '5xl': ['4.5rem', { lineHeight: '0.98' }],
        '6xl': ['6rem', { lineHeight: '0.94' }],
      },

      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
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

      // Courbes généreuses et progressives. Le rayon suit la taille de la
      // surface : un petit élément très arrondi paraît mou, une grande image
      // peu arrondie paraît raide.
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: '0.625rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        pill: '999px',
        full: '9999px',
      },

      // Ombres teintées de brun, jamais du noir. Deux couches : un contact
      // net et proche, une diffusion large et faible — c'est ce qui distingue
      // une ombre observée d'un flou uniforme.
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px hsl(var(--shadow-hue) / 0.06)',
        DEFAULT: '0 1px 2px hsl(var(--shadow-hue) / 0.05), 0 4px 12px -2px hsl(var(--shadow-hue) / 0.07)',
        md: '0 2px 4px hsl(var(--shadow-hue) / 0.05), 0 8px 20px -4px hsl(var(--shadow-hue) / 0.09)',
        lg: '0 4px 8px hsl(var(--shadow-hue) / 0.05), 0 16px 36px -8px hsl(var(--shadow-hue) / 0.12)',
        xl: '0 8px 16px hsl(var(--shadow-hue) / 0.06), 0 28px 60px -12px hsl(var(--shadow-hue) / 0.16)',
        // Halo coloré, réservé au bouton principal.
        ring: '0 6px 20px -6px hsl(var(--primary) / 0.45)',
      },

      maxWidth: {
        prose: '62ch',
        grid: '80rem',
      },

      transitionTimingFunction: {
        // Départ franc, arrivée douce : le geste paraît répondre, pas glisser.
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
        'accordion-down': 'accordion-down 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        'accordion-up': 'accordion-up 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};