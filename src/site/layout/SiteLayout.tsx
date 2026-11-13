import { useCallback, useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { useDict, LANGS, useL, useLang } from '@/i18n';
import { Logo } from '@/components/brand/Logo';
import { readTheme } from '@/admin/components/store/theme';
import { site } from '@/i18n/site';
import { useCartCleanup, useSettings } from '@/store/hooks';
import { ck } from '@/site/components/checkout/dict';
import { useDb } from '@/store/db';
import { useUi } from '@/store/ui';
import type { L10n, Lang } from '@/lib/types';

function DemoBadge() {
  const t = useDict(site);
  const settings = useSettings();
  const { pathname } = useLocation();
  // the 3D builder fills the screen with its own controls — keep the badge out of the way there
  if (!settings.demoBanner || pathname === '/3d') return null;
  return (
    <Link
      to="/admin"
      className="group fixed bottom-4 left-4 z-30 flex items-center gap-2.5 rounded-full bg-ink/90 py-1.5 pl-1.5 pr-4 text-[12px] font-semibold text-paper shadow-xl ring-1 ring-white/10 backdrop-blur transition-all hover:bg-ink"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600">
        <LayoutDashboard className="h-3.5 w-3.5" />
      </span>
      <span className="hidden sm:inline">{t('demoBanner')}</span>
      <span className="text-brand-200 group-hover:text-white">{t('demoBannerCta')} →</span>
    </Link>
  );
}

export function SiteLayout() {
  const location = useLocation();
  const lang = useLang();
  const isHome = location.pathname === '/';
  const heroFirst = useDb((s) => s.home.find((h) => h.enabled)?.type === 'hero');
  const settings = useSettings();
  const tk = useDict(ck);
  useCartCleanup(useCallback((name: string) => tk('removedUnavailable', { name }), [tk]));

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.htmlLang ?? 'de-DE';
  }, [lang]);

  // Languages follow the CMS (Settings → Languages): a visitor never stays on a language that was switched off,
  // and a visitor who has not picked one gets the configured default.
  const enabledLangs = settings.languages;
  const langDefault = (settings as typeof settings & { ext?: { langDefault?: Lang } }).ext?.langDefault;
  const langChosen = useUi((s) => s.langChosen);
  useEffect(() => {
    const order = [langDefault, 'sq', 'en', 'de'].filter((x): x is Lang => !!x && !!enabledLangs[x as Lang]);
    const target = !enabledLangs[lang] ? order[0] : !langChosen && langDefault && enabledLangs[langDefault] && lang !== langDefault ? langDefault : null;
    if (target && target !== lang) useUi.setState({ lang: target });
  }, [lang, langChosen, langDefault, enabledLangs]);

  // Theme from the CMS (Online Store → Theme): heading font and spacing density, as attributes on <html>
  // (see index.css); removed again when leaving the storefront for the CMS.
  const theme = useMemo(() => readTheme(settings), [settings]);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.font = theme.font;
    el.dataset.density = theme.density;
    return () => {
      delete el.dataset.font;
      delete el.dataset.density;
    };
  }, [theme.font, theme.density]);
  const adminAuthed = useUi((s) => s.adminAuthed);

  // Smooth-scroll to in-page anchors like /#consultation after navigation
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  // Maintenance mode: visitors see a notice; the team (signed in to the CMS) keeps seeing the site
  if (theme.maintenance.on && !adminAuthed) return <Maintenance message={theme.maintenance.message} />;

  return (
    <div className="flex min-h-screen flex-col">
      {theme.maintenance.on && <div className="bg-amber-500 px-4 py-1.5 text-center text-[12.5px] font-semibold text-ink">{tk('maintenanceOn')}</div>}
      <Header transparentTop={isHome && heroFirst && !theme.maintenance.on} />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* on phones the 3D builder is a one-screen app: no footer, so the page cannot scroll away from it */}
      <div className={location.pathname === '/3d' ? 'max-lg:hidden' : undefined}>
        <Footer />
      </div>
      <CartDrawer />
      <SearchOverlay />
      <DemoBadge />
    </div>
  );
}

function Maintenance({ message }: { message: L10n }) {
  const l = useL();
  const settings = useSettings();
  usePageTitle(undefined);
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
      <div className="max-w-lg">
        <Logo tone="light" className="mx-auto h-6" />
        <p className="display mt-10 text-[28px] leading-snug sm:text-[34px]">{l(message)}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-white/70">
          {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">{settings.phone}</a>}
          {settings.email && <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>}
        </div>
      </div>
    </div>
  );
}

/** Page title helper for storefront pages. */
export function usePageTitle(title: string | undefined) {
  const settings = useSettings();
  useEffect(() => {
    document.title = title ? `${title} — ${settings.companyName}` : settings.seo.title;
  }, [title, settings.companyName, settings.seo.title]);
}
