import type { Lang, Unit } from './types';

const LOCALE: Record<Lang, string> = { de: 'de-DE', sq: 'de-DE', en: 'en-IE' };
const DATE_LOCALE: Record<Lang, string> = { de: 'de-DE', sq: 'sq-AL', en: 'en-GB' };

/** 1.249,00 € (DE/SQ) — €1,249.00 (EN) */
export function money(value: number, lang: Lang = 'de', opts: { decimals?: boolean } = {}) {
  const decimals = opts.decimals ?? true;
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(value);
}

/** Compact money for charts/KPIs: 12,4k € */
export function moneyCompact(value: number, lang: Lang = 'de') {
  if (Math.abs(value) < 10000) return money(value, lang, { decimals: false });
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function num(value: number, lang: Lang = 'de', maxDecimals = 2) {
  return new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: maxDecimals }).format(value);
}

/* Albanian names, for browsers without Albanian locale data: Intl then silently answers in English. */
const SQ_MONTHS = {
  short: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
  long: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
};
const SQ_DAYS = { short: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'], long: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'] };
const supported = new Map<string, boolean>();
const hasLocale = (loc: string) => {
  let v = supported.get(loc);
  if (v === undefined) {
    try {
      v = Intl.DateTimeFormat.supportedLocalesOf(loc).length > 0;
    } catch {
      v = false;
    }
    supported.set(loc, v);
  }
  return v;
};

/** en-GB order (day month year, 24 h) with the month and weekday names in Albanian. */
function albanianFallback(d: Date, opts: Intl.DateTimeFormatOptions) {
  const num = new Intl.DateTimeFormat('en-GB', { ...opts, month: opts.month ? 'numeric' : undefined, weekday: undefined }).formatToParts(d);
  const month = Number(num.find((p) => p.type === 'month')?.value ?? d.getMonth() + 1) - 1;
  const parts = new Intl.DateTimeFormat('en-GB', { ...opts, hour12: false }).formatToParts(d);
  const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: opts.timeZone }).format(d);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
  return parts
    .map((p) => {
      if (p.type === 'month' && (opts.month === 'short' || opts.month === 'long')) return SQ_MONTHS[opts.month][month];
      if (p.type === 'weekday' && day >= 0) return opts.weekday === 'long' ? SQ_DAYS.long[day] : SQ_DAYS.short[day];
      return p.value;
    })
    .join('');
}

export function date(iso: string | Date, lang: Lang = 'de', opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  try {
    if (lang === 'sq' && !hasLocale(DATE_LOCALE.sq)) return albanianFallback(d, opts);
    return new Intl.DateTimeFormat(DATE_LOCALE[lang], opts).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-GB', opts).format(d);
  }
}

export function dateTime(iso: string, lang: Lang = 'de') {
  return date(iso, lang, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const REL: Record<Lang, { now: string; min: string; h: string; d: string; ago: (s: string) => string }> = {
  de: { now: 'gerade eben', min: 'Min.', h: 'Std.', d: 'Tg.', ago: (s) => `vor ${s}` },
  sq: { now: 'tani', min: 'min', h: 'orë', d: 'ditë', ago: (s) => `para ${s}` },
  en: { now: 'just now', min: 'min', h: 'h', d: 'd', ago: (s) => `${s} ago` },
};

export function timeAgo(iso: string, lang: Lang = 'de') {
  const r = REL[lang];
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return r.now;
  if (diff < 3600) return r.ago(`${Math.floor(diff / 60)} ${r.min}`);
  if (diff < 86400) return r.ago(`${Math.floor(diff / 3600)} ${r.h}`);
  if (diff < 86400 * 30) return r.ago(`${Math.floor(diff / 86400)} ${r.d}`);
  return date(iso, lang);
}

const UNIT_LABEL: Record<Lang, Record<Unit, string>> = {
  de: { kom: 'Stk.', m2: 'm²', m: 'm', set: 'Set' },
  sq: { kom: 'copë', m2: 'm²', m: 'm', set: 'set' },
  en: { kom: 'pc', m2: 'm²', m: 'm', set: 'set' },
};

export function unitLabel(unit: Unit, lang: Lang = 'de') {
  return UNIT_LABEL[lang][unit];
}

/** "/ m²" style suffix for prices */
export function perUnit(unit: Unit, lang: Lang = 'de') {
  return `/ ${unitLabel(unit, lang)}`;
}
