/**
 * LADIVA Design System
 * A comprehensive design system for conversion-focused e-commerce
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Main brand color
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  
  // Secondary Colors
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  
  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  
  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    serif: ['Playfair Display', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  conversion: '0 8px 25px -5px rgba(236, 72, 153, 0.15), 0 4px 6px -2px rgba(236, 72, 153, 0.05)',
};

// Animation Durations
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
};

// Component Variants
export const buttonVariants = {
  primary: {
    base: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200',
    hover: 'hover:from-primary-600 hover:to-primary-700',
    focus: 'focus-visible:ring-4 focus-visible:ring-primary-200 focus-visible:outline-none',
    disabled: 'opacity-50 cursor-not-allowed transform-none',
  },
  secondary: {
    base: 'bg-white text-primary-600 border-2 border-primary-500 shadow-sm hover:shadow-md transition-all duration-200',
    hover: 'hover:bg-primary-50',
    focus: 'focus-visible:ring-4 focus-visible:ring-primary-200 focus-visible:outline-none',
    disabled: 'opacity-50 cursor-not-allowed transform-none',
  },
  outline: {
    base: 'bg-transparent text-primary-600 border-2 border-primary-500 hover:bg-primary-50 transition-all duration-200',
    hover: 'hover:border-primary-600 hover:text-primary-700',
    focus: 'focus-visible:ring-4 focus-visible:ring-primary-200 focus-visible:outline-none',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  ghost: {
    base: 'bg-transparent text-gray-700 hover:bg-gray-100 transition-all duration-200',
    hover: 'hover:text-gray-900',
    focus: 'focus-visible:ring-4 focus-visible:ring-gray-200 focus-visible:outline-none',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  link: {
    base: 'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 transition-all duration-200',
    hover: 'hover:underline',
    focus: 'focus-visible:ring-4 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:outline-none',
    disabled: 'opacity-50 cursor-not-allowed',
  },
};

export const buttonSizes = {
  xs: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  sm: 'px-4 py-2 text-sm font-medium rounded-lg',
  base: 'px-6 py-3 text-base font-medium rounded-xl',
  lg: 'px-8 py-4 text-lg font-medium rounded-xl',
  xl: 'px-10 py-5 text-xl font-medium rounded-2xl',
};

export const cardVariants = {
  default: {
    base: 'bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-700/40 hover:shadow-lg dark:hover:shadow-gray-700 transition-all duration-300 border border-gray-100 dark:border-gray-700',
    hover: 'hover:-translate-y-0.5',
  },
  elevated: {
    base: 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700/40 hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 border border-gray-100 dark:border-gray-700',
    hover: 'hover:-translate-y-1',
  },
  flat: {
    base: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/30 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700',
    hover: 'hover:-translate-y-0.5',
  },
  outlined: {
    base: 'bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300',
    hover: 'hover:shadow-lg dark:hover:shadow-gray-700/50 hover:-translate-y-1',
  },
};

export const badgeVariants = {
  primary: 'bg-primary-100 text-primary-800 font-medium px-3 py-1 rounded-full text-xs',
  secondary: 'bg-secondary-100 text-secondary-800 font-medium px-3 py-1 rounded-full text-xs',
  success: 'bg-success-100 text-success-800 font-medium px-3 py-1 rounded-full text-xs',
  warning: 'bg-warning-100 text-warning-800 font-medium px-3 py-1 rounded-full text-xs',
  error: 'bg-error-100 text-error-800 font-medium px-3 py-1 rounded-full text-xs',
  sale: 'bg-red-500 text-white font-bold px-3 py-1 rounded-full text-xs animate-pulse',
  featured: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-3 py-1 rounded-full text-xs',
};

// Layout Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Container Sizes
export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
  full: '100%',
};

// Grid Systems
export const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

// Conversion-focused utilities
export const conversionStyles = {
  // CTA Button styles for maximum conversion
  ctaButton: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-8 rounded-2xl shadow-conversion hover:shadow-2xl hover:scale-105 transform transition-all duration-200 hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-200 focus:outline-none',
  
  // Trust indicators
  trustBadge: 'bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg font-medium text-sm',
  
  // Urgency indicators
  urgencyBadge: 'bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg font-medium text-sm animate-pulse',
  
  // Social proof
  socialProof: 'bg-gray-50 border border-gray-200 rounded-xl p-4',
  
  // Price display
  priceDisplay: 'text-3xl font-bold text-gray-900',
  originalPrice: 'text-lg text-gray-500 line-through',
  discountPrice: 'text-2xl font-bold text-red-600',
  
  // Scarcity indicators
  scarcityText: 'text-sm font-medium text-orange-600',
  outOfStock: 'text-sm font-medium text-red-600',
};

// Animation keyframes
export const animations = {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'bounce-gentle': 'bounceGentle 2s infinite',
  'pulse-soft': 'pulseSoft 2s infinite',
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  buttonVariants,
  buttonSizes,
  cardVariants,
  badgeVariants,
  breakpoints,
  containerSizes,
  gridCols,
  conversionStyles,
  animations,
};
