import { describe, expect, test } from "bun:test";
import { joystickRuns, joystickVector } from "@/lib/joystick";

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-9);

describe("walk joystick", () => {
  test("a resting or barely touched stick stands still", () => {
    expect(joystickVector(0, 0)).toEqual({ forward: 0, right: 0 });
    expect(joystickVector(0.1, -0.1)).toEqual({ forward: 0, right: 0 });
  });
  test("up walks forward, down back, the sides step sideways", () => {
    expect(joystickVector(0, -1)).toEqual({ forward: 1, right: 0 });
    expect(joystickVector(0, 1)).toEqual({ forward: -1, right: 0 });
    expect(joystickVector(-1, 0)).toEqual({ forward: 0, right: -1 });
    expect(joystickVector(1, 0)).toEqual({ forward: 0, right: 1 });
  });
  test("distance is speed, from nothing at the dead zone to full at the rim", () => {
    const half = joystickVector(0, -0.59).forward;
    expect(half).toBeGreaterThan(0.45);
    expect(half).toBeLessThan(0.55);
    expect(joystickVector(0, -0.19).forward).toBeLessThan(0.02);
    expect(joystickVector(0, -3).forward).toBe(1);
  });
  test("a diagonal keeps its angle and never exceeds full speed", () => {
    const v = joystickVector(0.8, -0.8);
    near(v.forward, v.right);
    near(Math.hypot(v.forward, v.right), 1);
  });
  test("pushed well past the rim, it runs", () => {
    expect(joystickRuns(0, -1)).toBe(false);
    expect(joystickRuns(0, -1.5)).toBe(true);
  });
});
