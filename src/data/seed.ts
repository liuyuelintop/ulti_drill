import verticalStack from "../presets/formations/vertical_stack.json";
import horizontalStack from "../presets/formations/horizontal_stack.json";
import facial from "../presets/plays/facial.json";
import creampie from "../presets/plays/creampie.json";
import type { PlaybookData } from "../features/playbook/types";
import type { Play, PlayCategory } from "./types";

interface SeedSpec {
  data: PlaybookData;
  category: PlayCategory;
  name: string;
  description: string;
  tags: string[];
  notes: string[];
}

const SEEDS: SeedSpec[] = [
  {
    data: verticalStack as PlaybookData,
    category: "formation",
    name: "竖线站位 Vert Stack",
    description:
      "最基础的进攻站位。五名 cutter 在中间排成一条竖线，两侧留出大片空间给 in-cut 和 deep。新队员先把这个站住。",
    tags: ["基础", "进攻站位"],
    notes: ["1 号持盘，2 号 dump 在身后。3-7 号沿中线站开，彼此间隔约 5 米。"],
  },
  {
    data: horizontalStack as PlaybookData,
    category: "formation",
    name: "横线站位 Ho Stack",
    description:
      "三 handler 两侧展开，四名 cutter 横向排开。进攻空间更均衡，适合对方压迫 handler 时使用。",
    tags: ["基础", "进攻站位"],
    notes: ["三名 handler 在下方三角，四名 cutter 横排在 15 米附近，各自负责一条纵向通道。"],
  },
  {
    data: facial as PlaybookData,
    category: "play",
    name: "Facial",
    description:
      "起手战术。利用 cutter 的假动作制造正手侧大空档，handler 一脚长传打身后。开球后第一波进攻常用。",
    tags: ["起手", "长传"],
    notes: [],
  },
  {
    data: creampie as PlaybookData,
    category: "play",
    name: "Creampie",
    description:
      "中场推进套路。handler 之间快速倒盘拉动防守重心，边路 cutter 顺势切入拿到不设防的接盘点。",
    tags: ["推进", "handler 配合"],
    notes: [],
  },
];

/** Built-in plays, used to bootstrap an empty playbook. */
export const seedPlays = (author: string): Play[] => {
  const now = new Date().toISOString();
  return SEEDS.map((seed) => ({
    id: crypto.randomUUID(),
    name: seed.name,
    category: seed.category,
    description: seed.description,
    tags: seed.tags,
    frames: seed.data.frames,
    frame_notes: seed.data.frames.map((_, i) => seed.notes[i] ?? ""),
    author,
    created_at: now,
    updated_at: now,
  }));
};
