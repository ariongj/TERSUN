// Recovery from a stale tab. Publishing a new version removes the previous version's code chunks, so a tab
// that was opened before the publish fails the moment it needs a chunk it has not loaded yet (the 3D builder,
// the CMS). The cure is a reload, which fetches the new version — once, never in a loop.

const KEY = 'tersun-reloaded';

/** True when the error is a code chunk (or its CSS) that could not be loaded. */
export function isStaleChunk(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String((err as { message?: unknown } | null)?.message ?? err ?? '');
  return /dynamically imported module|importing a module script failed|unable to preload css|chunkloaderror|loading chunk/i.test(message);
}

/** Reload the page unless that was already tried a moment ago. Returns true when a reload was started. */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false; // no session storage: without the guard a reload could loop
  }
  window.location.reload();
  return true;
}
