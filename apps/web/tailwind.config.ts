import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Dark mode via class strategy — base theme is already dark via CSS variables
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map Tailwind utilities to our CSS design tokens
        bg: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card:      'var(--bg-card)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          again: 'var(--accent-again)',
          hard:  'var(--accent-hard)',
          good:  'var(--accent-good)',
          easy:  'var(--accent-easy)',
        },
        border: 'var(--border)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
