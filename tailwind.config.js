/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 80%, 50%)',
        accent: 'hsl(160, 70%, 45%)',
        bg: 'hsl(215, 20%, 95%)',
        surface: 'hsl(0, 0%, 100%)',
        textPrimary: 'hsl(220, 30%, 15%)',
        textSecondary: 'hsl(215, 15%, 40%)',
        purple: {
          600: '#8B5CF6',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#5B21B6',
        }
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(220, 30%, 15%, 0.08)',
      }
    },
  },
  plugins: [],
}