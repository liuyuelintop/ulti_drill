import { designTokens } from './src/shared/design/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        accent: designTokens.colors.accent,
        team: designTokens.colors.team,
        // Override default slate with our neutral palette
        slate: designTokens.colors.neutral,
        // Semantic colors
        success: designTokens.colors.success.main,
        warning: designTokens.colors.warning.main,
        danger: designTokens.colors.danger.main,
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans.split(', '),
        mono: designTokens.typography.fontFamily.mono.split(', '),
      },
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: {
        ...designTokens.shadows,
      },
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      zIndex: designTokens.zIndex,
      screens: {
        sm: designTokens.breakpoints.sm,
        md: designTokens.breakpoints.md,
        lg: designTokens.breakpoints.lg,
        xl: designTokens.breakpoints.xl,
        '2xl': designTokens.breakpoints['2xl'],
      },
      keyframes: {
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'slide-down': 'slide-down 150ms ease-out',
        'slide-up': 'slide-up 150ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
