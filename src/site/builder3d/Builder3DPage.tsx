import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { Camera, Check, CloudRain, Link2, Loader2, Maximize, Minimize, Moon, Move3d, Ruler, Sun, SunMedium, Lamp, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Overlay';
import { MeasureForm } from '@/site/components/MeasureForm';
import { defineDict, useDict, useL, useLang } from '@/i18n';
import { useActiveProducts } from '@/store/hooks';
import { money, num } from '@/lib/format';
import { cn } from '@/lib/utils';
import { href } from '@/lib/paths';
import { usePageTitle } from '@/site/layout/SiteLayout';
import { createViewer, webglAvailable, type Viewer, type ViewerMode, type ViewerOptions, type ViewerView } from './viewer';
import { FABRIC_COLORS, FRAME_COLORS, SYSTEMS, productFor, systemById, systemForProduct, type SystemDef } from './systems';

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
    view: 'Ansicht',
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
    colour: 'Farbe',
    options: 'Optionen',
    scene: 'Szene',
    time: 'Tageszeit',
    rain: 'Regen',
    furniture: 'Möblierung',
    lounge: 'Lounge',
    dining: 'Esstisch',
    none: 'Ohne',
    share: 'Link teilen',
    copied: 'Link kopiert – zum Teilen bereit',
    fullscreen: 'Vollbild',
    area: 'Fläche',
    rainSensor: 'Regensensor: Lamellen geschlossen',
    link: 'Link',
    loading: '3D wird geladen …',
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
    view: 'Pamja',
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
    colour: 'Ngjyra',
    options: 'Opsione',
    scene: 'Skena',
    time: 'Ora e ditës',
    rain: 'Shi',
    furniture: 'Mobilimi',
    lounge: 'Lounge',
    dining: 'Tavolinë',
    none: 'Pa mobilie',
    share: 'Ndaj linkun',
    copied: 'Linku u kopjua – gati për ta ndarë',
    fullscreen: 'Ekran i plotë',
    area: 'Sipërfaqja',
    rainSensor: 'Sensori i shiut: lamelat u mbyllën',
    link: 'Linku',
    loading: '3D po ngarkohet …',
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
    view: 'View',
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
    colour: 'Colour',
    options: 'Options',
    scene: 'Scene',
    time: 'Time of day',
    rain: 'Rain',
    furniture: 'Furniture',
    lounge: 'Lounge',
    dining: 'Dining',
    none: 'None',
    share: 'Share link',
    copied: 'Link copied – ready to share',
    fullscreen: 'Full screen',
    area: 'Area',
    rainSensor: 'Rain sensor: louvres closed',
    link: 'Link',
    loading: 'Loading 3D …',
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

/** The starting point when the builder opens for a catalogue product: its layout / mount and size preselected. */
function variantState(s: SystemDef, productId: string | null): State {
  const st = initialState(s);
  const v = s.variants.find((x) => x.productId === productId);
  if (v?.values) Object.assign(st.values, v.values);
  if (v?.dims) Object.assign(st, v.dims);
  return st;
}

/** The configuration an address stands for: its code, else the product it was opened for, else the defaults. */
const startState = (s: SystemDef, code: string | null, productId: string | null) => decodeState(s, code) ?? variantState(s, productId);

/** Pack a configuration into a short URL value, e.g. "450.350.260.0.0.35.0001" (sizes, colours, slider, options). */
function encodeState(s: SystemDef, st: State) {
  const opts = s.fields.map((f) => (f.kind === 'toggle' ? (st.values[f.key] ? 1 : 0) : Math.max(0, f.choices.findIndex((c) => c.id === st.values[f.key])))).join('');
  const ci = Math.max(0, FRAME_COLORS.findIndex((c) => c.id === st.color)), fi = Math.max(0, FABRIC_COLORS.findIndex((c) => c.id === st.fabric));
  return [st.w, st.d, st.h, ci, fi, st.preview, opts || 'x'].join('.');
}

/** Read a packed configuration back; anything out of range falls back to the system's defaults. */
function decodeState(s: SystemDef, code: string | null): State | null {
  if (!code) return null;
  const p = code.split('.');
  if (p.length !== 7) return null;
  const base = initialState(s);
  // an empty field keeps the default (Number('') would be 0); values land on the slider's steps
  const snap = (v: string, [min, max]: [number, number, number], fallback: number, step = 10) => {
    const n = v.trim() === '' ? NaN : Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, min + Math.round((n - min) / step) * step)) : fallback;
  };
  const values = { ...base.values };
  s.fields.forEach((f, i) => {
    const d = Number(p[6][i]);
    if (!Number.isInteger(d)) return;
    if (f.kind === 'toggle') {
      if (d === 0 || d === 1) values[f.key] = d === 1;
    } else if (f.choices[d]) values[f.key] = f.choices[d].id;
  });
  return {
    w: snap(p[0], s.dims.w, base.w),
    d: s.dims.d ? snap(p[1], s.dims.d, base.d) : 0,
    h: snap(p[2], s.dims.h, base.h),
    color: FRAME_COLORS[Number(p[3])]?.id ?? base.color,
    fabric: FABRIC_COLORS[Number(p[4])]?.id ?? base.fabric,
    preview: snap(p[5], [s.preview.min, s.preview.max, 0], base.preview, 1),
    values,
  };
}

