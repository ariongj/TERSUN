import { defineDict } from '@/i18n';
import type { Lang } from '@/lib/types';

/** Storefront collection page (/collection/:slug) — DE / SQ / EN. */
export const CT = defineDict({
  de: {
    eyebrow: 'Kollektion',
    countOne: '{n} Produkt',
    countMany: '{n} Produkte',
    fromPrice: 'Ab {price}',
    install: 'Fachgerechte Montage',
    upTo: 'Bis zu −{pct}%',
    autoPct: '−{pct}% automatisch im Warenkorb',
    autoFixed: '−{amount} automatisch im Warenkorb',
    browse: 'Produkte ansehen',
    inCollection: 'in der Kollektion',
    sortBy: 'Sortieren',
    sort_featured: 'Empfohlen',
    sort_bestselling: 'Meistverkauft',
    'sort_price-asc': 'Preis: aufsteigend',
    'sort_price-desc': 'Preis: absteigend',
    sort_newest: 'Neueste',
    emptyTitle: 'Diese Kollektion wird bald gefüllt',
    emptyText: 'Produkte für diese Kollektion folgen in Kürze — sehen Sie sich bis dahin den gesamten Katalog an.',
    otherEyebrow: 'Mehr Inspiration',
    otherTitle: 'Weitere *Kollektionen*',
    notFoundTitle: 'Diese Kollektion ist *nicht verfügbar*',
    notFoundText: 'Möglicherweise ist die Aktion beendet oder der Link hat sich geändert. Sehen Sie sich andere Kollektionen oder den gesamten Katalog an.',
    notFoundPageTitle: 'Kollektion nicht gefunden',
    previewBanner: 'Vorschau — diese Kollektion ist nicht veröffentlicht und für Kunden nicht sichtbar.',
    editInCms: 'Im CMS bearbeiten',
  },
  sq: {
    eyebrow: 'Koleksion',
    countOne: '{n} produkt',
    countMany: '{n} produkte',
    fromPrice: 'Që nga {price}',
    install: 'Montim profesional',
    upTo: 'Deri −{pct}%',
    autoPct: '−{pct}% automatikisht në shportë',
    autoFixed: '−{amount} automatikisht në shportë',
    browse: 'Shikoni produktet',
    inCollection: 'në koleksion',
    sortBy: 'Rendit',
    sort_featured: 'Të rekomanduara',
    sort_bestselling: 'Më të shiturat',
    'sort_price-asc': 'Çmimi: në rritje',
    'sort_price-desc': 'Çmimi: në zbritje',
    sort_newest: 'Më të rejat',
    emptyTitle: 'Koleksioni po mbushet së shpejti',
    emptyText: 'Produktet për këtë koleksion vijnë së shpejti — deri atëherë shikoni të gjithë katalogun.',
    otherEyebrow: 'Më shumë frymëzim',
    otherTitle: 'Koleksione *të tjera*',
    notFoundTitle: 'Ky koleksion *nuk është i disponueshëm*',
    notFoundText: 'Ndoshta oferta ka përfunduar ose lidhja ka ndryshuar. Shikoni koleksionet e tjera ose të gjithë katalogun.',
    notFoundPageTitle: 'Koleksioni nuk u gjet',
    previewBanner: 'Parapamje — koleksioni nuk është publikuar dhe klientët nuk e shohin.',
    editInCms: 'Ndrysho në CMS',
  },
  en: {
    eyebrow: 'Collection',
    countOne: '{n} product',
    countMany: '{n} products',
    fromPrice: 'From {price}',
    install: 'Professional installation',
    upTo: 'Up to −{pct}%',
    autoPct: '−{pct}% off, applied in the cart',
    autoFixed: '−{amount} off, applied in the cart',
    browse: 'Browse the products',
    inCollection: 'in this collection',
    sortBy: 'Sort',
    sort_featured: 'Featured',
    sort_bestselling: 'Best selling',
    'sort_price-asc': 'Price: low to high',
    'sort_price-desc': 'Price: high to low',
    sort_newest: 'Newest',
    emptyTitle: 'This collection is filling up soon',
    emptyText: 'Products for this collection are on their way — meanwhile, browse the full catalogue.',
    otherEyebrow: 'More inspiration',
    otherTitle: 'Other *collections*',
    notFoundTitle: 'This collection is *not available*',
    notFoundText: 'The sale may have ended or the link has changed. Browse other collections or the full catalogue.',
    notFoundPageTitle: 'Collection not found',
    previewBanner: 'Preview — this collection is not published and customers cannot see it.',
    editInCms: 'Edit in the CMS',
  },
});

export type CtT = (key: keyof typeof CT.de, vars?: Record<string, string | number>) => string;

/** "1 Produkt" / "5 Produkte" (DE / SQ / EN: only 1 is singular). */
export function countLabel(t: CtT, _lang: Lang, n: number) {
  const one = n === 1;
  return t(one ? 'countOne' : 'countMany', { n });
}

/** Accent the last word of a plain title ("Podovi na *akciji*") unless it already has *markers*. */
export const accentTitle = (title: string) => {
  if (title.includes('*')) return title;
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return `*${title.trim()}*`;
  return `${words.slice(0, -1).join(' ')} *${words[words.length - 1]}*`;
};
