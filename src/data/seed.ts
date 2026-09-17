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
    name: "Vert Stack",
    description:
      "The default offensive set. Five cutters line up in a single stack down the middle, leaving both lanes open for in-cuts and deep shots. Start every new player here.",
    tags: ["basics", "offence"],
    notes: [
      "1 has the disc, 2 sets up behind as the dump. 3-7 stack down the centre line, roughly 5 m apart.",
    ],
  },
  {
    data: horizontalStack as PlaybookData,
    category: "formation",
    name: "Ho Stack",
    description:
      "Three handlers spread across the back, four cutters strung out horizontally. More balanced spacing than vert, and much better when the D is pressuring your handlers.",
    tags: ["basics", "offence"],
    notes: [
      "Three handlers form the back triangle. Four cutters sit around 15 m out, each owning one vertical lane.",
    ],
  },
  {
    data: facial as PlaybookData,
    category: "play",
    name: "Facial",
    description:
      "Pull play. A cutter sells the in-cut to open up the forehand side, then turns deep for a full-field huck. Our go-to on the first possession after the pull.",
    tags: ["pull play", "huck"],
    notes: [],
  },
  {
    data: creampie as PlaybookData,
    category: "play",
    name: "Creampie",
    description:
      "Mid-field reset and go. Quick handler swing drags the defence across, then the weak-side cutter comes under into the space nobody is covering.",
    tags: ["reset", "handler movement"],
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
