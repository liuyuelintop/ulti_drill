import { describe, expect, it } from "vitest";
import {
  addItem,
  applyTeamSize,
  countByType,
  createInitialFrames,
  relabelItem,
  removeItem,
} from "../team";
import type { DraggableItem } from "../../types";

const ids = (frame: DraggableItem[]) => frame.map((i) => i.id).sort();

describe("applyTeamSize", () => {
  it("adds and removes players across every frame", () => {
    const frames = [...createInitialFrames(), ...createInitialFrames()];
    const next = applyTeamSize(frames, 3, 2);

    for (const frame of next) {
      expect(countByType(frame)).toEqual({ offense: 3, defense: 2 });
    }
  });

  it("keeps the positions a player was already dragged to", () => {
    const frames = applyTeamSize(createInitialFrames(), 2, 0);
    frames[0] = frames[0].map((i) =>
      i.id === "offense-2" ? { ...i, x: 12, y: 3 } : i
    );

    const next = applyTeamSize(frames, 4, 0);
    const moved = next[0].find((i) => i.id === "offense-2");
    expect(moved).toMatchObject({ x: 12, y: 3 });
  });

  it("carries cones and annotations through a roster change", () => {
    const { frames } = addItem(createInitialFrames(), "cone", { x: 30, y: 10 });
    const withText = addItem(frames, "text", { x: 40, y: 5 }, "force forehand");

    const next = applyTeamSize(withText.frames, 4, 4);

    expect(ids(next[0])).toContain("cone-1");
    expect(next[0].find((i) => i.id === "text-1")?.label).toBe("force forehand");
  });

  it("renumbers players so labels match their ids", () => {
    const next = applyTeamSize(createInitialFrames(), 5, 3);
    for (const item of next[0]) {
      if (item.type === "offense" || item.type === "defense") {
        expect(item.label).toBe(item.id.split("-")[1]);
      }
    }
  });
});

describe("cones and annotations", () => {
  it("adds to every frame with the same id", () => {
    const frames = [...createInitialFrames(), ...createInitialFrames()];
    const { frames: next, id } = addItem(frames, "cone", { x: 5, y: 5 });

    expect(id).toBe("cone-1");
    expect(next.every((f) => f.some((i) => i.id === id))).toBe(true);
  });

  it("numbers new items past the highest existing one", () => {
    const first = addItem(createInitialFrames(), "cone", { x: 1, y: 1 });
    const second = addItem(first.frames, "cone", { x: 2, y: 2 });
    const third = addItem(removeItem(second.frames, "cone-1"), "cone", {
      x: 3,
      y: 3,
    });

    expect(second.id).toBe("cone-2");
    // cone-2 is still on the field, so reusing 2 would collide.
    expect(third.id).toBe("cone-3");
  });

  it("removes from every frame", () => {
    const frames = [...createInitialFrames(), ...createInitialFrames()];
    const { frames: added, id } = addItem(frames, "text", { x: 5, y: 5 }, "hi");
    const next = removeItem(added, id);

    expect(next.every((f) => f.every((i) => i.id !== id))).toBe(true);
  });

  it("relabels in every frame, so a note reads the same throughout", () => {
    const frames = [...createInitialFrames(), ...createInitialFrames()];
    const { frames: added, id } = addItem(frames, "text", { x: 5, y: 5 }, "old");
    const next = relabelItem(added, id, "trap sideline");

    expect(next.map((f) => f.find((i) => i.id === id)?.label)).toEqual([
      "trap sideline",
      "trap sideline",
    ]);
  });
});
