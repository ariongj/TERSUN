import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Camera, Check, Moon, Move3d, Ruler, Sun, SunMedium, Lamp, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Overlay';
import { MeasureForm } from '@/site/components/MeasureForm';
import { defineDict, useDict, useL, useLang } from '@/i18n';
import { useActiveProducts } from '@/store/hooks';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { createViewer, webglAvailable, type Viewer, type ViewerMode, type ViewerOptions, type ViewerView } from './viewer';
import { FABRIC_COLORS, FRAME_COLORS, SYSTEMS, systemById, type SystemDef } from './systems';

const D = defineDict({
  de: {
    eyebrow: '3D-Builder',
    title: 'Gestalten Sie Ihr System',
    system: 'System',
    size: 'Maße',
    width: 'Breite',
    depth: 'Tiefe',
    height: 'Höhe',
    frame: 'Rahmenfarbe',
    fabric: 'Tuchfarbe',
    studio: 'Studio',
    day: 'Tag',
    night: 'Nacht',
    corner: 'Ecke',
    front: 'Front',
    side: 'Seite',
    top: 'Oben',
    inside: 'Innen',
    dims: 'Maße anzeigen',
    rotate: 'Drehen',
    snapshot: 'Bild speichern',
    estimate: 'Richtpreis ab',
    estimateHint: 'inkl. Montage · finales Angebot nach Vor-Ort-Termin',
    quote: 'Angebot anfragen',
    quoteTitle: 'Ihre Konfiguration',
    on: 'Ja',
    off: 'Nein',
    noGl: 'Ihr Browser unterstützt kein WebGL – bitte öffnen Sie den Builder in einem aktuellen Browser.',
    reset: 'Zurücksetzen',
  },
  sq: {
    eyebrow: '3D Builder',
    title: 'Krijoni sistemin tuaj',
    system: 'Sistemi',
    size: 'Masat',
    width: 'Gjerësia',
    depth: 'Thellësia',
    height: 'Lartësia',
    frame: 'Ngjyra e profilit',
    fabric: 'Ngjyra e pëlhurës',
    studio: 'Studio',
    day: 'Ditë',
    night: 'Natë',
    corner: 'Qoshe',
    front: 'Para',
    side: 'Anash',
    top: 'Sipër',
    inside: 'Brenda',
    dims: 'Shfaq masat',
    rotate: 'Rrotullo',
    snapshot: 'Ruaj foton',
    estimate: 'Çmim orientues nga',
    estimateHint: 'me montim · oferta finale pas takimit në vend',
    quote: 'Kërkoni ofertë',
    quoteTitle: 'Konfigurimi juaj',
    on: 'Po',
    off: 'Jo',
    noGl: 'Shfletuesi juaj nuk mbështet WebGL – hapeni builder-in në një shfletues të ri.',
    reset: 'Rivendos',
  },
  en: {
    eyebrow: '3D Builder',
    title: 'Design your system',
    system: 'System',
    size: 'Size',
    width: 'Width',
    depth: 'Depth',
    height: 'Height',
    frame: 'Frame colour',
    fabric: 'Fabric colour',
    studio: 'Studio',
    day: 'Day',
    night: 'Night',
    corner: 'Corner',
    front: 'Front',
    side: 'Side',
    top: 'Top',
    inside: 'Inside',
    dims: 'Show dimensions',
    rotate: 'Rotate',
    snapshot: 'Save image',
    estimate: 'Guide price from',
    estimateHint: 'incl. installation · final quote after survey',
    quote: 'Request a quote',
    quoteTitle: 'Your configuration',
    on: 'Yes',
    off: 'No',
    noGl: 'Your browser does not support WebGL – please open the builder in a current browser.',
    reset: 'Reset',
  },
});

type State = {
  w: number;
  d: number;
  h: number;
  color: string;
  fabric: string;
  preview: number;
  values: Record<string, string | boolean>;
};

