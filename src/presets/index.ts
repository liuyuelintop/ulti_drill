import verticalStack from "./vertical_stack.json";
import horizontalStack from "./horizontal_stack.json";
import type { PlaybookData } from "../features/playbook/types";

export const PRESETS: PlaybookData[] = [
  verticalStack as PlaybookData,
  horizontalStack as PlaybookData,
];
