import { describe, expect, it } from "vitest";
import {
  controlToHandle,
  handleToControl,
  pointOnPath,
  type DraggableItem,
} from "../types";

const at = (x: number, y: number): DraggableItem => ({
  id: "offense-1",
  type: "offense",
  x,
  y,
});

describe("pointOnPath", () => {
  it("interpolates in a straight line when there is no control point", () => {
    expect(pointOnPath(at(0, 0), at(10, 20), 0.5)).toEqual({ x: 5, y: 10 });
  });

  it("starts at the previous position and ends at this one", () => {
    const to = { ...at(10, 0), cx: 5, cy: 9 };
    expect(pointOnPath(at(0, 0), to, 0)).toEqual({ x: 0, y: 0 });
    expect(pointOnPath(at(0, 0), to, 1)).toEqual({ x: 10, y: 0 });
  });

  it("bends away from the straight line when a control point is set", () => {
    // A cutter faking underneath before turning deep bows off the chord.
    const to = { ...at(10, 0), cx: 5, cy: 12 };
    expect(pointOnPath(at(0, 0), to, 0.5).y).toBeGreaterThan(0);
  });

  it("ignores a half-set control point", () => {
    const to = { ...at(10, 0), cx: 5 };
    expect(pointOnPath(at(0, 0), to, 0.5)).toEqual({ x: 5, y: 0 });
  });
});

describe("curve handle conversion", () => {
  it("round-trips: the handle lands where it was dragged", () => {
    const from = at(3, 4);
    const end = at(21, 9);
    const dropped = { x: 14, y: 22 };

    const { cx, cy } = handleToControl(from, end, dropped);
    const handle = controlToHandle(from, { ...end, cx, cy });

    expect(handle.x).toBeCloseTo(dropped.x, 10);
    expect(handle.y).toBeCloseTo(dropped.y, 10);
  });

  it("puts the handle on the chord midpoint for a straight path", () => {
    expect(controlToHandle(at(0, 0), at(8, 6))).toEqual({ x: 4, y: 3 });
  });
});
