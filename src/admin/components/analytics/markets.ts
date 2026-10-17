// Markets (PDF p.37): "Shtete/rajone, status, valutë, gjuhë, katalog, domen dhe rregulla dërgese. Konfigurim default
// dhe overrides të tregut … Shuma fikse në valuta të ndryshme kërkon politikë konvertimi dhe rrumbullakimi të ruajtur."
// `Market` (lib/types) holds the core fields; the per-market overrides below are stored on the same objects
// (MarketX is a structural extension, so it still saves through updateSettings({ markets })).
import type { L10n, Lang, Market } from '@/lib/types';

export type Rounding = 'none' | '0.99' | '1' | '10' | '100';
export const ROUNDINGS: Rounding[] = ['none', '0.99', '1', '10', '100'];
export type ShippingMode = 'zones' | 'flat' | 'none';
export type CatalogMode = 'all' | 'stock';

export interface MarketX extends Market {
  domain?: string;
  defaultLang?: Lang;
  /** units of the market currency per 1 EUR (stored rate — never live) */
  fxRate?: number;
  rounding?: Rounding;
  shipping?: { mode: ShippingMode; fee?: number; days?: string };
  catalog?: CatalogMode;
}

export const CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP', 'ALL', 'MKD'] as const;

export const COUNTRIES: Record<string, L10n> = {
  XK: { de: 'Kosovo', sq: 'Kosova', en: 'Kosovo' },
  AL: { de: 'Albanien', sq: 'Shqipëria', en: 'Albania' },
  MK: { de: 'Nordmazedonien', sq: 'Maqedonia e Veriut', en: 'North Macedonia' },
  DE: { de: 'Deutschland', sq: 'Gjermania', en: 'Germany' },
  AT: { de: 'Österreich', sq: 'Austria', en: 'Austria' },
  CH: { de: 'Schweiz', sq: 'Zvicra', en: 'Switzerland' },
  IT: { de: 'Italien', sq: 'Italia', en: 'Italy' },
  NL: { de: 'Niederlande', sq: 'Holanda', en: 'Netherlands' },
  US: { de: 'USA', sq: 'SHBA', en: 'USA' },
};

const DEFAULTS: Record<string, Partial<MarketX>> = {
  'mk-xk': { domain: 'tersun.com', defaultLang: 'sq', fxRate: 1, rounding: 'none', shipping: { mode: 'zones' }, catalog: 'all' },
  'mk-al': { domain: 'tersun.com/al', defaultLang: 'sq', fxRate: 1, rounding: 'none', shipping: { mode: 'flat', fee: 15, days: '2–4' }, catalog: 'all' },
  'mk-dach': { domain: 'tersun.com/de', defaultLang: 'de', fxRate: 1, rounding: 'none', shipping: { mode: 'flat', fee: 35, days: '4–7' }, catalog: 'all' },
  'mk-us': { domain: 'tersun.com/us', defaultLang: 'en', fxRate: 1.08, rounding: '0.99', shipping: { mode: 'flat', fee: 0, days: '' }, catalog: 'stock' },
};
const GENERIC: Partial<MarketX> = { domain: '', fxRate: 1, rounding: 'none', shipping: { mode: 'flat', fee: 0, days: '' }, catalog: 'stock' };

/** Market with its overrides filled in (stored values win over the defaults). */
export function marketX(m: Market): MarketX {
  const x = m as MarketX;
  const d = DEFAULTS[m.id] ?? GENERIC;
  return { ...d, ...x, defaultLang: x.defaultLang ?? d.defaultLang ?? m.languages[0] ?? 'de', shipping: x.shipping ?? d.shipping ?? { mode: 'flat' } };
}

/** Converted price with the stored rate and the market's rounding policy. */
export function convert(eur: number, m: Pick<MarketX, 'currency' | 'fxRate' | 'rounding'>): number {
  const raw = eur * (m.currency === 'EUR' ? 1 : m.fxRate || 1);
  switch (m.rounding ?? 'none') {
    case '0.99':
      return Math.max(0.99, Math.ceil(raw) - 0.01);
    case '1':
      return Math.round(raw);
    case '10':
      return Math.round(raw / 10) * 10;
    case '100':
      return Math.round(raw / 100) * 100;
    default:
      return Math.round(raw * 100) / 100;
  }
}

export function moneyIn(value: number, currency: string, lang: Lang) {
  const decimals = !Number.isInteger(Math.round(value * 100) / 100);
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-IE' : 'de-DE', { style: 'currency', currency, currencyDisplay: currency === 'EUR' ? 'symbol' : 'code', minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
