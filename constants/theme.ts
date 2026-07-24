// Single source of truth for all design tokens.
// For the final UI milestone: change values here and in tailwind.config.js
// (brand colors only) — every screen updates automatically.

export const colors = {
  // Brand — maps to the `brand` alias in tailwind.config.js
  brand: {
    default: '#16a34a', // bg-brand, text-brand
    muted:   '#f0fdf4', // bg-brand-muted
    dark:    '#15803d', // text-brand-dark
    border:  '#bbf7d0', // border-brand
  },

  // Neutrals — Tailwind gray scale, named by role
  neutral: {
    900: '#111827', // text-gray-900 — primary text
    700: '#374151', // text-gray-700 — body text
    600: '#4b5563', // text-gray-600 — secondary body
    500: '#6b7280', // text-gray-500 — secondary / hint text
    400: '#9ca3af', // text-gray-400 — muted text
    300: '#d1d5db', // border-gray-300 — input borders
    100: '#f3f4f6', // border-gray-100 — dividers
    50:  '#f9fafb', // bg-gray-50 — screen background
  },

  // Semantic
  error:   '#ef4444', // text-red-500
  white:   '#ffffff',
  black:   '#000000',
};

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm:   8,   // rounded-lg
  md:   12,  // rounded-xl
  lg:   16,  // rounded-2xl
  full: 9999,
};

export const typography = {
  size: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 30,
  },
  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },
  lineHeight: {
    tight:  20,
    normal: 24,
    relaxed: 28,
  },
};