function initialState(s: SystemDef): State {
  const values: Record<string, string | boolean> = {};
  for (const f of s.fields) values[f.key] = f.kind === 'toggle' ? true : f.choices[0].id;
  if (s.id === 'slide') values.tracks = '4';
  return {
    w: s.dims.w[2],
    d: s.dims.d?.[2] ?? 0,
    h: s.dims.h[2],
    color: FRAME_COLORS[0].id,
    fabric: FABRIC_COLORS[0].id,
    preview: s.preview.value,
    values,
  };
}

const hexOf = (list: { id: string; hex?: string }[], id: string) => list.find((c) => c.id === id)?.hex;

function viewerParams(s: SystemDef, st: State): { type: SystemDef['id']; o: ViewerOptions } {
  const o: ViewerOptions = {
    w: st.w,
    h: st.h,
    ...(s.dims.d ? { d: st.d } : {}),
    color: hexOf(FRAME_COLORS, st.color),
    dims: { w: `${st.w} cm`, h: `${st.h} cm`, d: s.dims.d ? `${st.d} cm` : null },
  };
  const v = st.values;
  let type = s.id;
  switch (s.id) {
    case 'bioclimatic':
      Object.assign(o, { layout: v.layout, mount: v.mount, side: v.side, led: !!v.led, angle: st.preview });
      break;
    case 'glassroof':
      Object.assign(o, { layout: v.layout, led: !!v.led });
      if (st.preview > 0) {
        type = 'awning';
        o.extension = st.preview / 100;
        o.fabric = hexOf(FABRIC_COLORS, st.fabric);
      }
      break;
    case 'awning':
      Object.assign(o, { led: !!v.led, fabric: hexOf(FABRIC_COLORS, st.fabric), extension: st.preview / 100 });
      break;
    case 'slide':
      Object.assign(o, { tracks: Number(v.tracks), open: st.preview / 100 });
      break;
    case 'zip':
      Object.assign(o, { fabric: hexOf(FABRIC_COLORS, st.fabric), open: st.preview / 100 });
      break;
    case 'guillotine':
      o.open = st.preview / 100;
      break;
  }
  return { type, o };
}

/** Indicative price: catalogue "from" price scaled by area (sub-linear), rounded to €100. */
function estimate(base: number, s: SystemDef, st: State) {
  const ref = s.dims.w[2] * (s.dims.d ? s.dims.d[2] : s.dims.h[2]);
  const area = st.w * (s.dims.d ? st.d : st.h);
  let p = base * Math.pow(area / ref, 0.85);
  if (s.id === 'bioclimatic') {
    if (st.values.side && st.values.side !== 'none') p *= 1.45;
    if (st.values.layout === 'double') p *= 1.08;
    if (st.values.layout === 'modular') p *= 1.15;
  }
  if (s.id === 'glassroof' && st.preview > 0) p += 2400;
  if (st.values.led) p += 390;
  if (s.id === 'slide') p *= 1 + (Number(st.values.tracks) - 3) * 0.12;
  return Math.max(base * 0.6, Math.round(p / 100) * 100);
}

