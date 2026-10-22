/**
 * Keeping the 3D view's frame rate steady instead of its resolution fixed.
 *
 * Two small controllers the render loop consults every frame. Neither knows
 * about three.js; both are fed times in milliseconds, so they are tested as
 * plain arithmetic.
 */

/**
 * At most one frame per sixtieth of a second, whatever the screen.
 *
 * Many phones refresh at 90 or 120 Hz, and the browser asks for a frame at
 * every refresh. The scene moves slowly enough that 60 frames a second is
 * already smooth; drawing twice as many only drains the battery and heats the
 * phone until it throttles. The gate keeps a running schedule rather than a
 * plain minimum gap, so a 90 Hz screen still gets about 60 frames a second
 * instead of every other refresh (45).
 */
export class FrameGate {
  private next = -Infinity;
  constructor(
    /** Frames a second at most. */
    readonly fps = 60,
    /** How early a frame may come and still count, in ms (refresh jitter). */
    readonly slack = 2,
  ) {}

  /** Whether to draw at `now` (ms). */
  tick(now: number): boolean {
    const interval = 1000 / this.fps;
    if (now < this.next - this.slack) return false;
    // Behind by more than a frame (a stall, a hidden tab): start afresh
    // rather than racing to catch up.
    this.next = now - this.next > interval ? now + interval : this.next + interval;
    return true;
  }

  /** Forget the schedule, after the loop was paused. */
  reset(): void {
    this.next = -Infinity;
  }
}

export type ResolutionOptions = {
  /** The pixel ratio to draw at when frames are fast enough. */
  max: number;
  /** The lowest it may go. */
  min: number;
  /** The frame time to hold, in ms. */
  targetMs?: number;
  /** Frames in each verdict. */
  window?: number;
  /** Seconds after a change before the next one. */
  cooldown?: number;
};

/**
 * Dynamic resolution: the pixel ratio follows the measured frame time.
 *
 * Frames slower than the target for a window of them (by the median, so one
 * hitch from a texture upload does not count) step the ratio down; a run of
 * frames comfortably on time steps it back up toward the maximum. Steps are
 * a tenth or so and spaced by a cool-down, because each change reallocates
 * the drawing buffers, and a ratio that hunted up and down would be worse
 * than either. On a desktop that keeps up, nothing ever changes.
 */
export class AdaptiveResolution {
  ratio: number;
  readonly max: number;
  readonly min: number;
  private readonly target: number;
  private readonly window: number;
  private readonly cooldown: number;
  private samples: number[] = [];
  private lastChange = -Infinity;
  private goodRuns = 0;

  constructor(options: ResolutionOptions) {
    this.max = Math.max(options.max, options.min);
    this.min = Math.min(options.min, this.max);
    this.ratio = this.max;
    this.target = options.targetMs ?? 1000 / 60;
    this.window = options.window ?? 30;
    this.cooldown = options.cooldown ?? 2;
  }

  /**
   * One frame took `ms`, at time `now` (seconds). Returns the new ratio when
   * it changes, `null` otherwise.
   */
  sample(ms: number, now: number): number | null {
    // A hidden tab or a stall is not a measure of drawing.
    if (!Number.isFinite(ms) || ms <= 0 || ms > 250) return null;
    this.samples.push(ms);
    if (this.samples.length < this.window) return null;
    const sorted = [...this.samples].sort((a, b) => a - b);
    this.samples = [];
    const median = sorted[Math.floor(sorted.length / 2)]!;
    if (now - this.lastChange < this.cooldown) return null;
    let next = this.ratio;
    if (median > this.target * 1.25) {
      this.goodRuns = 0;
      // Fill cost goes with the square of the ratio: aim at the target, but
      // never more than a quarter down in one step.
      const wanted = this.ratio * Math.sqrt((this.target * 1.05) / median);
      next = Math.max(this.min, Math.max(wanted, this.ratio * 0.75));
    } else if (median < this.target * 1.08) {
      this.goodRuns += 1;
      // Up again only after a few good windows in a row, a step at a time.
      if (this.goodRuns >= 3 && this.ratio < this.max) {
        next = Math.min(this.max, this.ratio * 1.12);
        this.goodRuns = 0;
      }
    } else {
      this.goodRuns = 0;
    }
    next = Math.round(next * 100) / 100;
    if (Math.abs(next - this.ratio) < 0.01) return null;
    this.ratio = next;
    this.lastChange = now;
    return next;
  }

  /**
   * A new ceiling (the light setting switched, say). The ratio starts again
   * from it, and is measured down afresh if the frames still cannot keep up.
   */
  setMax(max: number, now = -Infinity): number {
    (this as { max: number }).max = Math.max(max, this.min);
    this.ratio = this.max;
    this.lastChange = now;
    this.samples = [];
    this.goodRuns = 0;
    return this.ratio;
  }
}

/**
 * Level of detail with a margin: whether something is drawn in full detail,
 * given whether it was last frame and its squared distance from the eye. It
 * switches to the detailed version inside `near` and back only beyond `far`,
 * so somebody standing right at the edge does not flicker between the two.
 */
export function detailed(wasDetailed: boolean, distanceSq: number, near: number, far: number) {
  const edge = wasDetailed ? Math.max(near, far) : near;
  return distanceSq < edge * edge;
}
