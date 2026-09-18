import type { ItemType } from "../playbook/types";

export type FieldThemeName = "grass" | "diagram";

export interface FieldTheme {
  name: FieldThemeName;
  grass: string;
  grassAlt: string;
  endzone: string;
  endzoneOpacity: number;
  /** Mown stripes belong on grass, not on a printed diagram. */
  stripes: boolean;
  line: string;
  lineSoft: string;
  lineFaint: string;
  text: string;
  /** Outline drawn around tokens so they separate from the field. */
  tokenStroke: string;
  /** Number printed inside a player token. */
  tokenLabel: string;
  offense: string;
  defense: string;
  cone: string;
  disc: string;
  discRing: string;
  annotation: string;
  annotationBacking: string;
  selected: string;
  handle: string;
}

/**
 * Grass reads like the real thing; diagram is flat and high-contrast, which
 * survives direct sunlight and black-and-white printing far better.
 */
export const FIELD_THEMES: Record<FieldThemeName, FieldTheme> = {
  grass: {
    name: "grass",
    grass: "#2f7d4f",
    grassAlt: "#2b7449",
    endzone: "#256541",
    endzoneOpacity: 0.55,
    stripes: true,
    line: "rgba(255,255,255,0.85)",
    lineSoft: "rgba(255,255,255,0.28)",
    lineFaint: "rgba(255,255,255,0.14)",
    text: "rgba(255,255,255,0.45)",
    tokenStroke: "rgba(255,255,255,0.92)",
    tokenLabel: "#ffffff",
    offense: "#ef4444",
    defense: "#1d4ed8",
    cone: "#f59e0b",
    disc: "#ffffff",
    discRing: "#0f172a",
    annotation: "#ffffff",
    annotationBacking: "rgba(2,6,23,0.55)",
    selected: "#facc15",
    handle: "rgba(255,255,255,0.9)",
  },
  diagram: {
    name: "diagram",
    grass: "#f1f5f9",
    grassAlt: "#e8eef4",
    endzone: "#cbd5e1",
    endzoneOpacity: 0.7,
    stripes: false,
    line: "rgba(15,23,42,0.7)",
    lineSoft: "rgba(15,23,42,0.3)",
    lineFaint: "rgba(15,23,42,0.16)",
    text: "rgba(15,23,42,0.45)",
    tokenStroke: "rgba(15,23,42,0.85)",
    tokenLabel: "#ffffff",
    offense: "#dc2626",
    defense: "#1d4ed8",
    cone: "#d97706",
    disc: "#ffffff",
    discRing: "#0f172a",
    annotation: "#0f172a",
    annotationBacking: "rgba(255,255,255,0.78)",
    selected: "#ca8a04",
    handle: "rgba(15,23,42,0.75)",
  },
};

export const DEFAULT_THEME: FieldThemeName = "grass";

/**
 * Shape carries the offence/defence distinction as well as colour does, so the
 * diagram still works for the ~8% of men with red–green colour blindness, and
 * in greyscale. Circle = offence, square = defence, triangle = cone.
 */
export type TokenShape = "circle" | "square" | "triangle" | "disc" | "text";

export const shapeFor = (type: ItemType): TokenShape => {
  switch (type) {
    case "offense":
      return "circle";
    case "defense":
      return "square";
    case "cone":
      return "triangle";
    case "text":
      return "text";
    default:
      return "disc";
  }
};

export const colorFor = (type: ItemType, theme: FieldTheme): string => {
  switch (type) {
    case "offense":
      return theme.offense;
    case "defense":
      return theme.defense;
    case "cone":
      return theme.cone;
    case "text":
      return theme.annotation;
    default:
      return theme.disc;
  }
};

/** Sizes in logical field units (metres), with a pixel floor for small screens. */
export const PLAYER_RADIUS_M = 1.15;
export const DISC_RADIUS_M = 0.7;
export const CONE_RADIUS_M = 0.85;
export const MIN_PLAYER_RADIUS_PX = 13;
export const MIN_DISC_RADIUS_PX = 6;
export const MIN_CONE_RADIUS_PX = 9;
/** Extra transparent padding around tokens so fingers can grab them. */
export const TOUCH_PADDING_PX = 12;

export const radiusFor = (type: ItemType, scale: number) => {
  switch (type) {
    case "disc":
      return Math.max(DISC_RADIUS_M * scale, MIN_DISC_RADIUS_PX);
    case "cone":
      return Math.max(CONE_RADIUS_M * scale, MIN_CONE_RADIUS_PX);
    case "text":
      return Math.max(PLAYER_RADIUS_M * scale, MIN_PLAYER_RADIUS_PX);
    default:
      return Math.max(PLAYER_RADIUS_M * scale, MIN_PLAYER_RADIUS_PX);
  }
};
