// ─────────────────────────────────────────────────────────────────────────────
// Zillit Global Rates Bible — Tailwind CSS Configuration
// Maps the CSS custom properties from the HTML prototype into Tailwind tokens.
// All dark-theme values. The UI does not have a light mode.
// ─────────────────────────────────────────────────────────────────────────────

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── COLOUR PALETTE ──────────────────────────────────────────────────────
      colors: {
        // Backgrounds (darkest → lightest)
        bg: {
          DEFAULT: '#070810',  // --bg  : page background
          s:  '#0c0e1a',       // --bg-s: sidebar, topbar, card backgrounds
          e:  '#131624',       // --bg-e: elevated surfaces (card headers, inputs)
          h:  '#1a1d2e',       // --bg-h: hover states, section headers
        },
        // Borders
        border: {
          DEFAULT: '#1e2234',  // --b : standard border
          mid:    '#262b42',   // --bm: medium border (inputs focus ring base)
          light:  '#333856',   // --bl: lighter border (scrollbar)
        },
        // Text
        text: {
          1: '#edeef5',  // --t1: primary text
          2: '#8890ae',  // --t2: secondary text, labels
          3: '#464d68',  // --t3: muted text, placeholders, icons
        },
        // Brand gold — primary accent
        gold: {
          DEFAULT: '#e8b84b',
          glow:    'rgba(232,184,75,0.10)',  // --gold-g
          subtle:  'rgba(232,184,75,0.05)',  // --gold-gg
        },
        // Semantic colours
        success:  '#4ade80',   // --green
        warning:  '#fbbf24',   // --yellow
        error:    '#f87171',   // --red
        info:     '#60a5fa',   // --blue
        teal:     '#2dd4bf',   // --teal
        orange:   '#fb923c',   // --orange
        purple:   '#c084fc',   // --purple
        pink:     '#f472b6',   // --pink
      },

      // ── TYPOGRAPHY ───────────────────────────────────────────────────────────
      fontFamily: {
        // Display / headings
        syne: ['Syne', 'sans-serif'],
        // Body copy
        dm: ['"DM Sans"', 'sans-serif'],
        // Monospace rates / values
        mono: ['"DM Mono"', 'monospace'],
      },
      fontSize: {
        // Custom scale to match prototype
        '2xs': ['8px',   { lineHeight: '12px' }],
        'xs':  ['10px',  { lineHeight: '14px' }],
        'sm':  ['11px',  { lineHeight: '16px' }],
        'base':['12px',  { lineHeight: '18px' }],
        'md':  ['13px',  { lineHeight: '20px' }],
        'lg':  ['15px',  { lineHeight: '22px' }],
        'xl':  ['17px',  { lineHeight: '24px' }],
        '2xl': ['20px',  { lineHeight: '28px' }],
      },
      letterSpacing: {
        'wide-xl': '0.9px',
        'wide-lg': '0.8px',
        'wide-md': '0.6px',
        'wide':    '0.4px',
        'tight':   '-0.3px',
      },

      // ── BORDER RADIUS ────────────────────────────────────────────────────────
      borderRadius: {
        sm:  '5px',   // --r  : standard radius
        md:  '10px',  // --rl : large radius (cards)
        full: '9999px',
      },

      // ── SPACING ──────────────────────────────────────────────────────────────
      // The prototype uses 14-16px content padding, 8-10px for compact areas
      spacing: {
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '4.5': '18px',
      },

      // ── BOX SHADOW ───────────────────────────────────────────────────────────
      boxShadow: {
        toast: '0 4px 24px rgba(0,0,0,0.6)',
        card:  '0 1px 4px rgba(0,0,0,0.4)',
      },

      // ── ANIMATIONS ───────────────────────────────────────────────────────────
      keyframes: {
        // Typing dots in AI panel
        typingDot: {
          '0%, 80%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '40%':           { transform: 'scale(1.3)', opacity: '1' },
        },
        // Fade in for territory view transitions
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'typing-dot': 'typingDot 0.9s ease-in-out infinite',
        'fade-in':    'fadeIn 0.15s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
