import { describe, expect, it } from "vitest";
import { normalizeFrames, normalizePlay } from "../types";

describe("normalizeFrames", () => {
  it("keeps a well-formed item, including its control point", () => {
    const frames = normalizeFrames([
      [{ id: "offense-1", type: "offense", x: 1, y: 2, label: "1", cx: 3, cy: 4 }],
    ]);

    expect(frames[0][0]).toEqual({
      id: "offense-1",
      type: "offense",
      x: 1,
      y: 2,
      label: "1",
      cx: 3,
      cy: 4,
    });
  });

  it("drops a control point that is only half present", () => {
    const frames = normalizeFrames([
      [{ id: "offense-1", type: "offense", x: 1, y: 2, cx: 3 }],
    ]);

    expect(frames[0][0]).not.toHaveProperty("cx");
    expect(frames[0][0]).not.toHaveProperty("cy");
  });

  it("drops items of an unknown type rather than drawing them as a disc", () => {
    const frames = normalizeFrames([
      [
        { id: "a", type: "offense", x: 1, y: 1 },
        { id: "b", type: "spaceship", x: 2, y: 2 },
      ],
    ]);

    expect(frames[0].map((i) => i.id)).toEqual(["a"]);
  });

  it("drops items with missing or non-finite coordinates", () => {
    const frames = normalizeFrames([
      [
        { id: "a", type: "cone", x: 1, y: 1 },
        { id: "b", type: "cone", x: "3", y: 1 },
        { id: "c", type: "cone", x: Number.NaN, y: 1 },
        { id: "d", type: "cone", y: 1 },
        { type: "cone", x: 1, y: 1 },
        null,
      ],
    ]);

    expect(frames[0].map((i) => i.id)).toEqual(["a"]);
  });

  it("survives junk where frames should be", () => {
    expect(normalizeFrames(undefined)).toEqual([]);
    expect(normalizeFrames("nope")).toEqual([]);
    expect(normalizeFrames([null, 7])).toEqual([[], []]);
  });
});

describe("normalizePlay", () => {
  it("pads frame notes to match the frame count", () => {
    const play = normalizePlay({
      frames: [
        [{ id: "a", type: "offense", x: 1, y: 1 }],
        [{ id: "a", type: "offense", x: 2, y: 2 }],
      ],
      frame_notes: ["first"],
    });

    expect(play.frame_notes).toEqual(["first", ""]);
  });

  it("names an untitled play rather than leaving it blank", () => {
    expect(normalizePlay({ name: "   " }).name).toBe("Untitled play");
  });

  it("falls back to the play category for an unknown one", () => {
    expect(normalizePlay({ category: "nonsense" as never }).category).toBe("play");
  });
});
