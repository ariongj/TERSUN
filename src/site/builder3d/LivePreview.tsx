import { useEffect, useRef, useState } from 'react';
import { Lamp, Loader2, Moon, Move3d, Sun } from 'lucide-react';
import { defineDict, useDict } from '@/i18n';
import { cn } from '@/lib/utils';
import { createViewer, webglAvailable, type Viewer, type ViewerMode } from './viewer';

const D = defineDict({
  de: { studio: 'Studio', day: 'Tag', night: 'Nacht', drag: 'Ziehen zum Drehen', loading: '3D wird geladen' },
  sq: { studio: 'Studio', day: 'Ditë', night: 'Natë', drag: 'Tërhiqni për ta rrotulluar', loading: '3D po ngarkohet' },
  en: { studio: 'Studio', day: 'Day', night: 'Night', drag: 'Drag to rotate', loading: 'Loading 3D' },
});

/** A still of the scene the preview starts with: shown at once, the live 3D fades in over it when it is ready. */
export const LIVE_POSTER = '/images/misc/builder-live.webp';

/**
 * The real 3D builder scene, embedded on the homepage: a bioclimatic pergola with LED and the lounge,
 * slowly turning; visitors can drag it and switch the scene. Falls back to a still when WebGL is missing.
 */
export default function LivePreview({ fallback }: { fallback: string }) {
  const t = useDict(D);
  const ref = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [mode, setMode] = useState<ViewerMode>('night');
  const [gl] = useState(() => webglAvailable());
  const [touched, setTouched] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gl || !ref.current) return;
    const el = ref.current;
    let v: Viewer | null = null;
    // set the scene up in a quiet moment, so it never interrupts a scroll
    const start = () => {
      v = createViewer(el, { keepView: true, zoom: 1.5, onInteract: () => setTouched(true), onReady: () => setReady(true) });
      viewer.current = v;
      v.setDims(false);
      v.update('bioclimatic', { w: 450, d: 350, h: 260, color: '#383e42', layout: 'standard', mount: 'free', side: 'none', led: true, angle: 35 });
      v.setMode('night');
      v.setAutoRotate(true);
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 500 }) : window.setTimeout(start, 60);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      v?.dispose();
      viewer.current = null;
      setReady(false);
    };
  }, [gl]);

  const pick = (m: ViewerMode) => {
    setMode(m);
    viewer.current?.setMode(m);
  };

  if (!gl) return <img src={fallback} alt="" className="absolute inset-0 h-full w-full object-cover" />;

  return (
    <>
      <img src={LIVE_POSTER} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', ready && 'opacity-0')} />
      <div ref={ref} className={cn('absolute inset-0 cursor-grab transition-opacity duration-700 active:cursor-grabbing', ready ? 'opacity-100' : 'opacity-0')} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_60%,rgb(0_0_0/0.35)_100%)]" />
      <div className={cn('absolute left-4 top-4 flex rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md transition-opacity duration-500 sm:left-5 sm:top-5', !ready && 'pointer-events-none opacity-0')}>
        {(
          [
            ['studio', <Lamp key="s" className="h-3.5 w-3.5" />],
            ['day', <Sun key="d" className="h-3.5 w-3.5" />],
            ['night', <Moon key="n" className="h-3.5 w-3.5" />],
          ] as const
        ).map(([m, icon]) => (
          <button
            key={m}
            onClick={() => pick(m)}
            aria-pressed={mode === m}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition',
              mode === m ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
            )}
          >
            {icon}
            {t(m)}
          </button>
        ))}
      </div>
      <div
        className={cn(
          'pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-white/80 ring-1 ring-white/10 backdrop-blur-md transition-opacity duration-500 sm:bottom-5 sm:right-5',
          touched && 'opacity-0',
        )}
      >
        {ready ? (
          <>
            <Move3d className="h-3.5 w-3.5" /> {t('drag')}
          </>
        ) : (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('loading')}
          </>
        )}
      </div>
    </>
  );
}
