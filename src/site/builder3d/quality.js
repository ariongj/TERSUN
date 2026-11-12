/**
 * Resolution governor for the 3D viewer.
 *
 * The picture is always drawn at full resolution when it is at rest. Only while it moves (camera, animation)
 * may the resolution drop, and only when that demonstrably makes the frames faster: a low frame rate that does
 * not improve at a lower resolution (a 30 Hz display, a power-saving browser, a busy page) is not the GPU's
 * fault and must not cost quality. Every step down is therefore a probe that is kept or undone, and a lowered
 * resolution is raised again as soon as the device keeps up.
 *
 * `full` is the device pixel ratio the viewer draws at its best (already capped by the caller).
 */
export function createGovernor(full) {
  const SLOW = 24; // ms per frame: below ~42 fps motion stops feeling smooth
  const FAST = 19; // ms per frame: comfortably fast, room to try a higher resolution
  const WINDOW = 24; // frames per measurement
  const round = (r) => Math.round(r * 100) / 100;
  const floor = Math.min(full, Math.max(0.75, round(full * 0.6)));
  const step = (r, f) => {
    const next = round(Math.min(full, Math.max(floor, r * f)));
    if (next < floor * 1.08) return floor;
    return next > full * 0.93 ? full : next;
  };

  let sustained = full; // the resolution the device keeps up with in motion
  let win = [];
  let settle = 12; // frames to ignore: start-up, a rebuild, a change of resolution
  let probe = null; // { from, before, stage }: a step down under test
  let trial = null; // { from, before }: a step up under test
  let lockedUntil = 0, lockFor = 20000; // after a useless probe: resolution is not what limits the frame rate
  let retryAt = 0, retryIn = 8000; // back-off between attempts to raise the resolution

  return {
    full,
    floor,
    get sustained() { return sustained; },
    /** Ignore the next frames: a rebuild, a resize or a pause makes them unrepresentative. */
    skip(n) { settle = Math.max(settle, n || 2); win = []; },
    /**
     * Feed the time between two consecutive frames drawn in motion at the sustained resolution.
     * Returns true when the sustained resolution changed.
     */
    sample(ms, now) {
      if (settle > 0) { settle--; return false; }
      if (ms > 250) return false; // the tab was in the background, or a hiccup: not a measurement
      win.push(ms);
      if (win.length < WINDOW) return false;
      // A low percentile, not the mean: a GPU that cannot keep up is slow on every frame, while a busy page
      // (scrolling, a rebuild, image decoding) only makes some of them slow and must not count.
      win.sort((a, b) => a - b);
      const pace = win[Math.floor(WINDOW * 0.4)];
      win = [];

      const was = sustained;
      if (probe) {
        if (pace <= probe.before * 0.88) {
          probe = null; // it helped: keep it
        } else if (probe.stage === 1 && sustained > floor) {
          // frame times come in steps of the display refresh: one step down may not show yet, try one more
          probe.stage = 2;
          sustained = step(sustained, 0.8);
        } else {
          sustained = probe.from; // it did not help: give the quality back and stop probing for a while
          probe = null;
          lockedUntil = now + lockFor;
          lockFor = lockFor >= 160000 ? Infinity : lockFor * 2;
        }
      } else if (trial) {
        if (pace > SLOW && pace > trial.before * 1.12) {
          sustained = trial.from; // too much: step back and wait longer before the next attempt
          retryAt = now + retryIn;
          retryIn = Math.min(retryIn * 2, 60000);
        } else {
          retryIn = 8000;
          retryAt = now + 2000;
        }
        trial = null;
      } else if (sustained < full && now >= retryAt && (pace < FAST || now < lockedUntil)) {
        trial = { from: sustained, before: pace };
        sustained = step(sustained, 1.25);
      } else if (pace > SLOW && sustained > floor && now >= lockedUntil) {
        probe = { from: sustained, before: pace, stage: 1 };
        sustained = step(sustained, 0.8);
      }
      if (sustained !== was) settle = 6;
      return sustained !== was;
    },
  };
}
