import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker } from 'react-router';
import { confirmDialog } from '@/admin/components/kit';
import { useDict } from '@/i18n';
import { ed } from './i18n';

/** Same content (JSON); `undefined` ≡ `null`. */
export const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const isPlain = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

/**
 * Three-way merge for editors: keep what this editor changed (`mine` compared with `from`, the stored version it was
 * copied from) and take everything else from `latest` (the record as stored now, e.g. saved from another tab).
 * Plain objects merge key by key (editing the SQ title keeps a DE title changed elsewhere); arrays and values are
 * replaced whole. Keys keep `latest`'s order, so an untouched copy compares equal to the stored record again.
 */
export function rebase<T>(from: T, mine: T, latest: T): T {
  if (same(mine, from) || same(mine, latest)) return latest;
  if (same(latest, from)) return mine;
  if (isPlain(from) && isPlain(mine) && isPlain(latest)) {
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(latest), ...Object.keys(mine)])) {
      const v = rebase(from[k], mine[k], latest[k]);
      if (v !== undefined) out[k] = v;
    }
    return out as T;
  }
  return mine;
}

/**
 * Follow the stored record while an editor holds a local copy of it. When the stored record changes elsewhere
 * (another tab, an import), the copy is rebased onto it: what was edited here stays, everything else follows the
 * store. So an untouched editor shows the new data (no phantom "unsaved changes"), and saving does not undo a
 * change made elsewhere. `origin` is the stored version the copy started from. Call it during render.
 */
export function useFollowStored<T>(stored: T | undefined, origin: T, setOrigin: (v: T) => void, draft: T, setDraft: (v: T) => void) {
  const [seen, setSeen] = useState(stored);
  if (seen !== stored) {
    setSeen(stored);
    if (stored !== undefined && !same(seen, stored) && !same(origin, stored)) {
      setOrigin(stored);
      setDraft(rebase(origin, draft, stored));
    }
  }
}

/**
 * Local editing copy of a stored record.
 * `source` is the record from the store (undefined while creating a new one). While the copy is open, changes saved
 * elsewhere are followed (see `useFollowStored`).
 */
export function useDraft<T>(source: T | undefined, blank: () => T) {
  const [initial] = useState<T>(() => source ?? blank());
  const [base, setBase] = useState<T>(source ?? initial);
  const [draft, setDraft] = useState<T>(base);
  useFollowStored(source, base, setBase, draft, setDraft);
  const dirty = useMemo(() => !same(draft, base), [draft, base]);
  const patch = useCallback((p: Partial<T>) => setDraft((d) => ({ ...d, ...p })), []);
  const reset = useCallback(() => setDraft(base), [base]);
  return { draft, setDraft, patch, dirty, reset };
}

type Loc = { pathname: string; search: string };

/** Ctrl/Cmd + S anywhere on the page. */
export function useSaveShortcut(fn: () => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
}

/**
 * Ask before leaving an editor with unsaved changes (in-app navigation + tab close).
 * Call `allowNext()` right before a programmatic navigation that should not be blocked.
 * Options: `within` — a path prefix the editor's state survives in (the settings sub-pages share one draft), so moving
 * between those paths is not blocked; `param` — for editors opened on a list page by a search parameter
 * (`/admin/segmenti?id=…`): leaving means that parameter changes, not only the path.
 */
export function useUnsavedGuard(dirty: boolean, opts?: { within?: string; param?: string }) {
  const t = useDict(ed, 'admin');
  const dirtyRef = useRef(dirty);
  const bypass = useRef(false);
  const optsRef = useRef(opts);
  useEffect(() => {
    dirtyRef.current = dirty;
    optsRef.current = opts;
  });

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: Loc; nextLocation: Loc }) => {
      if (bypass.current || !dirtyRef.current) return false;
      const { within, param } = optsRef.current ?? {};
      if (currentLocation.pathname === nextLocation.pathname) {
        return !!param && new URLSearchParams(currentLocation.search).get(param) !== new URLSearchParams(nextLocation.search).get(param);
      }
      const w = within?.replace(/\/+$/, '');
      if (w && (nextLocation.pathname === w || nextLocation.pathname.startsWith(`${w}/`))) return false;
      return true;
    },
    [],
  );
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    let alive = true;
    confirmDialog({ title: t('leaveTitle'), text: t('leaveText'), confirmLabel: t('leave'), danger: true }).then((ok) => {
      if (!alive) return;
      if (ok) blocker.proceed();
      else blocker.reset();
    });
    return () => {
      alive = false;
    };
  }, [blocker, t]);

  useEffect(() => {
    if (!dirty) return;
    const fn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [dirty]);

  return useCallback(() => {
    bypass.current = true;
  }, []);
}

/** "Ctrl S" / "⌘ S" label for the save shortcut hint. */
export function useSaveKeyLabel() {
  return useMemo(() => (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ S' : 'Ctrl S'), []);
}

/** Rough word count of a markdown string. */
export function countWords(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export const readMinutesFor = (md: string) => Math.max(1, Math.round(countWords(md) / 200));
