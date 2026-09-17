/** Visual language for the field canvas. Tuned for outdoor phone screens. */
export const FIELD_THEME = {
  grass: "#2f7d4f",
  grassAlt: "#2b7449",
  endzone: "#256541",
  line: "rgba(255,255,255,0.85)",
  lineSoft: "rgba(255,255,255,0.28)",
  lineFaint: "rgba(255,255,255,0.14)",
  text: "rgba(255,255,255,0.45)",

  offense: "#ef4444",
  offenseDark: "#b91c1c",
  defense: "#2563eb",
  defenseDark: "#1d4ed8",
  disc: "#ffffff",
  discRing: "#0f172a",

  trail: "rgba(255,255,255,0.75)",
  ghost: "rgba(255,255,255,0.35)",
  selected: "#facc15",
} as const;

/** Sizes in logical field units (meters), with a pixel floor for small screens. */
export const PLAYER_RADIUS_M = 1.15;
export const DISC_RADIUS_M = 0.7;
export const MIN_PLAYER_RADIUS_PX = 13;
export const MIN_DISC_RADIUS_PX = 6;
/** Extra transparent padding around tokens so fingers can grab them. */
export const TOUCH_PADDING_PX = 12;

export const radiusFor = (type: string, scale: number) =>
  type === "disc"
    ? Math.max(DISC_RADIUS_M * scale, MIN_DISC_RADIUS_PX)
    : Math.max(PLAYER_RADIUS_M * scale, MIN_PLAYER_RADIUS_PX);
