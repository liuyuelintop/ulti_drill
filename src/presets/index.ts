import verticalStack from "./formations/vertical_stack.json";
import horizontalStack from "./formations/horizontal_stack.json";
import facial from "./plays/facial.json";
import type { PlaybookData } from "../features/playbook/types";

// Formations (for "Load Preset")
export const PRESETS: PlaybookData[] = [
  verticalStack as PlaybookData,
  horizontalStack as PlaybookData,
];

// Full Plays (for "Load Play")
export const PLAYS: PlaybookData[] = [
  facial as PlaybookData,
];
