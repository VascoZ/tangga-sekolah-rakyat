/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sr': {
          '900': '#112D4E',
          '700': '#1B3A5C',
          '500': '#234B73',
          '300': '#4A7FB5',
          '100': '#D6E4F0',
        },
        'tangga': {
          '0': '#B07D62',
          '1': '#E0A82C',
          '2': '#F0B03C',
          '3': '#E8733A',
          '4': '#A855F7',
          '5': '#0EA5E9',
          '6': '#10B981',
        },
        'signal': {
          'berat': '#E63946',
          'sedang': '#F4A261',
          'normal': '#2D6A4F',
        },
        'krem': {
          'DEFAULT': '#FDF6E3',
          '50': '#FFFDF8',
        },
      },
      fontFamily: {
        'display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['"IBM Plex Sans"', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}