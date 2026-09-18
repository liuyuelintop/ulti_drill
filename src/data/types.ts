import type { DraggableItem, ItemType } from "../features/playbook/types";

export type PlayCategory = "play" | "formation" | "drill";

export const CATEGORY_LABELS: Record<PlayCategory, string> = {
  play: "Play",
  formation: "Formation",
  drill: "Drill",
};

/** One tactic in the team playbook. Column names match the Supabase table. */
export interface Play {
  id: string;
  name: string;
  category: PlayCategory;
  description: string;
  tags: string[];
  /** Positions per frame, in logical field units (meters, WFDF). */
  frames: DraggableItem[][];
  /** Coaching point for each frame, parallel to `frames`. */
  frame_notes: string[];
  author: string;
  created_at: string;
  updated_at: string;
}

export type PlayDraft = Omit<Play, "created_at" | "updated_at"> &
  Partial<Pick<Play, "created_at" | "updated_at">>;

export const emptyPlay = (author: string): Play => ({
  id: crypto.randomUUID(),
  name: "",
  category: "play",
  description: "",
  tags: [],
  frames: [],
  frame_notes: [],
  author,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const ITEM_TYPES: ItemType[] = ["offense", "defense", "disc", "cone", "text"];

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * Items arrive from the network and from files written by older versions, so
 * anything that isn't a drawable token is dropped rather than rendered as one.
 */
const normalizeItem = (raw: unknown): DraggableItem | null => {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<DraggableItem>;
  const x = num(item.x);
  const y = num(item.y);
  if (typeof item.id !== "string" || x === undefined || y === undefined) return null;
  if (!ITEM_TYPES.includes(item.type as ItemType)) return null;

  const cx = num(item.cx);
  const cy = num(item.cy);
  return {
    id: item.id,
    type: item.type as ItemType,
    x,
    y,
    label: typeof item.label === "string" ? item.label : "",
    // A control point only means anything with both halves present.
    ...(cx !== undefined && cy !== undefined ? { cx, cy } : {}),
  };
};

export const normalizeFrames = (raw: unknown): DraggableItem[][] =>
  Array.isArray(raw)
    ? raw.map((frame) =>
        Array.isArray(frame)
          ? frame
              .map(normalizeItem)
              .filter((item): item is DraggableItem => item !== null)
          : []
      )
    : [];

/** Coerce anything coming from the network or old files into a valid Play. */
export const normalizePlay = (raw: Partial<Play> & { id?: string }): Play => {
  const frames = normalizeFrames(raw.frames);
  const notes = Array.isArray(raw.frame_notes) ? raw.frame_notes : [];
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() || "Untitled play",
    category: (["play", "formation", "drill"] as const).includes(
      raw.category as PlayCategory
    )
      ? (raw.category as PlayCategory)
      : "play",
    description: raw.description ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],
    frames,
    frame_notes: frames.map((_, i) => notes[i] ?? ""),
    author: raw.author ?? "",
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
  };
};