const VIEWS = ['corner', 'front', 'side', 'top', 'inside'] as const;

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

/** The second wing of an L-shaped glass roof (cm), as the viewer builds it: 60 % of the width, 2.5–4 m long, as deep as the roof. */
const lWing = (s: SystemDef, st: State) => (s.id === 'glassroof' && st.values.layout === 'l-shape' ? Math.min(Math.max(250, st.w * 0.6), 400) : 0);

/** Covered area in cm²: roofs width × depth (plus the wing of an L), walls and screens width × height. */
const areaOf = (s: SystemDef, st: State) => (s.dims.d ? (st.w + lWing(s, st)) * st.d : st.w * st.h);

/** Indicative price: catalogue "from" price scaled by area (sub-linear), rounded to €100. */
function estimate(base: number, s: SystemDef, st: State) {
  const ref = s.dims.w[2] * (s.dims.d ? s.dims.d[2] : s.dims.h[2]);
  let p = base * Math.pow(areaOf(s, st) / ref, 0.85);
  if (s.id === 'bioclimatic') {
    if (st.values.side && st.values.side !== 'none') p *= 1.45;
    if (st.values.layout === 'double') p *= 1.08;
    if (st.values.layout === 'modular') p *= 1.15;
  }
  if (s.id === 'glassroof' && st.preview > 0) p += 2400;
  if (st.values.led) p += 390;
  if (s.id === 'slide') p *= 1 + (Number(st.values.tracks) - 3) * 0.12;
  return Math.round(Math.max(base * 0.6, p) / 100) * 100;
}

