/**
 * Design Tokens for Ultimate Playbook Tactical Animator
 * Light Mode: High Energy, Fresh, Modern Aesthetic
 */

// Ultimate-themed Color Palette
export const colors = {
  // Primary: Vibrant Sky Blue (High Energy)
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Main primary
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },

  // Accent: Electric Indigo/Violet for pop
  accent: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6", // Main accent
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },

  // Team Colors (Ultimate Frisbee standard - adjusted for light mode)
  team: {
    offense: "#f43f5e", // Rose-500 (vibrant red)
    offenseLight: "#fb7185", // Rose-400
    offenseDark: "#e11d48", // Rose-600
    defense: "#3b82f6", // Blue-500 (vibrant blue)
    defenseLight: "#60a5fa", // Blue-400
    defenseDark: "#2563eb", // Blue-600
    disc: "#ffffff", // Amber-400 #fbbf24
    discGlow: "#ffffff", // Amber-300 #fcd34d
  },

  // Neutrals: Slate (Clean, professional grays)
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  // Semantic Colors
  success: {
    light: "#86efac",
    main: "#22c55e", // Green-500
    dark: "#16a34a",
  },
  warning: {
    light: "#fde047",
    main: "#eab308", // Yellow-500
    dark: "#ca8a04",
  },
  danger: {
    light: "#fca5a5",
    main: "#ef4444", // Red-500
    dark: "#dc2626",
  },

  // Field Colors (Fresh Day Game Look - Darker Greens)
  field: {
    grass: "#16a34a", // Green-600 (Main field grass, darker)
    grassLight: "#22c55e", // Green-500 (Alternating strips, slightly lighter)
    endzone: "#15803d", // Green-700 (Endzone, darkest green)
    lines: "#ffffff", // Pure white
    linesSubtle: "rgba(255, 255, 255, 0.4)", // More visible on bright green
  },

  // UI Colors (Light Mode)
  background: {
    primary: "#f8fafc", // Slate-50 (Page BG)
    secondary: "#ffffff", // White (Card BG)
    tertiary: "#f1f5f9", // Slate-100 (Subtle BG)
    card: "#ffffff",
    elevated: "#ffffff",
  },

  // Selection & Interaction
  selection: {
    main: "#fbbf24", // Sky blue #0ea5e9
    glow: "rgba(14, 165, 233, 0.4)",
  },

  // Border colors
  border: {
    primary: "#e2e8f0", // Slate-200
    secondary: "#cbd5e1", // Slate-300
  },

  // Text colors
  text: {
    primary: "#0f172a", // Slate-900 (Main text)
    secondary: "#475569", // Slate-600 (Subtitles)
    muted: "#94a3b8", // Slate-400
    inverse: "#ffffff", // Text on dark backgrounds (buttons/field)
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// Spacing Scale (4px base grid)
export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// Border Radius Scale
export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// Shadow System (Light Mode - Softer, more diffused)
export const shadows = {
  none: "none",
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
  elevated:
    "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)", // Softer shadow
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  overlay: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  glow: "0 0 15px rgba(14, 165, 233, 0.5)", // Sky blue glow
} as const;

// Transitions
export const transitions = {
  fast: "100ms ease-in-out",
  base: "150ms ease-in-out",
  slow: "300ms ease-in-out",
  bounce: "300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// Breakpoints (for responsive design)
export const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: "2rem", // 32px
      md: "2.5rem", // 40px
      lg: "3rem", // 48px
    },
    padding: {
      sm: "0.5rem 1rem", // 8px 16px
      md: "0.625rem 1.5rem", // 10px 24px
      lg: "0.75rem 2rem", // 12px 32px
    },
  },
  canvas: {
    border: `2px solid ${colors.neutral[200]}`,
    borderRadius: borderRadius.xl,
    shadow: shadows.elevated,
  },
} as const;

// Export all tokens as a single object for convenience
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
} as const;

export default designTokens;
