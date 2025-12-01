import { colors } from "../../../shared/design/tokens";

// Player and Disc Sizes (Logical Units - approx 0.7 yards/meters diameter)
// We still need pixel sizes for the tokens themselves to ensure visibility
export const PLAYER_RADIUS_PX = 14;
export const DISC_RADIUS_PX = 8;
export const GHOST_OPACITY = 0.4;
export const SELECTION_STROKE_WIDTH = 2;

// Default logical offsets (in Units)
// Assuming standard unit is ~1 yard/meter.
export const DEFENSE_OFFSETS_LOGICAL = {
  VERTICAL: {
    HANDLER: { x: 1, y: -2 },
    DUMP: { x: 2, y: -1 },
    STACK: { x: -1, y: 1 },
  },
  HORIZONTAL: {
    HANDLER_CENTER: { x: 1, y: -1 },
    HANDLER_WING: { x: 2, y: 0 },
    CUTTER: { x: -2, y: 0 },
  },
};

// Canvas Colors (using design tokens for consistency)
export const COLORS = {
  // Field colors (Light Mode: Fresh Day Game)
  GRASS: colors.field.grass,
  GRASS_LIGHT: colors.field.grassLight,
  GRASS_DARK: colors.field.endzone,
  LINE: colors.field.lines,
  LINE_SUBTLE: colors.field.linesSubtle,

  // Team colors
  OFFENSE: colors.team.offense,
  OFFENSE_LIGHT: colors.team.offenseLight,
  DEFENSE: colors.team.defense,
  DEFENSE_LIGHT: colors.team.defenseLight,

  // Disc
  DISC: colors.team.disc,
  DISC_GLOW: colors.team.discGlow,

  // Selection & Interaction
  SELECTED: colors.selection.main, // Sky blue
  SELECTED_GLOW: colors.selection.glow,
  GHOST: `rgba(15, 23, 42, ${GHOST_OPACITY})`, // Slate-900 at low opacity for ghosts (better than white on green)

  // UI Colors
  BACKGROUND_PRIMARY: colors.background.primary,
  BACKGROUND_SECONDARY: colors.background.secondary,
};
