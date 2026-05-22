import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        riva: {
          black: '#0A0A0A',
          ivory: '#F4F1EC',
          white: '#FFFFFF',
        },
        n: {
          900: '#1A1A1A',
          700: '#4A4A4A',
          500: '#8C8780',
          300: '#D8D4CD',
          100: '#EDEAE4',
        },
        oak: {
          light: '#D9C4A3',
          mid: '#B08A5C',
        },
        cove: '#5C3A20',
        sage: '#9AA08A',
        stone: '#C9C2B8',
        success: '#5A7A4F',
        warning: '#B07A2C',
        error: '#8C3A2E',
        // Extra shades used in demo
        'cove-dark': '#3f2616',
        'cove-deepest': '#2a1a0e',
        'cove-mid': '#7a5230',
        'sage-dark': '#6e7860',
        'sage-light': '#aebd9c',
        'sage-soft': '#dfe8d6',
      },
      fontFamily: {
        display: ['Jost', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        label: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
      },
      fontSize: {
        // Custom scale per DESIGN.md
        eyebrow: ['11px', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        caption: ['13px', { lineHeight: '1.6', letterSpacing: '0.02em' }],
      },
      spacing: {
        // 8pt scale exposed as additional values where Tailwind defaults differ
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
      },
      letterSpacing: {
        riva: '0.04em',
        rivaWide: '0.08em',
        rivaWider: '0.15em',
        rivaWidest: '0.25em',
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '0px',
      },
      maxWidth: {
        page: '1480px',
        prose: '65ch',
      },
    },
  },
  plugins: [],
}

export default config
