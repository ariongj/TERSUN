// The opening photo of the homepage goes first: heavier downloads (the other hero slides, the 3D code) wait
// until it is on screen, so that on a slow connection they do not compete with what the visitor sees first.

const EVENT = 'tersun:hero-ready';
let done = false;

/** Called by the hero once its first photo has loaded (or failed, or taken too long). */
export function markHeroReady() {
  if (done) return;
  done = true;
  window.dispatchEvent(new Event(EVENT));
}

/** Runs `fn` once the hero's first photo is on screen, or after `fallbackMs` if there is none. Returns a cancel function. */
export function afterHero(fn: () => void, fallbackMs = 6000): () => void {
  if (done) {
    fn();
    return () => undefined;
  }
  let fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    window.removeEventListener(EVENT, run);
    window.clearTimeout(timer);
    fn();
  };
  const timer = window.setTimeout(run, fallbackMs);
  window.addEventListener(EVENT, run);
  return () => {
    fired = true;
    window.removeEventListener(EVENT, run);
    window.clearTimeout(timer);
  };
}
