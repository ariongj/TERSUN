import { useEffect, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import type { HomeSection } from '@/lib/types';
import { useDb } from '@/store/db';
import { usePlacements, useSettings } from '@/store/hooks';
import { readTheme } from '@/admin/components/store/theme';
import type { HeroSlide, Placement } from '@/lib/types';
import { usePageTitle } from '@/site/layout/SiteLayout';
import { HeroSection } from '@/site/sections/Hero';
import {
  BlogSection, CategoriesSection, CtaSection, FaqSection, FeaturedSection, InstagramSection, ProcessSection,
  ProjectsSection, PromoSection, ServicesSection, StatsSection, TrustSection,
} from '@/site/sections/HomeSections';

const isClip = (src?: string) => !!src && /\.(mp4|webm|mov)$/i.test(src);

/** A live slide of "Slideshow & banners" as a hero slide. */
const toSlide = (p: Placement & { focal?: { x: number; y: number } }): HeroSlide => ({
  id: p.id,
  image: p.image,
  ...(isClip(p.imageMobile) ? { video: p.imageMobile } : p.imageMobile ? { imageMobile: p.imageMobile } : {}),
  ...(p.focal ? { focal: p.focal } : {}),
  eyebrow: p.eyebrow,
  title: p.title,
  subtitle: p.subtitle,
  primary: p.cta,
  secondary: p.secondary ?? { label: { de: '', sq: '', en: '' }, href: '' },
});

/**
 * The hero shows the live slides of "Slideshow & banners" (status, schedule and linked offers decide which); the
 * homepage editor's slides are the same list (see db.ts). The CMS preview of an unpublished homepage shows the
 * draft's slides, and so does a site with no live slide at all.
 */
function Hero({ section, preview }: { section: Extract<HomeSection, { type: 'hero' }>; preview: boolean }) {
  const live = usePlacements('home-hero');
  const slides = useMemo(() => (preview || !live.length ? section.data.slides : live.map(toSlide)), [preview, live, section.data.slides]);
  // Slideshow settings (Slideshow & banners): autoplay and arrows always; the interval only once the team has
  // chosen one — until then the hero keeps its own brisk pace.
  const settings = useSettings();
  const ss = readTheme(settings).slideshow;
  const chosen = (settings as typeof settings & { theme?: { slideshow?: { interval?: number } } }).theme?.slideshow?.interval;
  return <HeroSection slides={slides} autoplay={section.data.autoplay && ss.autoplay} controls={ss.controls} interval={chosen ? chosen * 1000 : undefined} />;
}

function renderSection(s: HomeSection, prev: HomeSection | undefined, preview: boolean): ReactNode {
  switch (s.type) {
    case 'hero':
      return <Hero section={s} preview={preview} />;
    case 'trust':
      return <TrustSection data={s.data} overlap={prev?.type === 'hero'} />;
    case 'categories':
      return <CategoriesSection data={s.data} />;
    case 'featured':
      return <FeaturedSection data={s.data} />;
    case 'promo':
      return <PromoSection data={s.data} />;
    case 'process':
      return <ProcessSection data={s.data} />;
    case 'services':
      return <ServicesSection data={s.data} />;
    case 'projects':
      return <ProjectsSection data={s.data} />;
    case 'stats':
      return <StatsSection data={s.data} />;
    case 'blog':
      return <BlogSection data={s.data} />;
    case 'faq':
      return <FaqSection data={s.data} />;
    case 'instagram':
      return <InstagramSection data={s.data} />;
    case 'cta':
      return <CtaSection data={s.data} />;
    default:
      return null;
  }
}

export default function Home() {
  const live = useDb((s) => s.home);
  const draft = useDb((s) => s.homeDraft);
  // CMS preview (builder iframe / "Preview draft"): /?preview=1 shows the unpublished draft when there is one.
  const [params] = useSearchParams();
  const preview = params.get('preview') === '1';
  const home = preview ? (draft ?? live) : live;
  usePageTitle(undefined);
  const enabled = useMemo(() => home.filter((s) => s.enabled), [home]);

  // CMS live preview: the homepage builder posts { type: 'tersun:scrollTo', id } into this iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'tersun:scrollTo') return;
      const el = document.querySelector<HTMLElement>(`[data-section="${e.data.id}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('preview-highlight');
      window.setTimeout(() => el.classList.remove('preview-highlight'), 1600);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <>
      {enabled.map((s, i) => (
        <div key={s.id} data-section={s.id} className="scroll-mt-24">
          {renderSection(s, enabled[i - 1], preview && !!draft)}
        </div>
      ))}
    </>
  );
}