export default function Builder3DPage() {
  const t = useDict(D);
  const l = useL();
  const lang = useLang();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const products = useActiveProducts();
  const system = systemById(params.get('system')) ?? systemForProduct(params.get('product')) ?? SYSTEMS[0];
  // the catalogue product the builder was opened for (`&product=`), when it is one of this system's
  const asked = params.get('product');
  const requested = system.variants.some((v) => v.productId === asked) ? asked : null;
  const [mode, setMode] = useState<ViewerMode>('day');
  const [view, setView] = useState<ViewerView>('corner');
  const [showDims, setShowDims] = useState(true);
  const [rotate, setRotate] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [tab, setTab] = useState<'system' | 'size' | 'colour' | 'options' | 'scene'>('system');
  // scene: time of day, weather and furniture are for looking, they are not part of the order
  const [hours, setHours] = useState(16);
  const [rain, setRain] = useState(false);
  const [furniture, setFurniture] = useState<'lounge' | 'dining' | 'none'>('lounge');
  const [isFull, setIsFull] = useState(false);
  const angleBeforeRain = useRef<number | null>(null);

  // A configuration that starts afresh (a reset, another system, an address): while it rains, the rain
  // sensor closes the louvres right away, and an angle saved before the rain belongs to the old one.
  const withSensor = (s: SystemDef, st: State): State => {
    angleBeforeRain.current = null;
    if (!rain || s.id !== 'bioclimatic' || st.preview <= 4) return st;
    angleBeforeRain.current = st.preview;
    return { ...st, preview: 0 };
  };

  const [saved, setState] = useState<State>(() => startState(system, params.get('c'), requested));
  // Back / Forward and links within the builder: the address decides. Another system, or a code other than the
  // one on screen, starts from the address; the same system without a code (the header link) keeps what is on
  // screen, and the effect below writes its code back. Decided while rendering, so the system and its
  // configuration never reach the 3D view out of step.
  let state = saved;
  const [seen, setSeen] = useState({ key: location.key, sys: system.id });
  if (seen.key !== location.key) {
    const code = params.get('c');
    setSeen({ key: location.key, sys: system.id });
    if (seen.sys !== system.id || (code && code !== encodeState(system, saved))) {
      state = withSensor(system, startState(system, code, requested));
      setState(state);
    }
  }
  usePageTitle(`${l(system.name)} · ${t('eyebrow')}`);

  // Phones: the builder fills exactly the screen below the header, so nothing needs page scrolling. A phone on its
  // side (short) puts the stage and the panel side by side; narrow screens move the views into the Scene tab.
  const rootRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ h: 640, short: false, narrow: false });
  useLayoutEffect(() => {
    if (isFull) return; // fixed to the screen: nothing to measure
    const measure = () => {
      const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const vw = window.innerWidth, vh = window.innerHeight, avail = vh - top;
      const short = vw < 1024 && vw > vh && avail < 560;
      setFit({ h: Math.max(short ? 200 : 460, Math.round(avail)), short, narrow: vw < 640 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isFull]);
  const { short } = fit;
  const compact = fit.short || fit.narrow;
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [gl] = useState(() => webglAvailable());
  const [ready3d, setReady3d] = useState(false);

  // (re)create the viewer once
  useEffect(() => {
    if (!gl || !stageRef.current) return;
    const v = createViewer(stageRef.current, { keepView: true, labels: { w: true }, onInteract: () => setRotate(false), onReady: () => setReady3d(true) });
    viewerRef.current = v;
    if (import.meta.env.DEV) (window as unknown as { __viewer?: Viewer }).__viewer = v; // for scripted renders
    v.setAutoRotate(true);
    return () => {
      v.dispose();
      viewerRef.current = null;
      setReady3d(false);
    };
  }, [gl]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const { type, o } = viewerParams(system, state);
    v.update(type, o);
  }, [system, state]);

  useEffect(() => viewerRef.current?.setMode(mode), [mode]);
  useEffect(() => viewerRef.current?.setTime(hours), [hours]);
  useEffect(() => viewerRef.current?.setRain(rain), [rain]);
  useEffect(() => viewerRef.current?.setFurniture(furniture), [furniture]);

  // the catalogue product this configuration is (bioclimatic wall, glass roof L-shape, …): the quote is filed against it
  const variant = productFor(system, state.values, requested);
  const quoteProductId = products.some((p) => p.id === variant) ? variant : system.productId;

  // keep the address bar in step with the configuration, so the page can be shared or bookmarked as it is
  // (also after a navigation that kept the configuration on screen: location.key)
  const shareCode = encodeState(system, state);
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('system', system.id);
      if (variant !== system.productId) url.searchParams.set('product', variant);
      else url.searchParams.delete('product');
      url.searchParams.set('c', shareCode);
      window.history.replaceState(window.history.state, '', url);
    }, 250);
    return () => clearTimeout(id);
  }, [system.id, system.productId, variant, shareCode, location.key]);
  const shareUrl = () => window.location.origin + href(`/3d?system=${system.id}${variant !== system.productId ? `&product=${variant}` : ''}&c=${shareCode}`);

  useEffect(() => {
    const fn = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);
  useEffect(() => viewerRef.current?.setDims(showDims), [showDims]);
  useEffect(() => viewerRef.current?.setAutoRotate(rotate), [rotate]);

  const product = products.find((p) => p.id === system.productId);
  const price = product ? estimate(product.price, system, state) : null;
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const setValue = (k: string, val: string | boolean) => {
    setState((s) => ({ ...s, values: { ...s.values, [k]: val } }));
    // LEDs do not show in daylight or in the studio — switching them on jumps to the night scene so the change is visible
    if (k === 'led' && val === true && mode !== 'night') setMode('night');
  };
  const reset = () => setState(withSensor(system, variantState(system, requested)));

  const wing = lWing(system, state);
  const areaText = `${num(Math.round(areaOf(system, state) / 1000) / 10, lang, 1)} m²`;

  const summary = useMemo(() => {
    const quoted = products.find((p) => p.id === quoteProductId);
    const rows: [string, string][] = [[t('system'), l(quoted && quoteProductId !== system.productId ? quoted.name : system.name)]];
    rows.push([t('size'), [state.w, system.dims.d ? state.d : null, state.h].filter(Boolean).join(' × ') + ' cm' + (wing ? ` + ${wing} × ${state.d} cm` : '')]);
    rows.push([t('area'), areaText]);
    rows.push([t('frame'), `${l(FRAME_COLORS.find((c) => c.id === state.color)?.label)} (${state.color})`]);
    if (system.fabric || (system.id === 'glassroof' && state.preview > 0)) rows.push([t('fabric'), l(FABRIC_COLORS.find((c) => c.id === state.fabric)?.label)]);
    for (const f of system.fields) {
      const v = state.values[f.key];
      rows.push([l(f.label), f.kind === 'toggle' ? (v ? t('on') : t('off')) : l(f.choices.find((c) => c.id === v)?.label)]);
    }
    if (system.id === 'glassroof') rows.push([l(system.preview.label), state.preview > 0 ? t('on') : t('off')]);
    return rows;
  }, [state, system, l, t, areaText, wing, products, quoteProductId]);

  const summaryText =
    summary.map(([k, v]) => `${k}: ${v}`).join('\n') + (price ? `\n${t('estimate')} ${money(price, lang, { decimals: false })}` : '') + `\n${t('link')}: ${shareUrl()}`;

  // another system starts from its defaults: the code and product in the address belong to the old one
  const pickSystem = (id: string) => {
    if (id === system.id) return;
    const next = new URLSearchParams(params);
    next.set('system', id);
    next.delete('c');
    next.delete('product');
    setParams(next, { replace: true });
  };

  const pickView = (v: ViewerView) => {
    setView(v);
    setRotate(false);
    viewerRef.current?.setView(v);
  };

  const pickTime = (h: number) => {
    setHours(h);
    if (mode !== 'day') setMode('day');
  };

  // rain: the scene needs a sky, and a bioclimatic roof reacts like its rain sensor would — the louvres close
  const rainShown = rain && mode !== 'studio'; // the studio has no weather
  const toggleRain = (on: boolean) => {
    setRain(on);
    if (on && mode === 'studio') setMode('day');
    if (system.id !== 'bioclimatic') return;
    if (on && state.preview > 4) {
      angleBeforeRain.current = state.preview;
      set({ preview: 0 });
      toast(t('rainSensor'));
    } else if (!on && angleBeforeRain.current != null) {
      set({ preview: angleBeforeRain.current });
      angleBeforeRain.current = null;
    }
  };
  // the visitor sets the louvres by hand: that is the angle now, also after the rain
  const setPreview = (preview: number) => {
    angleBeforeRain.current = null;
    set({ preview });
  };

  // Full screen is the whole document with the builder laid over the site (fixed, below the drawers), so the
  // quote drawer and the toasts, which live outside the builder, stay visible.
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  const share = async () => {
    const url = shareUrl();
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ title: `TERSUN — ${l(system.name)}`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t('copied'));
      }
    } catch {
      /* share sheet dismissed or clipboard blocked */
    }
  };

  const snapshot = () => {
    const v = viewerRef.current;
    if (!v) return;
    const a = document.createElement('a');
    a.href = v.snapshot();
    // roofs: width × depth; walls and screens: width × height
    a.download = `TERSUN-${system.id}-${state.w}x${system.dims.d ? state.d : state.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const pill = (active: boolean, tight?: boolean) =>
    cn(
      'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full text-[12.5px] font-semibold transition',
      tight ? 'px-3' : 'px-3.5',
      active ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
    );

  // panel groups — stacked in the desktop sidebar, one tab at a time on phones
  const systemsBlock = (
      <>
            {/* systems */}
            <section>
              <PanelLabel className="max-lg:hidden">{t('system')}</PanelLabel>
              <div className="grid grid-cols-3 gap-2">
                {SYSTEMS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickSystem(s.id)}
                    className={cn(
                      'group relative aspect-[16/10] overflow-hidden rounded-xl ring-1 transition lg:aspect-[4/3]',
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

      </>);
  const sizeBlock = (
      <>
            {/* dimensions */}
            <section>
              <PanelLabel className="max-lg:hidden">{t('size')}</PanelLabel>
              <div className="space-y-2.5 lg:space-y-4">
                <Range label={t('width')} value={state.w} range={system.dims.w} step={10} unit="cm" onChange={(w) => set({ w })} />
                {system.dims.d && <Range label={t('depth')} value={state.d} range={system.dims.d} step={10} unit="cm" onChange={(d) => set({ d })} />}
                <Range label={t('height')} value={state.h} range={system.dims.h} step={10} unit="cm" onChange={(h) => set({ h })} />
              </div>
              <div className="mt-3 flex items-baseline justify-between text-[12.5px] text-paper/50 lg:mt-4">
                <span>{t('area')}</span>
                <span className="font-semibold tabular-nums text-paper/80">{areaText}</span>
              </div>
            </section>

      </>);
  const liveBlock = (
      <>
            {/* live preview slider */}
            <section>
              <Range
                label={l(system.preview.label)}
                value={state.preview}
                range={[system.preview.min, system.preview.max, system.preview.value]}
                step={1}
                unit={system.preview.unit}
                onChange={setPreview}
                accent
              />
            </section>

      </>);
  const colourBlock = (
      <>
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

      </>);
  const optionsBlock = (
      <>
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

      </>);
  const resetButton = (
      <>
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-paper/50 hover:text-paper">
              <RotateCcw className="h-3.5 w-3.5" /> {t('reset')}
            </button>
      </>);
  const timeSection = (
    <section>
      <PanelLabel className="max-lg:hidden">{t('scene')}</PanelLabel>
      <Range
        label={t('time')}
        value={hours}
        range={[6, 20, 16]}
        step={0.5}
        unit=""
        format={(h) => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`}
        onChange={pickTime}
        dim={mode !== 'day'}
      />
    </section>
  );
  // the studio has no weather: the rain control is dimmed there (choosing rain switches to Day)
  const rainDim = mode === 'studio' && 'opacity-55';
  const sceneGrid = (withViews: boolean) => (
    <section className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 lg:block lg:space-y-6">
      {withViews && (
        <div className="contents lg:block">
          <PanelLabel className="max-lg:mb-0">{t('view')}</PanelLabel>
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <Chip key={v} active={view === v && !rotate} onClick={() => pickView(v)}>
                {t(v)}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div className="contents lg:block">
        <PanelLabel className={cn('max-lg:mb-0 transition-opacity', rainDim)}>{t('rain')}</PanelLabel>
        <div className={cn('flex gap-2 transition-opacity', rainDim)}>
          {[false, true].map((on) => (
            <Chip key={String(on)} active={rainShown === on} onClick={() => toggleRain(on)}>
              {on ? (
                <span className="inline-flex items-center gap-1.5">
                  <CloudRain className="h-3.5 w-3.5" /> {t('on')}
                </span>
              ) : (
                t('off')
              )}
            </Chip>
          ))}
        </div>
      </div>
      <div className="contents lg:block">
        <PanelLabel className="max-lg:mb-0">{t('furniture')}</PanelLabel>
        <div className="flex flex-wrap gap-2">
          {(['lounge', 'dining', 'none'] as const).map((k) => (
            <Chip key={k} active={furniture === k} onClick={() => setFurniture(k)}>
              {t(k)}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
  const sceneBlock = (
    <>
      {timeSection}
      {sceneGrid(false)}
    </>
  );
  // narrow screens: the views live here (first), not over the picture
  const phoneSceneBlock = compact ? (
    <>
      {sceneGrid(true)}
      {timeSection}
    </>
  ) : (
    sceneBlock
  );
  const tabs = [
    ['system', systemsBlock],
    ['size', sizeBlock],
    ['colour', colourBlock],
    ['options', (
      <>
        {liveBlock}
        {optionsBlock}
        {resetButton}
      </>
    )],
    ['scene', phoneSceneBlock],
  ] as const;

  const viewsRow = (
    <div className="no-scrollbar flex min-w-0 overflow-x-auto rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => pickView(v)} className={pill(view === v && !rotate, true)} aria-pressed={view === v && !rotate}>
          {t(v)}
        </button>
      ))}
    </div>
  );
  const toolsRow = (
    <div className="pointer-events-auto flex shrink-0 gap-1 rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md">
      <button onClick={() => setShowDims((x) => !x)} className={pill(showDims)} title={t('dims')} aria-label={t('dims')} aria-pressed={showDims}>
        <Ruler className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => setRotate((x) => !x)} className={pill(rotate)} title={t('rotate')} aria-label={t('rotate')} aria-pressed={rotate}>
        <Move3d className="h-3.5 w-3.5" />
      </button>
      <button onClick={snapshot} className={pill(false)} title={t('snapshot')} aria-label={t('snapshot')}>
        <Camera className="h-3.5 w-3.5" />
      </button>
      <button onClick={share} className={pill(false)} title={t('share')} aria-label={t('share')}>
        <Link2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={toggleFull} className={cn(pill(isFull), 'max-lg:hidden')} title={t('fullscreen')} aria-label={t('fullscreen')} aria-pressed={isFull}>
        {isFull ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  return (
    <div className="bg-ink text-paper">
      <div
        ref={rootRef}
        style={isFull ? undefined : { ['--b3d-h' as string]: `${fit.h}px` }}
        className={cn(
          'flex',
          isFull ? 'fixed inset-0 z-[70] bg-ink' : 'h-[var(--b3d-h)]',
          short ? 'flex-row' : 'flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_420px]',
        )}
      >
        {/* ------------------------------------------------ stage */}
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden lg:h-auto">
          <div ref={stageRef} className={cn('absolute inset-0 transition-opacity duration-500', gl && !ready3d && 'opacity-0')} />
          {gl && !ready3d && (
            <div className="absolute inset-0 grid place-items-center">
              <img src={system.image.replace(/\.webp$/, '-sm.webp')} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
              <div className="relative inline-flex items-center gap-2.5 rounded-full bg-black/45 px-5 py-2.5 text-[13px] font-semibold text-white/85 ring-1 ring-white/10 backdrop-blur-md">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('loading')}
              </div>
            </div>
          )}
          {!gl && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div>
                <img src={system.image} alt="" className="mx-auto mb-6 max-h-64 rounded-2xl object-cover" />
                <p className="max-w-md text-sm text-paper/70">{t('noGl')}</p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_9_8/0.55)_0%,transparent_26%,transparent_74%,rgb(10_9_8/0.5)_100%)]" />

          {/* title; on wider screens the views and tools follow it, so a title on two lines never runs into them */}
          <div className={cn('pointer-events-none absolute flex flex-col', short ? 'inset-x-3 top-3' : 'inset-x-4 top-4 sm:inset-x-6 sm:top-7')}>
            {/* kept clear of the mode switch on the right */}
            <div className={short ? 'max-w-[calc(100%-150px)]' : 'max-w-[calc(100%-150px)] sm:max-w-[calc(100%-270px)] sm:pl-2'}>
              {!short && <div className="eyebrow text-brand-200">{t('eyebrow')}</div>}
              <h1 className={cn('display leading-[1.02] text-white', short ? 'text-[19px]' : 'mt-2 text-[24px] sm:text-[44px] lg:text-[40px] xl:text-[52px]')}>{l(system.name)}</h1>
            </div>
            {!compact && (
              <div className="pointer-events-auto mt-5 flex items-center justify-between gap-2">
                {viewsRow}
                {toolsRow}
              </div>
            )}
          </div>

          {/* mode switch */}
          <div className={cn('absolute flex rounded-full bg-black/40 p-1 ring-1 ring-white/10 backdrop-blur-md', short ? 'right-3 top-3' : 'right-4 top-4 sm:right-6 sm:top-6')}>
            {(
              [
                ['studio', <Lamp key="s" className="h-3.5 w-3.5" />],
                ['day', <Sun key="d" className="h-3.5 w-3.5" />],
                ['night', <Moon key="n" className="h-3.5 w-3.5" />],
              ] as const
            ).map(([m, icon]) => (
              <button key={m} onClick={() => setMode(m)} className={pill(mode === m)} aria-pressed={mode === m} title={t(m)} aria-label={t(m)}>
                {icon}
                <span className={short ? 'hidden' : 'hidden sm:inline'}>{t(m)}</span>
              </button>
            ))}
          </div>

          {/* narrow and short screens: the tools in the corner, the views in the Scene tab */}
          {compact && <div className="absolute bottom-3 right-3">{toolsRow}</div>}
        </div>


        {/* ------------------------------------------------ panel: desktop sidebar */}
        <aside className="hidden min-h-0 flex-col border-l border-white/[0.06] bg-[#1a1917] lg:flex">
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-7">
            {systemsBlock}
            {sizeBlock}
            {liveBlock}
            {colourBlock}
            {optionsBlock}
            {sceneBlock}
            {resetButton}
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

        {/* ------------------------------------------------ panel: phone sheet (no page scrolling); beside the stage on a phone held sideways */}
        <div className={cn('flex shrink-0 flex-col border-white/[0.08] bg-[#1a1917] lg:hidden', short ? 'w-[min(340px,46vw)] border-l' : 'border-t')}>
          <div className="grid grid-cols-5 border-b border-white/[0.06]">
            {tabs.map(([id]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={cn(
                  'relative text-[12px] font-semibold transition',
                  short ? 'h-9' : 'h-11',
                  tab === id ? 'text-white' : 'text-paper/45',
                )}
              >
                {t(id)}
                {tab === id && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-brand-300" />}
              </button>
            ))}
          </div>
          <div className={cn('space-y-4 overflow-y-auto overscroll-contain px-4 py-3', short ? 'min-h-0 flex-1' : 'h-[214px]')}>{tabs.find(([id]) => id === tab)?.[1]}</div>
          <div className={cn('flex items-center justify-between gap-3 border-t border-white/[0.08] bg-[#141312] px-4', short ? 'py-2' : 'py-3')}>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper/45">{t('estimate')}</div>
              <div className={cn('display leading-none text-white tabular-nums', short ? 'text-[20px]' : 'text-[24px]')}>{price ? money(price, lang, { decimals: false }) : '—'}</div>
            </div>
            <Button size={short ? 'sm' : 'md'} onClick={() => setQuoteOpen(true)} iconRight={<ArrowRight className="h-4 w-4" />}>
              {t('quote')}
            </Button>
          </div>
        </div>
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
          <MeasureForm key={summaryText} type="quote" productId={quoteProductId} defaultMessage={summaryText} onDone={() => undefined} />
        </div>
      </Drawer>
    </div>
  );
}

function PanelLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-paper/45', className)}>{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full px-3.5 text-[12.5px] font-semibold ring-1 transition lg:h-9 lg:px-4 lg:text-[13px]',
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
  format,
  dim,
}: {
  label: string;
  value: number;
  range: [number, number, number];
  step: number;
  unit: string;
  onChange: (v: number) => void;
  accent?: boolean;
  /** custom text for the value (e.g. a clock time) */
  format?: (v: number) => string;
  /** shown paler while it does not apply (it still works: moving it switches back) */
  dim?: boolean;
}) {
  const pct = ((value - range[0]) / (range[1] - range[0])) * 100;
  return (
    <label className={cn('block transition-opacity', dim && 'opacity-55')}>
      <div className="mb-1 flex items-baseline justify-between lg:mb-2">
        <span className={cn('text-[13px] font-semibold', accent ? 'text-brand-200' : 'text-paper/80')}>
          {accent && <SunMedium className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" />}
          {label}
        </span>
        <span className="display text-[18px] tabular-nums text-white">
          {format ? format(value) : value}
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

