import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import type { HeroSlide } from '@/lib/types';
import { ButtonLink } from '@/components/ui/Button';
import { useDict, useL } from '@/i18n';
import { site } from '@/i18n/site';
import { common } from '@/i18n/common';
import { cn } from '@/lib/utils';

const DURATION = 7000;

/**
 * Portrait (≈2:3) clip. On landscape screens it plays sharp in a tall frame on the right over a blurred,
 * dimmed full-bleed copy (stretching it would upscale it ~3×); on portrait screens it fills the hero natively.
 */
function HeroVideo({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // only play while the slide is showing
    ref.current?.querySelectorAll('video').forEach((v) => (active ? void v.play().catch(() => undefined) : v.pause()));
  }, [active]);
  const common = { src, poster: src.replace(/\.mp4$/i, '-poster.jpg'), muted: true, loop: true, playsInline: true, preload: 'metadata' } as const;
  return (
    <div ref={ref} className="absolute inset-0">
      <video {...common} className="h-full w-full scale-110 object-cover landscape:blur-2xl landscape:brightness-[0.5]" />
      <div className="absolute bottom-[21%] right-[5%] top-[12%] hidden landscape:flex xl:right-[9%]">
        <video
          {...common}
          className={cn(
            'aspect-[1080/1640] h-full rounded-[28px] object-cover shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15 transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)]',
            active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
          )}
        />
      </div>
    </div>
  );
}

/** Headline that rises word by word out of a mask; words in *asterisks* get the gold italic accent. */
function RevealTitle({ text, delay }: { text: string; delay: number }) {
  // words keep any glued-on punctuation ("*Breathe*." → one word, accent + plain part)
  const words: { text: string; accent: boolean }[][] = [];
  let glue = false;
  for (const part of text.split(/(\*[^*]+\*)/g).filter(Boolean)) {
    const accent = part.startsWith('*') && part.endsWith('*');
    const body = accent ? part.slice(1, -1) : part;
    body.split(/(\s+)/).forEach((tok) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) return void (glue = false);
      if (glue && words.length) words[words.length - 1].push({ text: tok, accent });
      else words.push([{ text: tok, accent }]);
      glue = true;
    });
  }
  return (
    <>
      {words.map((segs, n) => (
        <span key={n} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              show: { y: '0%', rotate: 0, transition: { duration: 1.1, delay: delay + n * 0.09, ease: [0.16, 1, 0.3, 1] } },
              exit: { y: '-40%', opacity: 0, transition: { duration: 0.3 } },
            }}
          >
            {segs.map((sg, j) => (
              <span key={j} className={cn(sg.accent && 'font-display italic text-brand-300')}>
                {sg.text}
              </span>
            ))}
          </motion.span>
          {n < words.length - 1 && '\u00a0'}
        </span>
      ))}
    </>
  );
}

