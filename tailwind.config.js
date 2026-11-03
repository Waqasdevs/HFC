/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cobalt: '#010102',
        lavender: {
          DEFAULT: '#AD96F1',
          muted: 'rgba(173, 150, 241, 0.16)',
        },
        lime: {
          DEFAULT: '#58F6B1',
          muted: 'rgba(88, 246, 177, 0.15)',
        },
        surface: {
          0: '#000000',
          1: '#010102',
          2: '#181818',
          3: '#1F1F1F',
          4: '#272727',
          5: '#313131',
        },
        apple: {
          bg: 'rgb(var(--apple-bg) / <alpha-value>)',
          card: 'rgb(var(--apple-card) / <alpha-value>)',
          text: 'rgb(var(--apple-text) / <alpha-value>)',
          gray: 'rgb(var(--apple-gray) / <alpha-value>)',
          border: 'rgb(var(--apple-border) / <alpha-value>)',
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          teal: '#5AC8FA',
          indigo: '#5856D6',
        },
      },
      fontFamily: {
        sans: [
          '"Geist"',
          '"Manrope"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"Geist Mono"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      transitionTimingFunction: {
        weighted: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-modal': '0 24px 64px rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
};
