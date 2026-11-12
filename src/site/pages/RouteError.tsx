import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router';
import { href } from '@/lib/paths';
import { isStaleChunk, reloadOnce } from '@/lib/recover';

const T = {
  de: { title: 'Da ist etwas schiefgelaufen.', text: 'Die Seite konnte nicht angezeigt werden. Laden Sie sie neu — Ihr Warenkorb bleibt erhalten.', reload: 'Seite neu laden', home: 'Zur Startseite' },
  sq: { title: 'Diçka nuk shkoi mirë.', text: 'Faqja nuk u shfaq dot. Ringarkojeni — shporta juaj mbetet e ruajtur.', reload: 'Ringarko faqen', home: 'Në ballinë' },
  en: { title: 'Something went wrong.', text: 'This page could not be shown. Reload it — your cart is kept.', reload: 'Reload the page', home: 'Back to home' },
} as const;

/** The visitor's language, read straight from storage: this screen must not depend on anything that may have failed. */
function lang(): keyof typeof T {
  try {
    const l = JSON.parse(localStorage.getItem('tersun-ui') || '{}')?.state?.lang;
    if (l === 'de' || l === 'sq' || l === 'en') return l;
  } catch {
    /* fall through */
  }
  return 'en'; // the site's default language, for a visitor who has not chosen one
}

/**
 * Shown instead of a blank page when a screen fails to render. A failure caused by a newly published version
 * (the tab still runs the old one) heals itself with one reload.
 */
export default function RouteError() {
  const error = useRouteError();
  const [reloading] = useState(() => isStaleChunk(error) && reloadOnce());
  useEffect(() => {
    console.error(error);
  }, [error]);
  if (reloading) return null;
  const t = T[lang()];
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
      <div className="max-w-md">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.26em] text-brand-300">TERSUN</div>
        <h1 className="display mt-5 text-4xl sm:text-5xl">{t.title}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-white/70">{t.text}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button onClick={() => window.location.reload()} className="inline-flex h-12 items-center rounded-full bg-brand-600 px-7 text-sm font-bold text-white transition hover:bg-brand-500">
            {t.reload}
          </button>
          <a href={href('/')} className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-sm font-bold text-white transition hover:bg-white hover:text-ink">
            {t.home}
          </a>
        </div>
      </div>
    </div>
  );
}
