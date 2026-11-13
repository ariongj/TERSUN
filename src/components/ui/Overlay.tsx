import { useEffect, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { common } from '@/i18n/common';
import { useUi } from '@/store/ui';

/** Close-button label in the language of the current area (CMS under html[data-admin], storefront otherwise). */
function useCloseLabel() {
  const site = useUi((s) => s.lang);
  const admin = useUi((s) => s.adminLang);
  return common[document.documentElement.hasAttribute('data-admin') ? admin : site].close;
}

/** Lock page scroll while an overlay is open (dialogs here, the header search overlay). */
export function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

/** Visible, focusable elements inside `root`, in tab order of the DOM. */
const focusables = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

/** Open dialogs, innermost last — only the top one handles Tab. */
const trapStack: RefObject<HTMLElement | null>[] = [];

/**
 * Dialog focus handling: move focus into the dialog when it opens, keep Tab / Shift+Tab inside it,
 * and give focus back to the element that opened it (the trigger) when it closes.
 */
export function useFocusTrap(open: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    trapStack.push(ref);
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) (focusables(el)[0] ?? el).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      const root = ref.current;
      if (e.key !== 'Tab' || !root || trapStack[trapStack.length - 1] !== ref) return;
      const list = focusables(root);
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (!first) {
        e.preventDefault();
        root.focus();
      } else if (!root.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = trapStack.lastIndexOf(ref);
      if (i >= 0) trapStack.splice(i, 1);
      if (trigger && trigger !== document.body && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, ref]);
}

function useEsc(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  children,
  className,
  title,
  footer,
  width = 'max-w-[440px]',
  label,
}: {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left';
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  footer?: ReactNode;
  width?: string;
  /** Accessible name when there is no `title` (or the title is not text) */
  label?: string;
}) {
  useLockBody(open);
  useEsc(open, onClose);
  const closeLabel = useCloseLabel();
  const panel = useRef<HTMLElement>(null);
  useFocusTrap(open, panel);
  const titleId = useId();
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            aria-labelledby={!label && title !== undefined ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              'absolute top-0 bottom-0 flex w-full flex-col bg-paper shadow-2xl outline-none',
              side === 'right' ? 'right-0' : 'left-0',
              width,
              className,
            )}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <div id={titleId} className="min-w-0 text-lg font-semibold">
                  {title}
                </div>
                <button onClick={onClose} className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label={closeLabel}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line bg-white/60 px-5 py-4 sm:px-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  footer,
  size = 'md',
  className,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  /** Accessible name when there is no `title` */
  label?: string;
}) {
  useLockBody(open);
  useEsc(open, onClose);
  const closeLabel = useCloseLabel();
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panel);
  const titleId = useId();
  // No title or label: name the dialog after the first heading inside it (e.g. a lightbox's project title).
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el || title || label) return;
    const h = el.querySelector<HTMLElement>('h1, h2, h3');
    if (!h) return el.removeAttribute('aria-labelledby');
    if (!h.id) h.id = `${titleId}h`;
    el.setAttribute('aria-labelledby', h.id);
  });
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl', full: 'max-w-[1200px]' }[size];
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={title && description ? `${titleId}d` : undefined}
            aria-label={!title ? label : undefined}
            tabIndex={-1}
            className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl', w, className)}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-bold text-ink">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={`${titleId}d`} className="mt-1 text-sm text-muted">
                      {description}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ink/5" aria-label={closeLabel}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
