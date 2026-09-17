import type { DraggableItem } from "../features/playbook/types";

export type PlayCategory = "play" | "formation" | "drill";

export const CATEGORY_LABELS: Record<PlayCategory, string> = {
  play: "战术",
  formation: "站位",
  drill: "训练 Drill",
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

/** Coerce anything coming from the network or old files into a valid Play. */
export const normalizePlay = (raw: Partial<Play> & { id?: string }): Play => {
  const frames = Array.isArray(raw.frames) ? raw.frames : [];
  const notes = Array.isArray(raw.frame_notes) ? raw.frame_notes : [];
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() || "未命名战术",
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
