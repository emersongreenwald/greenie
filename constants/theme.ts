export const colors = {
  brand: {
    default: '#557A62',
    muted:   '#eaf2ee',
    dark:    '#3d5a49',
    border:  '#c5d8cc',
  },
  cream:    '#faf8f4',
  charcoal: '#1c2620',
  text: {
    secondary: '#4a5e54',
    muted:     '#7e9488',
  },
  gold: {
    default: '#c9a050',
    light:   '#fef6e4',
    dark:    '#9a7838',
  },
  blush: {
    default: '#e8c5bb',
    light:   '#fdf2ee',
  },
  border:  '#e0d9d0',
  error:   '#dc4f4f',
  white:   '#ffffff',
  black:   '#000000',
};

export const fonts = {
  regular:   'Manrope-Regular',
  medium:    'Manrope-Medium',
  semibold:  'Manrope-SemiBold',
  bold:      'Manrope-Bold',
  extrabold: 'Manrope-ExtraBold',
};

// Reuse with style={shadows.card} on any white card view
export const shadows = {
  card: {
    shadowColor: '#1c2620' as const,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 };
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };
export const typography = {
  size: { xs: 12, sm: 13, base: 15, lg: 17, xl: 20, '2xl': 24, '3xl': 32 },
};
