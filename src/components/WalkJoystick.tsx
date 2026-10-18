import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { joystickRuns, joystickVector } from "@/lib/joystick";

/**
 * A thumb stick for walking on a touch screen: put a thumb on it and slide.
 * The angle is the direction — up forward, down back, the sides a step
 * sideways — and the distance from the centre is the speed; pushed well past
 * the rim, it runs. Looking round stays a drag on the model itself, and a
 * pinch still steps.
 *
 * The push is written into `stick`, which the 3D view reads every frame
 * (its `walkStick` prop); running is the Shift key the keyboard already uses.
 */

/** `className` has to position it (absolute or relative): the rings are laid over it. */
export function WalkJoystick({
  label,
  stick,
  className = "relative",
}: {
  label: string;
  stick: { current: { forward: number; right: number } };
  className?: string;
}) {
  const base = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const running = useRef(false);
  // Where the knob is drawn, in pixels from the centre, clamped to the rim.
  const [knob, setKnob] = useState({ x: 0, y: 0, on: false, run: false });

  const run = (on: boolean) => {
    if (running.current === on) return;
    running.current = on;
    window.dispatchEvent(
      new KeyboardEvent(on ? "keydown" : "keyup", {
        code: "ShiftLeft",
        key: "Shift",
        bubbles: true,
      }),
    );
  };
  const still = () => {
    stick.current.forward = 0;
    stick.current.right = 0;
    run(false);
  };

  // The stick going away mid-walk stops the walk with it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => still, []);

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = base.current?.getBoundingClientRect();
    if (!box) return;
    const radius = box.width / 2;
    const x = (event.clientX - (box.left + radius)) / radius;
    const y = (event.clientY - (box.top + radius)) / radius;
    const reach = Math.hypot(x, y);
    const clamp = reach > 1 ? 1 / reach : 1;
    // The knob travels to the rim and a little way past it, never further.
    const travel = radius * 0.62;
    const runs = joystickRuns(x, y);
    setKnob({ x: x * clamp * travel, y: y * clamp * travel, on: true, run: runs });
    const push = joystickVector(x, y);
    stick.current.forward = push.forward;
    stick.current.right = push.right;
    run(runs);
  };
  const release = () => {
    pointer.current = null;
    setKnob({ x: 0, y: 0, on: false, run: false });
    still();
  };

  return (
    <div
      ref={base}
      role="application"
      aria-label={label}
      title={label}
      data-walk-joystick
      onPointerDown={(event) => {
        if (pointer.current !== null) return;
        event.preventDefault();
        event.stopPropagation();
        pointer.current = event.pointerId;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* a synthetic pointer: moves still arrive while it stays on the stick */
        }
        move(event);
      }}
      onPointerMove={(event) => {
        if (event.pointerId === pointer.current) move(event);
      }}
      onPointerUp={(event) => {
        if (event.pointerId === pointer.current) release();
      }}
      onPointerCancel={release}
      onLostPointerCapture={(event) => {
        if (event.pointerId === pointer.current) release();
      }}
      // A long press would otherwise open the phone's menu over the model.
      onContextMenu={(event) => event.preventDefault()}
      className={`grid h-28 w-28 select-none place-items-center rounded-full border border-white/20 bg-neutral-950/40 shadow-xl backdrop-blur-md [touch-action:none] [-webkit-touch-callout:none] ${className}`}
    >
      {/* The four directions, faintly, and the dead zone's ring. */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full text-white/45"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <path
          d="M50 9 l-5 6 h10z M50 91 l-5 -6 h10z M9 50 l6 -5 v10z M91 50 l-6 -5 v10z"
          fill="currentColor"
        />
      </svg>
      <span
        className={`pointer-events-none block h-12 w-12 rounded-full border shadow-lg transition-[background-color,box-shadow] motion-reduce:transition-none ${
          knob.run
            ? "border-white bg-primary ring-4 ring-primary/40"
            : knob.on
              ? "border-white bg-white/90"
              : "border-white/70 bg-white/70"
        }`}
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