export function HeroSection({ slides, autoplay }: { slides: HeroSlide[]; autoplay: boolean }) {
  const l = useL();
  const t = useDict(site);
  const tc = useDict(common);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [intro, setIntro] = useState(true);
  // the opening plays once the first photo has decoded (or after 2.5 s, whatever comes first)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (i !== 0) setIntro(false);
  }, [i]);
  const base = intro && i === 0 ? 1.2 : 0.15; // extra delay while the opening image settles
  const count = slides.length;
  const go = useCallback((n: number) => setI(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (i >= count) setI(0);
  }, [count, i]);

  if (!count) return null;
  const s = slides[Math.min(i, count - 1)];

  return (
    <section className="relative isolate h-[calc(100svh-36px)] min-h-[640px] max-h-[1100px] overflow-hidden bg-ink" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Images — the first slide opens with a slow pull-back out of darkness */}
      {slides.map((sl, k) => (
        <div key={sl.id} className={cn('absolute inset-0 -z-20 overflow-hidden transition-opacity duration-[1400ms] ease-out', k === i ? 'opacity-100' : 'opacity-0')} aria-hidden={k !== i}>
          {/\.mp4$/i.test(sl.image) ? (
            <HeroVideo src={sl.image} active={k === i} />
          ) : (
            <img
              src={sl.image}
              alt=""
              loading={k === 0 ? 'eager' : 'lazy'}
              fetchPriority={k === 0 ? 'high' : undefined}
              onLoad={k === 0 ? () => setReady(true) : undefined}
              className={cn(
                'h-full w-full object-cover will-change-transform',
                k === 0 && intro && !ready && 'scale-[1.32] brightness-[0.15]',
                k === i && ready && (k === 0 && intro ? 'animate-[heroIntro_3.2s_cubic-bezier(.16,1,.3,1)_both]' : 'animate-[kenburns_9s_ease-out_both]'),
                sl.video && 'portrait:hidden',
              )}
            />
          )}
          {sl.video && (
            <video src={sl.video} poster={sl.video.replace(/\.mp4$/i, '-poster.jpg')} autoPlay muted loop playsInline preload="metadata" className="hidden h-full w-full object-cover portrait:block" />
          )}
        </div>
      ))}
      {/* cinematic light sweep on the intro */}
      {intro && ready && i === 0 && <div className="pointer-events-none absolute inset-0 -z-10 animate-[heroSweep_2.6s_1.1s_ease-out_both] bg-[linear-gradient(100deg,transparent_35%,rgb(228_211_180/0.16)_50%,transparent_65%)] bg-[length:250%_100%]" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

      <div className="container-x flex h-full flex-col justify-end pb-28 pt-32 sm:pb-36">
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial="hidden" animate={ready ? 'show' : 'hidden'} exit="exit" className="max-w-3xl">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: base } }, exit: { opacity: 0, y: -8, transition: { duration: 0.25 } } }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {l(s.eyebrow)}
            </motion.div>
            <h1 className="display text-shadow-soft text-[48px] leading-[0.98] text-white sm:text-7xl lg:text-[104px]">
              <RevealTitle text={l(s.title)} delay={base + 0.15} />
            </h1>
            <motion.div
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, delay: base + 0.7, ease: [0.16, 1, 0.3, 1] } }, exit: { opacity: 0 } }}
              className="mt-7 h-px w-28 origin-left bg-gradient-to-r from-brand-300 to-transparent"
            />
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: base + 0.8 } }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
              className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85 sm:text-lg"
            >
              {l(s.subtitle)}
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, delay: base + 1.0 } }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <ButtonLink to={s.primary.href} size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                {l(s.primary.label)}
              </ButtonLink>
              <ButtonLink to={s.secondary.href} size="lg" variant="outlineLight" icon={s.secondary.href.includes('consultation') ? <Ruler className="h-4 w-4" /> : undefined}>
                {l(s.secondary.label)}
              </ButtonLink>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute bottom-[86px] right-0 w-full sm:bottom-32">
          <div className="container-x flex items-center justify-start gap-5 sm:justify-end">
            <span className="font-display text-sm tabular-nums text-white/80">
              <span className="text-white">{String(i + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              {slides.map((sl, k) => (
                <button key={sl.id} onClick={() => go(k)} className="group relative h-[3px] w-14 overflow-hidden rounded-full bg-white/25" aria-label={tc('slideN', { n: k + 1 })}>
                  <span
                    className={cn('absolute inset-y-0 left-0 rounded-full bg-white', k < i || (k === i && !autoplay) ? 'w-full' : 'w-0')}
                    style={k === i && autoplay ? { animation: `heroprogress ${k === 0 && intro ? DURATION + 3000 : DURATION}ms linear forwards`, animationPlayState: paused || !ready ? 'paused' : 'running' } : undefined}
                    onAnimationEnd={k === i && autoplay ? () => go(i + 1) : undefined}
                  />
                </button>
              ))}
            </div>
            <div className="hidden gap-2 md:flex">
              <button onClick={() => go(i - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition hover:bg-white hover:text-ink" aria-label={tc('prev')}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(i + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition hover:bg-white hover:text-ink" aria-label={tc('next')}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Link to="/shop" className="sr-only">
        {t('allProducts')}
      </Link>
    </section>
  );
}
