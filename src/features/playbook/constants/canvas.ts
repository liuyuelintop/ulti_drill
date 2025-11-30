import { colors } from "../../../shared/design/tokens";

// Field Dimensions (8px scale for yard markings)
export const SCALE = 8;
export const FIELD_LENGTH = 110 * SCALE; // 880px
export const FIELD_WIDTH = 40 * SCALE; // 320px
export const ENDZONE_LENGTH = 20 * SCALE; // 160px
export const BRICK_MARK = 18 * SCALE; // 144px from goal line

// Player and Disc Sizes
export const PLAYER_RADIUS = 14; // px
export const PLAYER_DIAMETER = 2 * PLAYER_RADIUS;
export const DISC_RADIUS = 8; // px
export const GHOST_OPACITY = 0.4; // Increased opacity for better visibility on bright field
export const SELECTION_STROKE_WIDTH = 2; // px

// Defense positioning offsets
export const DEFENSE_OFFSETS = {
  VERTICAL: {
    HANDLER: { x: PLAYER_RADIUS, y: -PLAYER_DIAMETER },
    DUMP: { x: PLAYER_DIAMETER, y: -PLAYER_RADIUS },
    STACK: { x: -PLAYER_RADIUS, y: PLAYER_RADIUS },
  },
  HORIZONTAL: {
    HANDLER_CENTER: { x: PLAYER_RADIUS, y: -PLAYER_RADIUS },
    HANDLER_WING: { x: PLAYER_DIAMETER, y: 0 },
    CUTTER: { x: -PLAYER_DIAMETER, y: 0 },
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
