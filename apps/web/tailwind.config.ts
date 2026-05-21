import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Couleurs identitaires Villiers-Adam (via CSS vars pour dark mode)
        villiers: {
          blue: 'var(--villiers-blue)',
          'blue-light': 'var(--villiers-blue-light)',
          gold: 'var(--villiers-gold)',
          'gold-soft': 'var(--villiers-gold-soft)',
          green: 'var(--villiers-green)',
          'green-light': 'var(--villiers-green-light)',
          cream: 'var(--villiers-cream)',
          stone: 'var(--villiers-stone)',
          slate: 'var(--villiers-slate)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Border-radius organiques (asymétriques subtils)
        'organic': '0.75rem 1rem 0.875rem 1.125rem',
        'organic-sm': '0.5rem 0.625rem 0.5rem 0.75rem',
        'organic-lg': '1rem 1.25rem 1.125rem 1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-source-serif)', 'Georgia', 'serif'],
        heading: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      fontSize: {
        // Mode senior
        'senior-base': '1.125rem',
        'senior-lg': '1.375rem',
        'senior-xl': '1.625rem',
        'senior-2xl': '2rem',
        'senior-3xl': '2.5rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-fast': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        // Nouvelles animations sophistiquées
        'reveal-up': {
          from: {
            opacity: '0',
            transform: 'translateY(40px)',
            clipPath: 'inset(100% 0% 0% 0%)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
            clipPath: 'inset(0% 0% 0% 0%)',
          },
        },
        'reveal-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-40px)',
            clipPath: 'inset(0% 100% 0% 0%)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
            clipPath: 'inset(0% 0% 0% 0%)',
          },
        },
        'underline-expand': {
          from: { width: '0%', left: '50%' },
          to: { width: '100%', left: '0%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'typewriter': {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in-blur': {
          from: { opacity: '0', filter: 'blur(8px)' },
          to: { opacity: '1', filter: 'blur(0)' },
        },
        'slide-up-stagger': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        marquee: 'marquee 30s linear infinite',
        'marquee-fast': 'marquee-fast 10s linear infinite',
        'reveal-up': 'reveal-up 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'reveal-left': 'reveal-left 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'underline-expand': 'underline-expand 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'typewriter': 'typewriter 3s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in-blur': 'fade-in-blur 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up-stagger': 'slide-up-stagger 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'count-up': 'count-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'organic': '0 1px 3px rgb(0 0 0 / 0.08)',
        'organic-hover': '0 20px 40px rgb(0 0 0 / 0.12)',
        'organic-lg': '0 25px 50px rgb(0 0 0 / 0.15)',
        'inner-soft': 'inset 0 2px 4px rgb(0 0 0 / 0.06)',
        // Variantes dark mode (via CSS class)
        'dark-organic': '0 1px 3px rgb(0 0 0 / 0.3)',
        'dark-organic-hover': '0 20px 40px rgb(0 0 0 / 0.4)',
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
