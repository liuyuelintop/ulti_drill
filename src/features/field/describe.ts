import type { DraggableItem } from "../playbook/types";

const countOf = (items: DraggableItem[], type: DraggableItem["type"]) =>
  items.filter((i) => i.type === type).length;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * A sentence describing what is on the field right now. The canvas is opaque to
 * screen readers, so this is the only thing they have to go on.
 */
export const describeFrame = (
  items: DraggableItem[],
  frameIndex: number,
  frameCount: number,
  note?: string
): string => {
  const parts = [`Frame ${frameIndex + 1} of ${frameCount}`];

  const roster: string[] = [];
  const offense = countOf(items, "offense");
  const defense = countOf(items, "defense");
  const cones = countOf(items, "cone");
  if (offense) roster.push(plural(offense, "attacker"));
  if (defense) roster.push(plural(defense, "defender"));
  if (cones) roster.push(plural(cones, "cone"));
  if (roster.length) parts.push(roster.join(", "));

  const labels = items
    .filter((i) => i.type === "text" && i.label)
    .map((i) => i.label);
  if (labels.length) parts.push(`marked: ${labels.join("; ")}`);

  if (note) parts.push(note);

  return `${parts.join(". ")}.`;
};
