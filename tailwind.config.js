/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          'blue-hover': '#0062CC',
          green: '#34C759',
          'green-hover': '#2DA84A',
          orange: '#FF9500',
          red: '#FF3B30',
          indigo: '#5856D6',
          purple: '#AF52DE',
          yellow: '#FFCC00',
          teal: '#5AC8FA',
          canvas: '#F5F5F7',
          card: '#FFFFFF',
          'canvas-dark': '#000000',
          'card-dark': '#1C1C1E',
          'card-dark-subtle': '#2C2C2E',
          gray: {
            1: '#8E8E93',
            2: '#AEAEB2',
            3: '#C7C7CC',
            4: '#D1D1D6',
            5: '#E5E5EA',
            6: '#F2F2F7',
          }
        }
      },
      borderRadius: {
        'apple': '16px',
        'apple-lg': '22px',
        'apple-xl': '28px',
        'apple-pill': '9999px',
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 8px 24px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 16px 40px rgba(0, 0, 0, 0.10)',
        'apple-modal': '0 24px 64px rgba(0, 0, 0, 0.16)',
        'apple-floating': '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          '"Plus Jakarta Sans"',
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
};
