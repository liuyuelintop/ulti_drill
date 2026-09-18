import { describe, expect, it } from "vitest";
import { FULL_FIELD, expandToFill, playRegion } from "../bounds";
import type { DraggableItem } from "../../playbook/types";

const item = (x: number, y: number): DraggableItem => ({
  id: `o-${x}-${y}`,
  type: "offense",
  x,
  y,
});

const size = (r: { x0: number; x1: number; y0: number; y1: number }) => ({
  length: r.x1 - r.x0,
  width: r.y1 - r.y0,
});

describe("playRegion", () => {
  it("falls back to the whole field when there is nothing to frame", () => {
    expect(playRegion([])).toEqual(FULL_FIELD);
    expect(playRegion([[]])).toEqual(FULL_FIELD);
  });

  it("never zooms past the minimum window for a tight formation", () => {
    const region = playRegion([[item(50, 18), item(52, 19)]]);
    const { length, width } = size(region);

    expect(length).toBeGreaterThanOrEqual(38);
    expect(width).toBeGreaterThanOrEqual(22);
  });

  it("stays inside the field when the play hugs an end zone", () => {
    const region = playRegion([[item(1, 1), item(6, 4)]]);

    expect(region.x0).toBeGreaterThanOrEqual(0);
    expect(region.y0).toBeGreaterThanOrEqual(0);
    expect(region.x1).toBeLessThanOrEqual(FULL_FIELD.x1);
    expect(region.y1).toBeLessThanOrEqual(FULL_FIELD.y1);
  });

  it("covers every frame, not just the first", () => {
    const region = playRegion([[item(30, 18)], [item(85, 30)]]);

    expect(region.x0).toBeLessThanOrEqual(30);
    expect(region.x1).toBeGreaterThanOrEqual(85);
    expect(region.y1).toBeGreaterThanOrEqual(30);
  });
});

describe("expandToFill", () => {
  const region = { x0: 40, y0: 10, x1: 70, y1: 27 };

  it("leaves the region alone when it already overflows the viewport", () => {
    expect(expandToFill(region, 10, 100, 100, false)).toEqual(region);
  });

  it("grows the region rather than leaving empty gutters", () => {
    const grown = expandToFill(region, 4, 400, 400, false);

    expect(size(grown).length).toBeGreaterThan(size(region).length);
    expect(size(grown).width).toBeGreaterThan(size(region).width);
  });

  it("never grows past the field edges", () => {
    const grown = expandToFill(region, 1, 4000, 4000, false);

    expect(grown.x0).toBeGreaterThanOrEqual(0);
    expect(grown.y0).toBeGreaterThanOrEqual(0);
    expect(grown.x1).toBeLessThanOrEqual(FULL_FIELD.x1);
    expect(grown.y1).toBeLessThanOrEqual(FULL_FIELD.y1);
  });

  it("swaps which screen axis maps to field length when rotated", () => {
    const wide = expandToFill(region, 4, 800, 200, false);
    const tall = expandToFill(region, 4, 800, 200, true);

    expect(size(wide).length).toBeGreaterThan(size(tall).length);
  });

  it("is a no-op before the container has been measured", () => {
    expect(expandToFill(region, 0, 100, 100, false)).toEqual(region);
  });
});