export default function Builder3DPage() {
  const t = useDict(D);
  const l = useL();
  const lang = useLang();
  const [params, setParams] = useSearchParams();
  const products = useActiveProducts();
  const system = systemById(params.get('system')) ?? SYSTEMS[0];
  const [state, setState] = useState<State>(() => initialState(system));
  const [mode, setMode] = useState<ViewerMode>('day');
  const [view, setView] = useState<ViewerView>('corner');
  const [showDims, setShowDims] = useState(true);
  const [rotate, setRotate] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [gl] = useState(() => webglAvailable());

  // (re)create the viewer once
  useEffect(() => {
    if (!gl || !stageRef.current) return;
    const v = createViewer(stageRef.current, { keepView: true, labels: { w: true }, onInteract: () => setRotate(false) });
    viewerRef.current = v;
    if (import.meta.env.DEV) (window as unknown as { __viewer?: Viewer }).__viewer = v; // for scripted renders
    v.setAutoRotate(true);
    return () => {
      v.dispose();
      viewerRef.current = null;
    };
  }, [gl]);

  // switching system resets the configuration
  const firstSystem = useRef(system.id);
  useEffect(() => {
    if (firstSystem.current === system.id) return;
    firstSystem.current = system.id;
    setState(initialState(system));
  }, [system]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const { type, o } = viewerParams(system, state);
    v.update(type, o);
  }, [system, state]);

  useEffect(() => viewerRef.current?.setMode(mode), [mode]);
  useEffect(() => viewerRef.current?.setDims(showDims), [showDims]);
  useEffect(() => viewerRef.current?.setAutoRotate(rotate), [rotate]);

  const product = products.find((p) => p.id === system.productId);
  const price = product ? estimate(product.price, system, state) : null;
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const setValue = (k: string, val: string | boolean) => {
    setState((s) => ({ ...s, values: { ...s.values, [k]: val } }));
    // LEDs barely show in daylight — switching them on jumps to the night scene so the change is visible
    if (k === 'led' && val === true && mode === 'day') setMode('night');
  };

  const summary = useMemo(() => {
    const rows: [string, string][] = [[t('system'), l(system.name)]];
    rows.push([t('size'), [state.w, system.dims.d ? state.d : null, state.h].filter(Boolean).join(' × ') + ' cm']);
    rows.push([t('frame'), `${l(FRAME_COLORS.find((c) => c.id === state.color)?.label)} (${state.color})`]);
    if (system.fabric || (system.id === 'glassroof' && state.preview > 0)) rows.push([t('fabric'), l(FABRIC_COLORS.find((c) => c.id === state.fabric)?.label)]);
    for (const f of system.fields) {
      const v = state.values[f.key];
      rows.push([l(f.label), f.kind === 'toggle' ? (v ? t('on') : t('off')) : l(f.choices.find((c) => c.id === v)?.label)]);
    }
    if (system.id === 'glassroof') rows.push([l(system.preview.label), state.preview > 0 ? t('on') : t('off')]);
    return rows;
  }, [state, system, l, t]);

  const summaryText = summary.map(([k, v]) => `${k}: ${v}`).join('\n') + (price ? `\n${t('estimate')} ${money(price, lang, { decimals: false })}` : '');

  const pickSystem = (id: string) => {
    params.set('system', id);
    setParams(params, { replace: true });
  };

  const snapshot = () => {
    const v = viewerRef.current;
    if (!v) return;
    const a = document.createElement('a');
    a.href = v.snapshot();
    a.download = `TERSUN-${system.id}-${state.w}x${state.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const pill = (active: boolean) =>
    cn(
      'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition',
      active ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
    );

  return (
    <div className="bg-ink text-paper">
      <div className="grid lg:h-[calc(100svh-112px)] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* ------------------------------------------------ stage */}
        <div className="relative h-[62svh] min-h-[380px] overflow-hidden lg:h-auto">
          <div ref={stageRef} className="absolute inset-0" />
          {!gl && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div>
                <img src={system.image} alt="" className="mx-auto mb-6 max-h-64 rounded-2xl object-cover" />
                <p className="max-w-md text-sm text-paper/70">{t('noGl')}</p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_9_8/0.55)_0%,transparent_26%,transparent_74%,rgb(10_9_8/0.5)_100%)]" />

          {/* title */}
          <div className="pointer-events-none absolute left-5 top-5 sm:left-8 sm:top-7">
            <div className="eyebrow text-brand-200">{t('eyebrow')}</div>
            <h1 className="display mt-2 max-w-[calc(100vw-170px)] text-[28px] leading-[1.02] text-white sm:max-w-none sm:text-[52px]">{l(system.name)}</h1>
          </div>

          {/* mode switch */}
          <div className="absolute right-4 top-4 flex rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md sm:right-6 sm:top-6">
            {(
              [
                ['studio', <Lamp key="s" className="h-3.5 w-3.5" />],
                ['day', <Sun key="d" className="h-3.5 w-3.5" />],
                ['night', <Moon key="n" className="h-3.5 w-3.5" />],
              ] as const
            ).map(([m, icon]) => (
              <button key={m} onClick={() => setMode(m)} className={pill(mode === m)} aria-pressed={mode === m}>
                {icon}
                <span className="hidden sm:inline">{t(m)}</span>
              </button>
            ))}
          </div>

          {/* views + tools */}
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:bottom-auto sm:top-[132px]">
            <div className="flex rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md">
              {(['corner', 'front', 'side', 'top', 'inside'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setView(v);
                    setRotate(false);
                    viewerRef.current?.setView(v);
                  }}
                  className={pill(view === v && !rotate)}
                >
                  {t(v)}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md">
              <button onClick={() => setShowDims((x) => !x)} className={pill(showDims)} title={t('dims')} aria-pressed={showDims}>
                <Ruler className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setRotate((x) => !x)} className={pill(rotate)} title={t('rotate')} aria-pressed={rotate}>
                <Move3d className="h-3.5 w-3.5" />
              </button>
              <button onClick={snapshot} className={pill(false)} title={t('snapshot')}>
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ panel */}
        <aside className="flex min-h-0 flex-col border-l border-white/[0.06] bg-[#1a1917]">
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-7">
            {/* systems */}
            <section>
              <PanelLabel>{t('system')}</PanelLabel>
              <div className="grid grid-cols-3 gap-2">
                {SYSTEMS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickSystem(s.id)}
                    className={cn(
                      'group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 transition',
                      s.id === system.id ? 'ring-2 ring-brand-300' : 'ring-white/10 hover:ring-white/30',
                    )}
                  >
                    <img src={s.image.replace(/\.webp$/, '-sm.webp')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <span className="absolute inset-x-1.5 bottom-1.5 text-left text-[10.5px] font-semibold leading-tight text-white">{l(s.name)}</span>
                    {s.id === system.id && (
                      <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-300 text-ink">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* dimensions */}
            <section>
              <PanelLabel>{t('size')}</PanelLabel>
              <div className="space-y-4">
                <Range label={t('width')} value={state.w} range={system.dims.w} step={10} unit="cm" onChange={(w) => set({ w })} />
                {system.dims.d && <Range label={t('depth')} value={state.d} range={system.dims.d} step={10} unit="cm" onChange={(d) => set({ d })} />}
                <Range label={t('height')} value={state.h} range={system.dims.h} step={10} unit="cm" onChange={(h) => set({ h })} />
              </div>
            </section>

            {/* live preview slider */}
            <section>
              <Range
                label={l(system.preview.label)}
                value={state.preview}
                range={[system.preview.min, system.preview.max, system.preview.value]}
                step={1}
                unit={system.preview.unit}
                onChange={(preview) => set({ preview })}
                accent
              />
            </section>

            {/* colours */}
            <section>
              <PanelLabel>{t('frame')}</PanelLabel>
              <Swatches list={FRAME_COLORS} value={state.color} onChange={(color) => set({ color })} label={l} />
            </section>
            {(system.fabric || (system.id === 'glassroof' && state.preview > 0)) && (
              <section>
                <PanelLabel>{t('fabric')}</PanelLabel>
                <Swatches list={FABRIC_COLORS} value={state.fabric} onChange={(fabric) => set({ fabric })} label={l} />
              </section>
            )}

            {/* options */}
            {system.fields.map((f) => (
              <section key={f.key}>
                <PanelLabel>{l(f.label)}</PanelLabel>
                {f.kind === 'toggle' ? (
                  <div className="flex gap-2">
                    {[true, false].map((on) => (
                      <Chip key={String(on)} active={state.values[f.key] === on} onClick={() => setValue(f.key, on)}>
                        {on ? t('on') : t('off')}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {f.choices.map((c) => (
                      <Chip key={c.id} active={state.values[f.key] === c.id} onClick={() => setValue(f.key, c.id)}>
                        {l(c.label)}
                      </Chip>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <button onClick={() => setState(initialState(system))} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-paper/50 hover:text-paper">
              <RotateCcw className="h-3.5 w-3.5" /> {t('reset')}
            </button>
          </div>

          {/* summary bar */}
          <div className="border-t border-white/[0.08] bg-[#141312] px-5 py-5 sm:px-7">
            {price && (
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-paper/45">{t('estimate')}</div>
                  <div className="display mt-1 text-[34px] leading-none text-white tabular-nums">{money(price, lang, { decimals: false })}</div>
                </div>
                <div className="max-w-[150px] text-right text-[11px] leading-snug text-paper/40">{t('estimateHint')}</div>
              </div>
            )}
            <Button size="lg" className="w-full" onClick={() => setQuoteOpen(true)} iconRight={<ArrowRight className="h-4 w-4" />}>
              {t('quote')}
            </Button>
          </div>
        </aside>
      </div>

      <Drawer open={quoteOpen} onClose={() => setQuoteOpen(false)} title={t('quoteTitle')} width="max-w-[480px]">
        <div className="space-y-6 p-5 sm:p-6">
          <dl className="divide-y divide-line rounded-2xl border border-line bg-white text-[13.5px]">
            {summary.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-semibold text-ink">{v}</dd>
              </div>
            ))}
            {price && (
              <div className="flex justify-between gap-4 bg-sand/60 px-4 py-3">
                <dt className="font-semibold text-ink">{t('estimate')}</dt>
                <dd className="font-bold text-ink">{money(price, lang, { decimals: false })}</dd>
              </div>
            )}
          </dl>
          <MeasureForm key={summaryText} type="quote" productId={system.productId} defaultMessage={summaryText} onDone={() => undefined} />
        </div>
      </Drawer>
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-paper/45">{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 rounded-full px-4 text-[13px] font-semibold ring-1 transition',
        active ? 'bg-paper text-ink ring-paper' : 'text-paper/75 ring-white/15 hover:text-white hover:ring-white/40',
      )}
    >
      {children}
    </button>
  );
}

function Swatches({
  list,
  value,
  onChange,
  label,
}: {
  list: { id: string; hex?: string; label: import('@/lib/types').L10n }[];
  value: string;
  onChange: (id: string) => void;
  label: (v: import('@/lib/types').L10n) => string;
}) {
  const cur = list.find((c) => c.id === value);
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {list.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            title={label(c.label)}
            aria-pressed={c.id === value}
            className={cn('h-10 w-10 rounded-full ring-offset-2 ring-offset-[#1a1917] transition', c.id === value ? 'ring-2 ring-brand-300' : 'ring-1 ring-white/20 hover:ring-white/50')}
            style={{ background: c.hex }}
          />
        ))}
      </div>
      {cur && <div className="mt-2 text-[12.5px] text-paper/55">{label(cur.label)}</div>}
    </div>
  );
}

function Range({
  label,
  value,
  range,
  step,
  unit,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  range: [number, number, number];
  step: number;
  unit: string;
  onChange: (v: number) => void;
  accent?: boolean;
}) {
  const pct = ((value - range[0]) / (range[1] - range[0])) * 100;
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className={cn('text-[13px] font-semibold', accent ? 'text-brand-200' : 'text-paper/80')}>
          {accent && <SunMedium className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" />}
          {label}
        </span>
        <span className="display text-[18px] tabular-nums text-white">
          {value}
          <span className="ml-0.5 text-[12px] text-paper/45">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={range[0]}
        max={range[1]}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tersun-range w-full"
        style={{ ['--pct' as string]: `${pct}%` }}
      />
    </label>
  );
}

