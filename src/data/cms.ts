// CMS v2 demo data — collections, discounts, offers, placements, staff, appointments, segments,
// inventory, purchasing, drafts, returns, quotes, menus, content models and the audit log.
// Everything is relative to `now` so the demo always looks current, and coherent with the
// TERSUN catalogue (bioclimatic pergolas, glass roofs, awnings, Guillotine, Slide, ZIP, accessories).
import type {
  AuditEntry, Booking, Collection, ContentModel, Discount, DraftOrder, HomeSection, HomeVersion, Inquiry, InventoryMovement, L10n,
  Menu, Offer, Order, Placement, Product, Project, PurchaseOrder, Quote, ReturnRequest, Segment, Service, Staff,
} from '@/lib/types';
import { defaultOptions } from '@/lib/pricing';
import { refundForLines } from '@/lib/orders';
import { round2 } from '@/lib/utils';
import { DEFAULT_SETTINGS } from './content';

const T = (de: string, sq: string, en: string): L10n => ({ de, sq, en });
const E = (): L10n => ({ de: '', sq: '', en: '' });
const DAY = 86400000;
const iso = (now: Date, days: number, hours = 0) => new Date(now.getTime() + days * DAY + hours * 3600000).toISOString();

/** Showroom (default pickup location) and warehouse — taken from the settings so ids always match. */
const LOCATIONS = DEFAULT_SETTINGS.locations ?? [];
const LOC_SHOWROOM = LOCATIONS.find((l) => l.isDefault)?.id ?? LOCATIONS[0]?.id ?? 'loc-main';
const LOC_WAREHOUSE = LOCATIONS.find((l) => !l.pickup)?.id ?? LOCATIONS[1]?.id ?? LOC_SHOWROOM;

/* ================================================================== */
/* Products — tags, vendors, costs, barcodes, incoming, one archived   */
/* ================================================================== */
const COST_FACTOR: Record<string, number> = {
  'cat-bioclimatic': 0.56,
  'cat-glass-roof': 0.55,
  'cat-awning': 0.52,
  'cat-guillotine': 0.58,
  'cat-slide': 0.54,
  'cat-zip': 0.5,
  'cat-accessories': 0.48,
};

type Extra = { tags: string[]; vendor: string; incoming?: number; unavailable?: number; channels?: ('online' | 'pos')[] };
const SYSTEM: Pick<Extra, 'vendor' | 'channels'> = { vendor: 'TERSUN', channels: ['online'] };

const EXTRAS: Record<string, Extra> = {
  'p-bio-free': { ...SYSTEM, tags: ['louvres', 'freestanding', 'becker'] },
  'p-bio-wall': { ...SYSTEM, tags: ['louvres', 'wall-mounted', 'becker'] },
  'p-bio-double': { ...SYSTEM, tags: ['louvres', 'hospitality', 'premium'] },
  'p-bio-modular': { ...SYSTEM, tags: ['louvres', 'hospitality', 'new'] },
  'p-glass-wall': { ...SYSTEM, tags: ['glass', 'wall-mounted', 'samsung-led'] },
  'p-glass-free': { ...SYSTEM, tags: ['glass', 'freestanding', 'pool'] },
  'p-glass-l': { ...SYSTEM, tags: ['glass', 'corner', 'new'] },
  'p-awning': { ...SYSTEM, tags: ['sattler', 'motorised', 'shade'] },
  'p-awning-combo': { ...SYSTEM, tags: ['sattler', 'glass', 'set'] },
  'p-guillotine': { ...SYSTEM, tags: ['becker', 'glass', 'hospitality'] },
  'p-guillotine-balcony': { ...SYSTEM, tags: ['becker', 'balcony'] },
  'p-slide': { ...SYSTEM, tags: ['glass', 'winter-garden'] },
  'p-slide-wintergarden': { ...SYSTEM, tags: ['glass', 'winter-garden', 'set'] },
  'p-zip': { ...SYSTEM, tags: ['sattler', 'motorised', 'insect-screen'] },
  'p-zip-facade': { ...SYSTEM, tags: ['sattler', 'facade'] },
  'p-acc-led': { tags: ['lighting', 'warm', 'led'], vendor: 'Samsung LED', incoming: 40 },
  'p-acc-heater': { tags: ['heating', 'warm'], vendor: 'TERSUN' },
  'p-acc-remote': { tags: ['control', 'becker'], vendor: 'Becker' },
  'p-acc-sensor': { tags: ['control', 'automation'], vendor: 'Becker', incoming: 16 },
  'p-acc-smart': { tags: ['smart-home', 'app'], vendor: 'Somfy', unavailable: 1 },
  'p-acc-care': { tags: ['care'], vendor: 'TERSUN' },
};

/** EAN-13 with the GS1 prefix 530 and a valid check digit. */
function ean13(n: number) {
  const body = `530${String(100000000 + n * 7919).slice(-9)}`;
  const sum = body.split('').reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return body + ((10 - (sum % 10)) % 10);
}

/** Adds CMS v2 fields to the catalogue (cost, vendor, tags, barcode, incoming, channels, template). */
export function enrichProducts(products: Product[]): Product[] {
  return products.map((p, i): Product => {
    const x = EXTRAS[p.id];
    return {
      ...p,
      cost: round2(p.price * (COST_FACTOR[p.categoryId] ?? 0.55)),
      vendor: x?.vendor,
      tags: x?.tags ?? [],
      barcode: ean13(i + 1),
      incoming: x?.incoming ?? 0,
      unavailable: x?.unavailable ?? 0,
      template: p.quoteOnly ? 'quote' : 'standard',
      channels: x?.channels ?? ['online', 'pos'],
    };
  });
}

/** Discontinued line: archived after it had sales (orders keep their copy). */
export const ARCHIVED_PRODUCT = 'p-guillotine-balcony';

/* ================================================================== */
/* Collections                                                         */
/* ================================================================== */
const ACCESSORIES = ['p-acc-led', 'p-acc-heater', 'p-acc-remote', 'p-acc-sensor', 'p-acc-smart', 'p-acc-care'];

export function buildCollections(now: Date): Collection[] {
  return [
    {
      id: 'col-warm',
      slug: 'warm-evenings',
      title: T('Warme Abende', 'Mbrëmje të ngrohta', 'Warm evenings'),
      description: T(
        'Heizstrahler und LED-Licht für die kalte Saison – mit Code WARM15 15 % günstiger.',
        'Ngrohës dhe drita LED për sezonin e ftohtë – me kodin WARM15 15% më lirë.',
        'Heaters and LED light for the cold season – 15% off with code WARM15.',
      ),
      image: '/images/misc/night.webp',
      kind: 'smart',
      productIds: [],
      match: 'all',
      rules: [
        { field: 'category', op: 'eq', value: 'cat-accessories' },
        { field: 'tag', op: 'eq', value: 'warm' },
      ],
      sort: 'price-asc',
      published: true,
      seo: { title: 'Warme Abende — TERSUN', description: 'Infrarot-Heizstrahler und LED-Lichtsets für Pergola und Glasdach.' },
      createdAt: iso(now, -25),
    },
    {
      id: 'col-signature',
      slug: 'signature-systems',
      title: T('Signature-Systeme', 'Sistemet Signature', 'Signature systems'),
      description: T(
        'Unsere großen Systeme ab 7.000 € – für Villen, Hotels und Gastronomie.',
        'Sistemet tona të mëdha nga 7.000 € – për vila, hotele dhe gastronomi.',
        'Our large systems from €7,000 – for villas, hotels and hospitality.',
      ),
      image: '/images/hero/bioclimatic.webp',
      kind: 'smart',
      productIds: [],
      match: 'all',
      rules: [{ field: 'price', op: 'gt', value: '7000' }],
      sort: 'price-desc',
      published: true,
      createdAt: iso(now, -40),
    },
    {
      id: 'col-winter-garden',
      slug: 'winter-garden',
      title: T('Wintergarten', 'Kopsht dimëror', 'Winter garden'),
      description: T(
        'Glasdach, Glaswände und Wärme – die Terrasse für das ganze Jahr.',
        'Mbulojë xhami, mure xhami dhe ngrohje – tarraca për gjithë vitin.',
        'Glass roof, glass walls and warmth – the terrace for the whole year.',
      ),
      image: '/images/cat/slide.webp',
      kind: 'manual',
      productIds: ['p-slide-wintergarden', 'p-glass-wall', 'p-slide', 'p-guillotine', 'p-acc-heater', 'p-acc-led'],
      match: 'all',
      rules: [],
      sort: 'manual',
      published: true,
      createdAt: iso(now, -12),
    },
    {
      id: 'col-bestsellers',
      slug: 'bestsellers',
      title: T('Bestseller', 'Më të shiturat', 'Bestsellers'),
      description: T('Die Systeme und Extras, die unsere Kunden am häufigsten wählen.', 'Sistemet dhe shtesat që klientët tanë zgjedhin më shpesh.', 'The systems and extras our clients choose most often.'),
      image: '/images/p/zip-1.webp',
      kind: 'manual',
      productIds: ['p-zip', 'p-slide', 'p-glass-wall', 'p-awning', 'p-bio-free', 'p-acc-remote', 'p-acc-led', 'p-acc-care'],
      match: 'all',
      rules: [],
      sort: 'bestselling',
      published: true,
      createdAt: iso(now, -60),
    },
    {
      id: 'col-smart-terrace',
      slug: 'smart-terrace',
      title: T('Smarte Terrasse', 'Tarracë inteligjente', 'Smart terrace'),
      description: T(
        'Lamellen, Screens und Licht per App und Sensor – die Terrasse reagiert auf das Wetter.',
        'Lamela, perde dhe dritë me aplikacion dhe sensor – tarraca reagon ndaj motit.',
        'Louvres, screens and light via app and sensor – the terrace responds to the weather.',
      ),
      image: '/images/misc/builder-night.webp',
      kind: 'manual',
      productIds: ['p-bio-free', 'p-zip', 'p-acc-smart', 'p-acc-sensor', 'p-acc-remote', 'p-acc-led'],
      match: 'all',
      rules: [],
      sort: 'manual',
      published: false,
      createdAt: iso(now, -2),
    },
  ];
}

/* ================================================================== */
/* Discounts — all 4 types, code + automatic, every lifecycle state    */
/* ================================================================== */
const ALL_LINES = { scope: 'all' as const, ids: [] };
const NO_MIN = { type: 'none' as const, value: 0 };
const EVERYONE = { type: 'all' as const };

/** End of the WARM15 winter promo — same moment as the homepage promo countdown. */
export const autumnSaleEnd = (now: Date) => new Date(now.getTime() + 12 * DAY + 5 * 3600000).toISOString();

export function buildDiscounts(now: Date): Discount[] {
  return [
    {
      id: 'd-welcome10',
      title: 'Willkommen — WELCOME10',
      publicTitle: T('Willkommen −10 %', 'Mirë se vini −10%', 'Welcome −10%'),
      kind: 'order',
      method: 'code',
      code: 'WELCOME10',
      valueType: 'percent',
      value: 10,
      appliesTo: ALL_LINES,
      minimum: { type: 'amount', value: 100 },
      audience: EVERYONE,
      combines: { products: true, order: false, shipping: true },
      oncePerCustomer: false,
      startsAt: iso(now, -120),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -120),
      tags: ['welcome'],
    },
    {
      id: 'd-warm15',
      title: 'Winter — Heizstrahler & LED −15 % (WARM15)',
      publicTitle: T('Heizstrahler & LED −15 %', 'Ngrohës & LED −15%', 'Heaters & LED −15%'),
      kind: 'products',
      method: 'code',
      code: 'WARM15',
      valueType: 'percent',
      value: 15,
      appliesTo: { scope: 'collections', ids: ['col-warm'] },
      minimum: NO_MIN,
      audience: EVERYONE,
      combines: { products: true, order: true, shipping: true },
      startsAt: iso(now, -24),
      endsAt: autumnSaleEnd(now),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -25),
      tags: ['winter', 'accessories'],
    },
    {
      id: 'd-smart-remote',
      title: 'Smart-Home-Hub — Fernbedienung gratis',
      publicTitle: T('Zum Smart-Home-Hub die Fernbedienung gratis', 'Me Smart Home Hub telekomanda falas', 'Smart Home Hub + free remote'),
      kind: 'bxgy',
      method: 'auto',
      valueType: 'percent',
      value: 100,
      appliesTo: ALL_LINES,
      minimum: NO_MIN,
      bxgy: { buyIds: ['p-acc-smart'], buyScope: 'products', buyQty: 1, getIds: ['p-acc-remote'], getScope: 'products', getQty: 1, getType: 'free', getValue: 100, maxUses: 2 },
      audience: EVERYONE,
      combines: { products: true, order: true, shipping: true },
      startsAt: iso(now, -30),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -31),
      tags: ['smart-home'],
    },
    {
      id: 'd-shipping250',
      title: 'Kostenloser Versand ab 250 €',
      publicTitle: T('Kostenloser Versand ab 250 €', 'Dërgesë falas mbi 250 €', 'Free shipping over €250'),
      kind: 'shipping',
      method: 'auto',
      valueType: 'percent',
      value: 100,
      appliesTo: ALL_LINES,
      minimum: { type: 'amount', value: 250 },
      shipping: { zoneIds: [] },
      audience: EVERYONE,
      combines: { products: true, order: true, shipping: false },
      startsAt: iso(now, -200),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -200),
    },
    {
      id: 'd-care20',
      title: 'Pflegeset −20 % (automatisch)',
      publicTitle: T('Pflegeset −20 %', 'Set mirëmbajtjeje −20%', 'Care kit −20%'),
      kind: 'products',
      method: 'auto',
      valueType: 'percent',
      value: 20,
      appliesTo: { scope: 'products', ids: ['p-acc-care'] },
      minimum: NO_MIN,
      audience: EVERYONE,
      combines: { products: true, order: true, shipping: true },
      startsAt: iso(now, -20),
      endsAt: iso(now, 10),
      status: 'paused',
      uses: 0,
      createdAt: iso(now, -21),
      tags: ['care'],
    },
    {
      id: 'd-bf-accessories',
      title: 'Black Friday — Zubehör −20 %',
      publicTitle: T('Black Friday: Zubehör −20 %', 'Black Friday: aksesorë −20%', 'Black Friday: accessories −20%'),
      kind: 'products',
      method: 'auto',
      valueType: 'percent',
      value: 20,
      appliesTo: { scope: 'products', ids: ACCESSORIES },
      minimum: NO_MIN,
      audience: EVERYONE,
      combines: { products: true, order: true, shipping: true },
      startsAt: iso(now, 21),
      endsAt: iso(now, 28),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -2),
      tags: ['black-friday', 'accessories'],
    },
    {
      id: 'd-summer15',
      title: 'Sommer — SUMMER15',
      publicTitle: T('Sommeraktion −15 %', 'Oferta e verës −15%', 'Summer sale −15%'),
      kind: 'order',
      method: 'code',
      code: 'SUMMER15',
      valueType: 'percent',
      value: 15,
      appliesTo: ALL_LINES,
      minimum: { type: 'amount', value: 100 },
      audience: EVERYONE,
      combines: { products: true, order: false, shipping: true },
      startsAt: iso(now, -75),
      endsAt: iso(now, -25),
      status: 'active',
      uses: 0,
      createdAt: iso(now, -76),
      tags: ['summer'],
    },
    {
      id: 'd-vip50',
      title: 'VIP-Kunden — 50 € ab 500 €',
      publicTitle: T('VIP-Rabatt 50 €', 'Zbritje VIP 50 €', 'VIP €50 off'),
      kind: 'order',
      method: 'code',
      code: 'VIP50',
      valueType: 'fixed',
      value: 50,
      appliesTo: ALL_LINES,
      minimum: { type: 'amount', value: 500 },
      audience: { type: 'segment', segmentId: 'seg-vip' },
      combines: { products: true, order: false, shipping: true },
      oncePerCustomer: true,
      startsAt: iso(now, 0),
      status: 'draft',
      uses: 0,
      createdAt: iso(now, -1),
      tags: ['vip'],
    },
  ];
}

/** Recount uses from the generated orders (cancelled orders excluded). */
export function countDiscountUses(discounts: Discount[], orders: Order[]): Discount[] {
  const uses = new Map<string, number>();
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const a of o.discounts ?? []) uses.set(a.id, (uses.get(a.id) ?? 0) + 1);
  }
  return discounts.map((d) => ({ ...d, uses: uses.get(d.id) ?? 0 }));
}

/* ================================================================== */
/* Offers (active / active / draft / scheduled)                        */
/* ================================================================== */
const ZERO = { visits: 0, ctaClicks: 0, codeUses: 0, orders: 0, revenue: 0, discountTotal: 0 };

export function buildOffers(now: Date, discounts: Discount[], orders: Order[]): Offer[] {
  const d = (id: string) => discounts.find((x) => x.id === id)!;
  const metrics = (discountId: string, visitsPerOrder: number, baseVisits: number) => {
    const list = orders.filter((o) => o.status !== 'cancelled' && o.discounts?.some((a) => a.id === discountId));
    const discountTotal = round2(list.reduce((s, o) => s + (o.discounts?.find((a) => a.id === discountId)?.amount ?? 0), 0));
    const visits = baseVisits + list.length * visitsPerOrder;
    return {
      visits,
      ctaClicks: Math.round(visits * 0.17),
      codeUses: list.filter((o) => o.discounts?.some((a) => a.id === discountId && a.code)).length,
      orders: list.length,
      revenue: round2(list.reduce((s, o) => s + o.total, 0)),
      discountTotal,
    };
  };
  return [
    {
      id: 'of-warm',
      slug: 'warm-evenings',
      name: T('Warme Abende — WARM15', 'Mbrëmje të ngrohta — WARM15', 'Warm evenings — WARM15'),
      description: T(
        '−15 % auf Heizstrahler und LED-Sets mit Code WARM15. Im Katalog-Banner, in der Hinweisleiste und im Promo-Block der Startseite.',
        '−15% për ngrohës dhe sete LED me kodin WARM15. Në banerin e katalogut, shiritin e njoftimeve dhe bllokun promo të ballinës.',
        '−15% on heaters and LED kits with code WARM15. In the catalogue banner, announcement bar and homepage promo block.',
      ),
      status: 'active',
      startsAt: d('d-warm15').startsAt,
      endsAt: d('d-warm15').endsAt,
      discountId: 'd-warm15',
      collectionId: 'col-warm',
      productIds: [],
      badge: T('−15 % mit WARM15', '−15% me WARM15', '−15% with WARM15'),
      image: '/images/misc/night.webp',
      landing: {
        title: T('Länger draußen, *auch im Winter*', 'Më gjatë jashtë, *edhe në dimër*', 'Longer outside, *even in winter*'),
        text: T(
          'Infrarot-Wärme und warmweißes LED-Licht für Pergola und Glasdach – mit Code WARM15 15 % günstiger.',
          'Ngrohje infra e kuqe dhe dritë LED e ngrohtë për pergolë dhe mbulojë xhami – me kodin WARM15 15% më lirë.',
          'Infrared warmth and warm-white LED light for pergola and glass roof – 15% off with code WARM15.',
        ),
      },
      placements: ['banner', 'announcement', 'home-block'],
      owner: 'st-drita',
      utm: 'utm_source=tersun&utm_medium=banner&utm_campaign=warm15',
      metrics: metrics('d-warm15', 38, 260),
      createdAt: iso(now, -25),
    },
    {
      id: 'of-welcome',
      slug: 'welcome-welcome10',
      name: T('Willkommen — WELCOME10', 'Mirë se vini — WELCOME10', 'Welcome — WELCOME10'),
      description: T(
        'Code WELCOME10: 10 % auf Bestellungen ab 100 € (nach Produktrabatten). Kombinierbar mit Produkt- und Versandrabatten.',
        'Kodi WELCOME10: 10% për porosi nga 100 € (pas zbritjeve të produkteve). Kombinohet me zbritje produktesh dhe dërgese.',
        'Code WELCOME10: 10% on orders from €100 (after product discounts). Combines with product and shipping discounts.',
      ),
      status: 'active',
      startsAt: d('d-welcome10').startsAt,
      discountId: 'd-welcome10',
      productIds: [],
      badge: T('−10 % mit WELCOME10', '−10% me WELCOME10', '−10% with WELCOME10'),
      image: '/images/misc/about.webp',
      landing: {
        title: T('Willkommen bei *TERSUN*', 'Mirë se vini te *TERSUN*', 'Welcome to *TERSUN*'),
        text: T(
          'Geben Sie bei Ihrer ersten Bestellung den Code WELCOME10 ein und sparen Sie 10 % ab 100 €.',
          'Në porosinë e parë shkruani kodin WELCOME10 dhe kurseni 10% nga 100 €.',
          'Enter code WELCOME10 on your first order and save 10% from €100.',
        ),
      },
      placements: ['banner', 'home-block'],
      owner: 'st-drita',
      utm: 'utm_source=tersun&utm_medium=landing&utm_campaign=welcome10',
      metrics: metrics('d-welcome10', 46, 900),
      createdAt: iso(now, -120),
    },
    {
      id: 'of-season-2027',
      slug: 'bioclimatic-season-2027',
      name: T('Bioclimatic Saison 2027', 'Sezoni Bioclimatic 2027', 'Bioclimatic season 2027'),
      description: T(
        'Redaktionelle Kampagne ohne Rabatt: Jetzt planen, im Frühling montieren. Startseite und Slider.',
        'Fushatë editoriale pa zbritje: planifikoni tani, montoni në pranverë. Ballina dhe slider.',
        'Editorial campaign without a discount: plan now, install in spring. Homepage and slider.',
      ),
      status: 'draft',
      startsAt: iso(now, 7),
      collectionId: 'col-signature',
      productIds: [],
      badge: T('Saison 2027', 'Sezoni 2027', 'Season 2027'),
      image: '/images/misc/builder-day.webp',
      landing: {
        title: T('Jetzt planen, *im Frühling genießen*', 'Planifikoni tani, *shijoni në pranverë*', 'Plan now, *enjoy in spring*'),
        text: T('Aufmaß und 3D-Planung im Winter – Montage zum Saisonstart.', 'Matje dhe planifikim 3D në dimër – montim në fillim të sezonit.', 'Survey and 3D planning in winter – installation for the start of the season.'),
      },
      placements: ['hero', 'home-block'],
      owner: 'st-ana',
      utm: 'utm_source=tersun&utm_medium=hero&utm_campaign=season-2027',
      metrics: { ...ZERO },
      createdAt: iso(now, -1),
    },
    {
      id: 'of-blackfriday',
      slug: 'black-friday-accessories',
      name: T('Black Friday — Zubehör −20 %', 'Black Friday — aksesorë −20%', 'Black Friday — accessories −20%'),
      description: T(
        'Geplant: sieben Tage −20 % auf das gesamte Zubehör. Slide und Leiste schalten sich zum Start automatisch ein.',
        'E planifikuar: shtatë ditë −20% për të gjithë aksesorët. Slide-i dhe shiriti aktivizohen vetë në fillim.',
        'Scheduled: seven days of −20% on all accessories. The slide and bar switch on by themselves at the start.',
      ),
      status: 'active',
      startsAt: d('d-bf-accessories').startsAt,
      endsAt: d('d-bf-accessories').endsAt,
      discountId: 'd-bf-accessories',
      productIds: ACCESSORIES,
      badge: T('Black Friday −20 %', 'Black Friday −20%', 'Black Friday −20%'),
      image: '/images/misc/view.webp',
      landing: {
        title: T('Black Friday: *Zubehör −20 %*', 'Black Friday: *aksesorë −20%*', 'Black Friday: *accessories −20%*'),
        text: T('LED, Heizstrahler, Sensoren und Steuerung – sieben Tage lang.', 'LED, ngrohës, sensorë dhe kontroll – për shtatë ditë.', 'LED, heaters, sensors and controls – for seven days.'),
      },
      placements: ['hero', 'announcement'],
      owner: 'st-drita',
      utm: 'utm_source=tersun&utm_medium=hero&utm_campaign=black-friday',
      metrics: { ...ZERO },
      createdAt: iso(now, -2),
    },
  ];
}

/* ================================================================== */
/* Placements — hero slides, catalogue banners, announcement bar       */
/* ================================================================== */
const HERO_ALT: Record<string, L10n> = {
  '/images/hero/bioclimatic.webp': T('Bioklimatische Pergola auf einer Terrasse', 'Pergolë bioklimatike në tarracë', 'Bioclimatic pergola on a terrace'),
  '/images/hero/slide.webp': T('Slide-Glaswände an einer Terrasse', 'Mure xhami Slide në tarracë', 'Slide glass walls on a terrace'),
  '/images/hero/awning.webp': T('Glasdach mit Aufdachmarkise', 'Mbulojë xhami me tendë sipër', 'Glass roof with over-glass awning'),
  '/images/hero/zip.webp': T('ZIP-Screens an einer Pergola', 'Perde Zip në pergolë', 'ZIP screens on a pergola'),
  '/images/hero/guillotine.webp': T('Guillotine-Glas an einer Lounge', 'Xham Guillotine në lounge', 'Guillotine glass on a lounge'),
};

export function buildPlacements(home: HomeSection[]): Placement[] {
  const hero = home.find((h) => h.type === 'hero');
  const slides = hero && hero.type === 'hero' ? hero.data.slides ?? [] : [];
  const base = { textAlign: 'left' as const, status: 'active' as const };
  const fromHero: Placement[] = slides.map((s, i) => ({
    ...base,
    id: `pl-${s.id}`,
    kind: 'slide',
    position: 'home-hero',
    name: `Hero — ${(s.title?.de ?? '').replace(/\*/g, '').slice(0, 40) || i + 1}`,
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    cta: s.primary,
    secondary: s.secondary,
    image: s.image,
    alt: HERO_ALT[s.image] ?? E(),
    overlay: 35,
    order: i + 1,
  }));
  const ann = (id: string, order: number, title: L10n, offerId?: string, href = ''): Placement => ({
    ...base,
    id,
    kind: 'announcement',
    position: 'bar',
    name: `Leiste — ${title.de.slice(0, 32)}`,
    eyebrow: E(),
    title,
    subtitle: E(),
    cta: { label: E(), href },
    image: '',
    alt: E(),
    overlay: 0,
    order,
    ...(offerId ? { offerId } : {}),
  });
  const n = slides.length;
  return [
    ...fromHero,
    {
      ...base,
      id: 'pl-bf',
      kind: 'slide',
      position: 'home-hero',
      name: 'Hero — Black Friday Zubehör',
      eyebrow: T('Black Friday', 'Black Friday', 'Black Friday'),
      title: T('Zubehör *−20 %*.', 'Aksesorë *−20%*.', 'Accessories *−20%*.'),
      subtitle: T('LED, Heizstrahler, Sensoren und Smart Home – nur sieben Tage.', 'LED, ngrohës, sensorë dhe smart home – vetëm shtatë ditë.', 'LED, heaters, sensors and smart home – seven days only.'),
      cta: { label: T('Zubehör ansehen', 'Shikoni aksesorët', 'Shop accessories'), href: '/shop/accessories' },
      secondary: { label: T('Beratung vor Ort', 'Konsultë në vend', 'On-site consultation'), href: '/#consultation' },
      image: '/images/misc/view.webp',
      alt: T('Terrasse mit Blick bei Abendlicht', 'Tarracë me pamje në dritën e mbrëmjes', 'Terrace with a view in evening light'),
      overlay: 45,
      offerId: 'of-blackfriday',
      order: n + 1,
    },
    {
      ...base,
      id: 'pl-season',
      kind: 'slide',
      position: 'home-hero',
      status: 'draft',
      name: 'Hero — Saison 2027 (Entwurf)',
      eyebrow: T('Saison 2027', 'Sezoni 2027', 'Season 2027'),
      title: T('Jetzt planen. *Im Frühling genießen*.', 'Planifikoni tani. *Shijoni në pranverë*.', 'Plan now. *Enjoy in spring*.'),
      subtitle: T('Aufmaß und 3D-Planung im Winter – Montage zum Saisonstart.', 'Matje dhe planifikim 3D në dimër – montim në fillim të sezonit.', 'Survey and 3D planning in winter – installation for the season start.'),
      cta: { label: T('In 3D gestalten', 'Krijoni në 3D', 'Design in 3D'), href: '/3d' },
      image: '/images/misc/builder-day.webp',
      alt: T('Pergola im 3D-Builder bei Tag', 'Pergolë në 3D Builder gjatë ditës', 'Pergola in the 3D Builder by day'),
      textAlign: 'center',
      overlay: 40,
      offerId: 'of-season-2027',
      order: n + 2,
    },
    {
      ...base,
      id: 'pl-b1',
      kind: 'banner',
      position: 'catalog',
      name: 'Katalog — WARM15',
      eyebrow: T('Wintersaison', 'Sezoni i dimrit', 'Winter season'),
      title: T('Heizstrahler & LED *−15 %*', 'Ngrohës & LED *−15%*', 'Heaters & LED *−15%*'),
      subtitle: T('Mit Code WARM15 im Warenkorb.', 'Me kodin WARM15 në shportë.', 'With code WARM15 in the cart.'),
      cta: { label: T('Zubehör ansehen', 'Shikoni aksesorët', 'Shop accessories'), href: '/shop/accessories' },
      image: '/images/misc/night.webp',
      alt: T('Pergola mit LED-Licht bei Nacht', 'Pergolë me dritë LED natën', 'Pergola with LED light at night'),
      overlay: 30,
      offerId: 'of-warm',
      order: 1,
    },
    {
      ...base,
      id: 'pl-b2',
      kind: 'banner',
      position: 'catalog',
      name: 'Katalog — WELCOME10',
      eyebrow: T('Erste Bestellung', 'Porosia e parë', 'First order'),
      title: T('−10 % mit *WELCOME10*', '−10% me *WELCOME10*', '−10% with *WELCOME10*'),
      subtitle: T('Ab 100 € – kombinierbar mit kostenlosem Versand.', 'Nga 100 € – kombinohet me dërgesë falas.', 'From €100 – combines with free shipping.'),
      cta: { label: T('Jetzt einkaufen', 'Blini tani', 'Shop now'), href: '/shop' },
      image: '/images/misc/about.webp',
      alt: T('TERSUN Showroom', 'Showroom TERSUN', 'TERSUN showroom'),
      overlay: 40,
      offerId: 'of-welcome',
      order: 2,
    },
    ann('pl-a1', 1, T('Kostenlose Beratung vor Ort · Montage in Europa & USA', 'Konsultë falas në vend · Montim në Evropë & SHBA', 'Free on-site consultation · Installation in Europe & USA'), undefined, '/#consultation'),
    ann('pl-a2', 2, T('Kostenloser Versand für Zubehör ab 250 €', 'Dërgesë falas për aksesorë mbi 250 €', 'Free shipping on accessories over €250'), undefined, '/page/delivery-installation'),
    ann('pl-a3', 3, T('Wintersaison: Heizstrahler & LED −15 % mit WARM15', 'Sezoni i dimrit: ngrohës & LED −15% me WARM15', 'Winter season: heaters & LED −15% with WARM15'), 'of-warm', '/shop/accessories'),
    ann('pl-a4', 4, T('Black Friday: Zubehör −20 % – nur sieben Tage', 'Black Friday: aksesorë −20% – vetëm shtatë ditë', 'Black Friday: accessories −20% – seven days only'), 'of-blackfriday', '/shop/accessories'),
  ];
}

/* ================================================================== */
/* Staff, services, bookings                                           */
/* ================================================================== */
export const STAFF: Staff[] = [
  { id: 'st-gent', name: 'Gent Berisha', email: 'gent@tersun.com', role: 'owner', color: '#1a1a1a', active: true, phone: '+383 44 120 456', title: T('Geschäftsführer', 'Drejtor', 'Managing director') },
  { id: 'st-arta', name: 'Arta Krasniqi', email: 'arta@tersun.com', role: 'manager', color: '#6b5b95', active: true, phone: '+383 44 210 334', title: T('Vertriebsleiterin', 'Menaxhere shitjesh', 'Sales manager') },
  { id: 'st-drita', name: 'Drita Gashi', email: 'drita@tersun.com', role: 'marketing', color: '#b08d57', active: true, title: T('Marketing', 'Marketing', 'Marketing') },
  { id: 'st-milica', name: 'Mirlinda Hoxha', email: 'info@tersun.com', role: 'reception', color: '#2f7d6d', active: true, phone: '+383 38 600 200', title: T('Showroom-Empfang', 'Recepsioni i showroom-it', 'Showroom reception') },
  { id: 'st-blerim', name: 'Blerim Kelmendi', email: 'blerim@tersun.com', role: 'orders', color: '#3d5a80', active: true, phone: '+383 49 330 118', title: T('Techniker — Aufmaß & Montage', 'Teknik — matje & montim', 'Technician — survey & installation') },
  { id: 'st-markus', name: 'Markus Steiner', email: 'markus@tersun.com', role: 'orders', color: '#8a5a44', active: true, phone: '+49 151 2044 7810', title: T('Montageleiter DACH', 'Udhëheqës montimi DACH', 'Installation lead DACH') },
  { id: 'st-ana', name: 'Anna Hofmann', email: 'anna@tersun.com', role: 'editor', color: '#9c6644', active: true, title: T('Content-Redakteurin', 'Redaktore përmbajtjeje', 'Content editor') },
];

export const SERVICES: Service[] = [
  {
    id: 'sv-mjerenje',
    name: T('Aufmaß & Beratung vor Ort', 'Matje & konsultë në vend', 'On-site survey & consultation'),
    description: T('Ein Techniker misst die Terrasse aus und berät zu System, Statik und Optionen.', 'Tekniku mat tarracën dhe këshillon për sistemin, statikën dhe opsionet.', 'A technician surveys the terrace and advises on system, structure and options.'),
    durationMin: 90,
    capacity: 1,
    price: 0,
    color: '#3d5a80',
    staffIds: ['st-blerim', 'st-gent', 'st-markus'],
    location: 'onsite',
  },
  {
    id: 'sv-konsultacija',
    name: T('Beratung im Showroom', 'Konsultë në showroom', 'Showroom consultation'),
    description: T('Profile, Farben, Glas und Tuch am Muster – mit Angebot.', 'Profile, ngjyra, xham dhe pëlhurë në mostër – me ofertë.', 'Profiles, colours, glass and fabric on samples – with a quote.'),
    durationMin: 60,
    capacity: 2,
    color: '#2f7d6d',
    staffIds: ['st-arta', 'st-milica', 'st-gent'],
    location: LOC_SHOWROOM,
  },
  {
    id: 'sv-3d',
    name: T('3D-Planung (Videocall)', 'Planifikim 3D (video-thirrje)', '3D planning (video call)'),
    description: T('Wir planen Ihr System gemeinsam im 3D-Builder.', 'E planifikojmë sistemin tuaj së bashku në 3D Builder.', 'We plan your system together in the 3D Builder.'),
    durationMin: 45,
    capacity: 1,
    price: 0,
    color: '#6b5b95',
    staffIds: ['st-arta', 'st-gent'],
    location: LOC_SHOWROOM,
  },
  {
    id: 'sv-montaza',
    name: T('Montage', 'Montim', 'Installation'),
    description: T('Montagetag für Pergola, Glasdach, Glaswände oder Screens.', 'Ditë montimi për pergolë, mbulojë xhami, mure xhami ose perde.', 'Installation day for pergola, glass roof, glass walls or screens.'),
    durationMin: 480,
    capacity: 1,
    color: '#b08d57',
    staffIds: ['st-blerim', 'st-markus'],
    location: 'onsite',
  },
  {
    id: 'sv-service',
    name: T('Wartung & Service', 'Mirëmbajtje & servis', 'Maintenance visit'),
    description: T('Motoren, Dichtungen, Entwässerung und Lamellen prüfen und einstellen.', 'Kontroll dhe rregullim i motorëve, guarnicioneve, kullimit dhe lamelave.', 'Check and adjust motors, seals, drainage and louvres.'),
    durationMin: 90,
    capacity: 1,
    price: 149,
    color: '#8a5a44',
    staffIds: ['st-blerim', 'st-markus'],
    location: 'onsite',
  },
  {
    id: 'sv-winter',
    name: T('Winter-Check', 'Kontrolli i dimrit', 'Winter check'),
    description: T('Schneelast, Rinnen, Sensoren und Tuch vor dem Winter prüfen.', 'Kontroll i ngarkesës së borës, ulluqeve, sensorëve dhe pëlhurës para dimrit.', 'Check snow load, gutters, sensors and fabric before winter.'),
    durationMin: 60,
    capacity: 1,
    price: 89,
    color: '#4a6d8c',
    staffIds: ['st-blerim'],
    location: 'onsite',
  },
];

/** [name, phone, city, address] */
const BOOKING_PEOPLE: [string, string, string, string][] = [
  ['Arben Krasniqi', '+383 44 441 902', 'Prishtina', 'Rr. Fehmi Agani 24'],
  ['Sabine Weber', '+49 160 7715 330', 'München', 'Leopoldstraße 118'],
  ['Valon Morina', '+383 45 220 517', 'Prizren', 'Rr. Remzi Ademaj 9'],
  ['Elira Hoxha', '+355 69 908 1142', 'Tirana', 'Rruga Myslym Shyri 41'],
  ['Florian Gruber', '+43 664 510 2760', 'Wien', 'Mariahilfer Straße 72'],
  ['Besnik Gjonaj', '+383 49 304 681', 'Peja', 'Rr. Mbretëresha Teutë 15'],
  ['Lindita Berisha', '+383 44 655 209', 'Prishtina', 'Bulevardi Bill Clinton 30'],
  ['Thomas Keller', '+49 171 4147 993', 'Stuttgart', 'Königstraße 56'],
  ['Driton Shala', '+389 70 822 460', 'Skopje', 'Bulevar Ilinden 88'],
  ['Andrea Meier', '+41 79 390 8450', 'Zürich', 'Seefeldstrasse 102'],
  ['Erion Dervishi', '+355 68 674 1520', 'Durrës', 'Rruga Taulantia 7'],
  ['Mimoza Rexhepi', '+383 44 251 738', 'Ferizaj', 'Rr. Dëshmorët e Kombit 33'],
  ['Stefan Huber', '+43 676 118 5060', 'Graz', 'Herrengasse 14'],
  ['Kujtim Bytyqi', '+383 49 963 027', 'Gjakova', 'Rr. Nëna Terezë 61'],
  ['Julia Schneider', '+49 151 4376 1150', 'Frankfurt', 'Bockenheimer Landstraße 22'],
  ['Agron Kelmendi', '+383 45 582 394', 'Peja', 'Rr. Eliot Engel 4'],
];

/** [day offset from this Monday, hour, minute, service, staff, note] — no overlaps per staff member. */
const SLOTS: [number, number, number, string, string, string][] = [
  [0, 9, 0, 'sv-konsultacija', 'st-arta', 'Bioclimatic oder Glasdach – Vergleich am Muster'],
  [0, 10, 0, 'sv-mjerenje', 'st-markus', 'Glasdach Wand 6 × 3,5 m mit LED'],
  [1, 8, 0, 'sv-montaza', 'st-blerim', 'Montage Glasdach Wand 5 × 3 m'],
  [1, 10, 0, 'sv-mjerenje', 'st-gent', 'Perde Zip për 4 dritare'],
  [2, 9, 0, 'sv-konsultacija', 'st-milica', 'Balkon schließen – Guillotine'],
  [2, 11, 0, 'sv-3d', 'st-arta', 'Bioclimatic Wall – 3D-Planung'],
  [2, 8, 0, 'sv-montaza', 'st-markus', 'Montage Slide Premium, 5 Paneele'],
  [3, 9, 0, 'sv-service', 'st-blerim', 'Wartung Bioclimatic – Lamellen einstellen'],
  [3, 14, 0, 'sv-mjerenje', 'st-gent', 'Aufdachmarkise über bestehendem Glasdach'],
  [4, 10, 0, 'sv-winter', 'st-blerim', 'Winter-Check Glasdach + Markise'],
  [7, 9, 0, 'sv-mjerenje', 'st-markus', 'Glasdach L-Form um die Hausecke'],
  [7, 11, 0, 'sv-konsultacija', 'st-arta', 'Slide oder Guillotine für die Loggia?'],
  [8, 8, 0, 'sv-montaza', 'st-blerim', 'Montage Bioclimatic Freestanding 4 × 4 m'],
  [9, 10, 0, 'sv-3d', 'st-arta', 'Pool-Terrasse – 3D-Planung'],
  [10, 12, 0, 'sv-mjerenje', 'st-gent', 'Bioclimatic Double për hotel'],
  [11, 8, 0, 'sv-montaza', 'st-markus', 'Montage ZIP-Screens, 6 Stück'],
];

function mondayOf(now: Date) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return d;
}

/**
 * Bookings for this and next week. Scheduled inquiries are linked to future bookings of the matching
 * service (measurement → on-site survey, others → showroom consultation) and get the same date.
 */
export function buildBookings(now: Date, inquiries: Inquiry[]): { bookings: Booking[]; inquiries: Inquiry[] } {
  const monday = mondayOf(now);
  const bookings: Booking[] = SLOTS.map(([day, h, m, serviceId, staffId, note], i) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + day);
    start.setHours(h, m, 0, 0);
    const service = SERVICES.find((s) => s.id === serviceId)!;
    const end = start.getTime() + service.durationMin * 60000;
    const [customerName, phone, city, address] = BOOKING_PEOPLE[i % BOOKING_PEOPLE.length];
    const past = end < now.getTime();
    const status: Booking['status'] = past ? (i === 4 ? 'noshow' : i === 5 ? 'cancelled' : 'done') : i === 13 || i === 14 ? 'pending' : 'confirmed';
    return {
      id: `bk-${101 + i}`,
      serviceId,
      staffId,
      customerName,
      phone,
      city,
      start: start.toISOString(),
      durationMin: service.durationMin,
      status,
      note,
      location: service.location ?? LOC_SHOWROOM,
      ...(service.location === 'onsite' ? { address } : {}),
      createdAt: new Date(start.getTime() - (3 + (i % 5)) * DAY).toISOString(),
    };
  });

  const out = inquiries.map((q) => ({ ...q }));
  const free = (svc: string) => bookings.filter((b) => b.serviceId === svc && !b.inquiryId && new Date(b.start).getTime() > now.getTime() && b.status !== 'cancelled');
  for (const q of out.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (q.status !== 'scheduled') continue;
    const slot = free(q.type === 'measurement' ? 'sv-mjerenje' : 'sv-konsultacija')[0];
    if (!slot) {
      q.status = 'contacted';
      q.scheduledAt = undefined;
      continue;
    }
    slot.inquiryId = q.id;
    slot.customerName = q.name;
    slot.phone = q.phone;
    slot.email = q.email;
    slot.city = q.city;
    slot.status = 'confirmed';
    q.scheduledAt = slot.start;
  }
  return { bookings, inquiries: out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

/* ================================================================== */
/* Inquiries — CMS v2 fields + two extra (B2B quote, shipping question) */
/* ================================================================== */
export function enrichInquiries(now: Date, inquiries: Inquiry[]): Inquiry[] {
  const out: Inquiry[] = inquiries.map((q, i) => ({
    ...q,
    source: q.type === 'measurement' ? 'measurement' : q.type === 'quote' ? 'quote' : 'web-form',
    assignee: q.status === 'new' ? undefined : q.type === 'measurement' ? (i % 2 ? 'st-gent' : 'st-blerim') : q.type === 'quote' ? 'st-arta' : 'st-milica',
    tags: [q.service ? q.service.toLowerCase().replace(/\s+/g, '-') : 'general', ...(q.type === 'quote' ? ['quote'] : [])],
  }));
  out.push(
    {
      id: 'inq_120',
      createdAt: iso(now, -4, -3),
      type: 'quote',
      name: 'Erion Hoxha',
      company: 'Hotel Adriatik sh.p.k.',
      phone: '+355 69 552 3011',
      email: 'projects.adriatik@example.com',
      city: 'Durrës',
      service: 'Bioclimatic',
      productId: 'p-bio-modular',
      message: 'Ofertë për pergolë Bioclimatic Modular mbi tarracën e pishinës, rreth 18 × 6 m, me perde Zip dhe ngrohës. Hoteli ka 42 dhoma, montimi para sezonit 2027.',
      status: 'contacted',
      seen: true,
      source: 'phone',
      assignee: 'st-arta',
      tags: ['b2b', 'bioclimatic', 'hotel'],
      followUpAt: iso(now, 2),
    },
    {
      id: 'inq_121',
      createdAt: iso(now, 0, -5),
      type: 'contact',
      name: 'Katrin Bauer',
      phone: '+43 699 1419 2070',
      email: 'katrin.bauer@example.com',
      city: 'Salzburg',
      message: 'Liefern Sie das LED-Lichtset und den Windsensor auch nach Österreich? Wie lange dauert der Versand?',
      status: 'new',
      seen: false,
      source: 'web-form',
      tags: ['shipping'],
    },
  );
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ================================================================== */
/* Segments                                                            */
/* ================================================================== */
export const SEGMENTS: Segment[] = [
  {
    id: 'seg-vip',
    name: T('VIP-Kunden', 'Klientë VIP', 'VIP customers'),
    description: T('Mehr als 5.000 € ausgegeben.', 'Kanë shpenzuar mbi 5.000 €.', 'Spent more than €5,000.'),
    match: 'all',
    rules: [{ field: 'spent', op: 'gt', value: '5000' }],
  },
  {
    id: 'seg-returning',
    name: T('Stammkunden', 'Klientë që kthehen', 'Returning customers'),
    description: T('Mehr als eine Bestellung.', 'Më shumë se një porosi.', 'More than one order.'),
    match: 'all',
    rules: [{ field: 'orders', op: 'gt', value: '1' }],
  },
  {
    id: 'seg-dach',
    name: T('DACH-Markt', 'Tregu DACH', 'DACH market'),
    description: T('Kunden aus Deutschland, Österreich und der Schweiz.', 'Klientë nga Gjermania, Austria dhe Zvicra.', 'Customers from Germany, Austria and Switzerland.'),
    match: 'any',
    rules: ['München', 'Stuttgart', 'Frankfurt', 'Düsseldorf', 'Wien', 'Graz', 'Salzburg', 'Zürich', 'Basel', 'Luzern'].map((c) => ({ field: 'city' as const, op: 'eq' as const, value: c })),
  },
  {
    id: 'seg-albanian',
    name: T('Albanischsprachige Kunden', 'Klientë në shqip', 'Albanian-speaking customers'),
    description: T('Auf Albanisch bestellt — für Kampagnen auf SQ.', 'Kanë porositur në shqip — për fushata në SQ.', 'Ordered in Albanian — for SQ campaigns.'),
    match: 'all',
    rules: [{ field: 'lang', op: 'eq', value: 'sq' }],
  },
];

/* ================================================================== */
/* Purchasing & inventory movements                                    */
/* ================================================================== */
export function buildPurchaseOrders(now: Date): PurchaseOrder[] {
  return [
    {
      id: 'po-014',
      number: 'PO-2026-014',
      supplier: 'Becker-Antriebe GmbH',
      location: LOC_WAREHOUSE,
      status: 'partial',
      lines: [
        { productId: 'p-acc-remote', ordered: 60, received: 60, rejected: 0, cost: 38 },
        { productId: 'p-acc-sensor', ordered: 40, received: 24, rejected: 0, cost: 84 },
        { productId: 'p-acc-smart', ordered: 20, received: 18, rejected: 2, cost: 162 },
      ],
      reference: 'BA-557210',
      note: 'Restliche 16 Sensoren folgen mit der nächsten Lieferung. 2 Hubs abgelehnt – Gehäuse beschädigt.',
      expectedAt: iso(now, 3),
      createdAt: iso(now, -12),
    },
    {
      id: 'po-015',
      number: 'PO-2026-015',
      supplier: 'Samsung LED Europe',
      location: LOC_WAREHOUSE,
      status: 'sent',
      lines: [{ productId: 'p-acc-led', ordered: 40, received: 0, rejected: 0, cost: 176 }],
      reference: 'SLE-2026/0932',
      note: 'LED-Sets für die Wintersaison und Black Friday.',
      expectedAt: iso(now, 9),
      createdAt: iso(now, -3),
    },
    {
      id: 'po-016',
      number: 'PO-2026-016',
      supplier: 'Sattler SUN-TEX GmbH',
      location: LOC_WAREHOUSE,
      status: 'draft',
      lines: [
        { productId: 'p-zip', ordered: 24, received: 0, rejected: 0, cost: 210 },
        { productId: 'p-awning', ordered: 10, received: 0, rejected: 0, cost: 480 },
      ],
      note: 'Tuch für ZIP-Screens und Aufdachmarkisen – Anthrazit und Steingrau.',
      createdAt: iso(now, -1),
    },
    {
      id: 'po-013',
      number: 'PO-2026-013',
      supplier: 'AluProfil sh.p.k.',
      location: LOC_WAREHOUSE,
      status: 'closed',
      lines: [
        { productId: 'p-bio-free', ordered: 6, received: 6, rejected: 0, cost: 3150 },
        { productId: 'p-glass-wall', ordered: 8, received: 8, rejected: 0, cost: 1840 },
      ],
      reference: 'AP-2026-311',
      note: 'Aluminiumprofile RAL 7016, pulverbeschichtet.',
      createdAt: iso(now, -26),
    },
  ];
}

export function buildMovements(now: Date, orders: Order[], returns: ReturnRequest[]): InventoryMovement[] {
  const mv = (id: string, productId: string, delta: number, reason: InventoryMovement['reason'], days: number, by: string, note?: string, ref?: string): InventoryMovement => ({
    id,
    productId,
    delta,
    reason,
    at: iso(now, days),
    by,
    ...(note ? { note } : {}),
    ...(ref ? { ref } : {}),
  });
  const list: InventoryMovement[] = [
    mv('mv-1', 'p-acc-heater', -1, 'damaged', -2, 'st-blerim', 'Heizstab beim Entladen gebrochen – abgeschrieben'),
    mv('mv-2', 'p-acc-smart', -1, 'damaged', -4, 'st-blerim', 'Gehäuse zerkratzt – Ausstellungsstück im Showroom'),
    mv('mv-3', 'p-acc-remote', 60, 'received', -5, 'st-arta', 'Becker-Antriebe GmbH', 'PO-2026-014'),
    mv('mv-4', 'p-acc-sensor', 24, 'received', -5, 'st-arta', 'Becker-Antriebe GmbH', 'PO-2026-014'),
    mv('mv-5', 'p-acc-smart', 18, 'received', -5, 'st-arta', 'Becker-Antriebe GmbH — 2 abgelehnt', 'PO-2026-014'),
    mv('mv-6', 'p-acc-care', -3, 'count', -7, 'st-arta', 'Inventur – Differenz im Lager'),
    mv('mv-7', 'p-acc-led', 2, 'count', -7, 'st-arta', 'Inventur – 2 Sets gefunden'),
    mv('mv-9', 'p-acc-remote', -4, 'correction', -11, 'st-gent', 'Vorführgeräte für den Showroom'),
  ];
  // restocked returns
  for (const r of returns) {
    if (!r.restocked) continue;
    const rec = r.timeline.find((t) => t.status === 'received');
    for (const l of r.lines) list.push({ id: `mv-${r.id}-${l.productId}`, productId: l.productId, delta: l.qty, reason: 'return', at: rec?.at ?? r.createdAt, by: rec?.by ?? 'st-blerim', note: 'Unbeschädigt zurückgenommen', ref: r.number });
  }
  // the most recent web orders as 'sale' movements
  let n = 10;
  for (const o of orders.slice(0, 6)) {
    for (const l of o.items) {
      if (!l.productId) continue;
      const days = (new Date(o.createdAt).getTime() - now.getTime()) / DAY;
      list.push({ id: `mv-${n++}`, productId: l.productId, delta: -l.qty, reason: 'sale', at: iso(now, days), by: 'web', ref: o.number });
    }
  }
  return list.sort((a, b) => b.at.localeCompare(a.at));
}

/* ================================================================== */
/* Draft orders, returns, quotes                                       */
/* ================================================================== */
export function buildDrafts(now: Date, products: Product[]): DraftOrder[] {
  const opts = (id: string) => {
    const p = products.find((x) => x.id === id);
    return p ? defaultOptions(p) : {};
  };
  const key = (id: string, o: Record<string, string>, inst: boolean) =>
    `${id}|${Object.keys(o)
      .sort()
      .map((k) => `${k}=${o[k]}`)
      .join('&')}|${inst ? 'i' : ''}`;
  const heater = opts('p-acc-heater');
  const remote = opts('p-acc-remote');
  const led = { ...opts('p-acc-led'), length: '10' };
  const zip = { ...opts('p-zip'), fabric: 'stone' };
  return [
    {
      id: 'dr-1001',
      number: 'D-1001',
      createdAt: iso(now, -1, -2),
      customer: { firstName: 'Fatmir', lastName: 'Bytyqi', company: 'Restorant Liqeni sh.p.k.', pib: '811458327', email: 'fatmir.bytyqi@example.com', phone: '+383 44 412 778', city: 'Prizren', address: 'Rr. Shën Flori 14' },
      items: [
        { key: key('p-acc-heater', heater, true), productId: 'p-acc-heater', qty: 8, options: heater, installation: true },
        { key: key('p-acc-remote', remote, false), productId: 'p-acc-remote', qty: 2, options: remote, installation: false },
      ],
      customLines: [{ title: 'Elektroanschluss je Heizstrahler', price: 35, qty: 8 }],
      discountCodes: ['WELCOME10'],
      delivery: 'delivery',
      payment: 'bank',
      note: 'Restaurant-Terrasse unter Bioclimatic Double – Montage vor dem Winter. Zahlung per Vorkasse.',
      tags: ['b2b', 'prizren'],
      status: 'open',
      createdBy: 'st-arta',
      lang: 'sq',
    },
    {
      id: 'dr-1002',
      number: 'D-1002',
      createdAt: iso(now, -4, -1),
      customer: { firstName: 'Arben', lastName: 'Gjonaj', email: 'arben.gjonaj@example.com', phone: '+383 49 220 517', city: 'Peja', address: 'Rr. Mbretëresha Teutë 41' },
      items: [{ key: key('p-acc-led', led, true), productId: 'p-acc-led', qty: 2, options: led, installation: true }],
      customLines: [{ title: 'Anfahrt Peja', price: 40, qty: 1 }],
      discountCodes: [],
      delivery: 'delivery',
      payment: 'cod',
      note: 'Rechnung per E-Mail gesendet. LED-Nachrüstung für bestehendes Glasdach.',
      tags: ['led', 'retrofit'],
      status: 'invoice_sent',
      createdBy: 'st-gent',
      lang: 'sq',
    },
    {
      id: 'dr-1003',
      number: 'D-1003',
      createdAt: iso(now, -2, -4),
      customer: { firstName: 'Michael', lastName: 'Gruber', email: 'michael.gruber@example.com', phone: '+43 664 221 4089', city: 'Wien', address: 'Landstraßer Hauptstraße 51' },
      items: [{ key: key('p-zip', zip, true), productId: 'p-zip', qty: 3, options: zip, installation: true }],
      customLines: [{ title: 'Anfahrt & Montage Wien (pauschal)', price: 450, qty: 1 }],
      discountCodes: [],
      delivery: 'delivery',
      payment: 'bank',
      note: 'Nach Aufmaß: 3 ZIP-Screens 3,6 × 2,6 m an der bestehenden Pergola.',
      tags: ['zip', 'dach'],
      status: 'open',
      createdBy: 'st-markus',
      lang: 'de',
    },
  ];
}

/** Two returns (accessories only) from real generated orders; the refunded one is also recorded on its order. */
export function buildReturns(now: Date, orders: Order[]): { returns: ReturnRequest[]; orders: Order[] } {
  const age = (o: Order) => (now.getTime() - new Date(o.createdAt).getTime()) / DAY;
  const pieceLine = (o: Order) => o.items.find((l) => !!l.productId && ACCESSORIES.includes(l.productId) && (l.unit === 'kom' || l.unit === 'set'));
  const old = orders.find((o) => o.status === 'completed' && age(o) > 20 && pieceLine(o));
  const recent = orders.find((o) => o !== old && (o.status === 'shipped' || o.status === 'installation' || o.status === 'completed') && age(o) < 15 && pieceLine(o));
  const returns: ReturnRequest[] = [];
  let out = orders;
  if (old) {
    const line = pieceLine(old)!;
    const lines = [{ productId: line.productId, qty: 1 }];
    const amount = refundForLines(old, lines);
    const t0 = new Date(Math.min(now.getTime() - 12 * DAY, new Date(old.createdAt).getTime() + 6 * DAY));
    const at = (h: number) => new Date(t0.getTime() + h * 3600000).toISOString();
    returns.push({
      id: 'rt-1001',
      number: 'RT-1001',
      orderId: old.id,
      lines,
      reason: 'Transportschaden — Kunde wünscht Erstattung',
      status: 'refunded',
      refundAmount: amount,
      restock: true,
      restocked: true,
      createdAt: at(0),
      timeline: [
        { at: at(0), status: 'requested', by: 'st-milica', note: 'Telefonisch gemeldet, Fotos per WhatsApp' },
        { at: at(5), status: 'approved', by: 'st-arta' },
        { at: at(50), status: 'received', by: 'st-blerim', note: 'Abgeholt, Ware wieder auf Lager' },
        { at: at(54), status: 'refunded', by: 'st-arta' },
      ],
    });
    out = out.map((o) =>
      o.id === old.id
        ? {
            ...o,
            refunds: [{ id: 'rf-1001', at: at(54), amount, lineIds: [String(o.items.indexOf(line))], note: 'RT-1001', by: 'st-arta' }],
            payment: { ...o.payment, status: 'paid', refunded: amount },
            timeline: [...o.timeline, { at: at(54), status: 'payment', note: `Refund ${amount.toFixed(2)} € (RT-1001)`, by: 'admin' }],
          }
        : o,
    );
  }
  if (recent) {
    const line = pieceLine(recent)!;
    const lines = [{ productId: line.productId, qty: 1 }];
    const at = iso(now, 0, -20);
    returns.push({
      id: 'rt-1002',
      number: 'RT-1002',
      orderId: recent.id,
      lines,
      reason: 'Falscher Artikel bestellt — Umtausch oder Erstattung gewünscht',
      status: 'requested',
      refundAmount: refundForLines(recent, lines),
      restock: true,
      createdAt: at,
      timeline: [{ at, status: 'requested', by: 'web', note: 'Anfrage per E-Mail mit Bestellnummer' }],
    });
  }
  return { returns, orders: out };
}

export function buildQuotes(now: Date): Quote[] {
  const terms = T(
    'Preise inkl. MwSt. Anzahlung 40 %, Rest nach Montage. Lieferzeit 4–6 Wochen ab Auftragsbestätigung.',
    'Çmimet përfshijnë TVSH-në. Avans 40%, pjesa tjetër pas montimit. Afati 4–6 javë nga konfirmimi.',
    'Prices include VAT. 40% deposit, balance after installation. Lead time 4–6 weeks from confirmation.',
  );
  return [
    {
      id: 'q-031',
      number: 'Q-2026-031',
      inquiryId: 'inq_120',
      customer: { name: 'Erion Hoxha', company: 'Hotel Adriatik sh.p.k.', email: 'projects.adriatik@example.com', phone: '+355 69 552 3011' },
      lines: [
        { productId: 'p-bio-modular', title: 'Bioclimatic Modular — 3 Felder, 18 × 6 m, RAL 7016', qty: 1, price: 46800 },
        { productId: 'p-zip', title: 'ZIP-Screen 4,5 × 2,8 m, Sattler Anthrazit', qty: 6, price: 1490 },
        { productId: 'p-acc-heater', title: 'Infrarot-Heizstrahler 2000 W', qty: 6, price: 389 },
        { productId: 'p-acc-led', title: 'LED-Lichtset Warmweiß 15 m', qty: 3, price: 680 },
        { title: 'Fundamente, Montage & Inbetriebnahme', qty: 1, price: 4200 },
      ],
      validUntil: iso(now, 14),
      terms,
      version: 2,
      status: 'sent',
      createdAt: iso(now, -3),
      owner: 'st-arta',
    },
    {
      id: 'q-032',
      number: 'Q-2026-032',
      customer: { name: 'Reto Baumann', company: 'Gasthaus Seeblick AG', email: 'reto.baumann@example.com', phone: '+41 79 300 4152' },
      lines: [
        { productId: 'p-bio-double', title: 'Bioclimatic Double — 10 × 4 m, RAL 9007, Smart Home', qty: 1, price: 18900 },
        { productId: 'p-guillotine', title: 'Guillotine Premium 4 × 2,5 m, Isolierglas', qty: 3, price: 5800 },
        { productId: 'p-acc-sensor', title: 'Wind- & Regensensor', qty: 1, price: 189 },
        { title: 'Montage Schweiz inkl. Anfahrt', qty: 1, price: 3600 },
      ],
      validUntil: iso(now, 30),
      terms,
      version: 1,
      status: 'draft',
      createdAt: iso(now, -1),
      owner: 'st-gent',
    },
    {
      id: 'q-029',
      number: 'Q-2026-029',
      customer: { name: 'Thomas Keller', company: '', email: 'thomas.keller@example.com', phone: '+49 171 4147 993' },
      lines: [
        { productId: 'p-slide-wintergarden', title: 'Wintergarten Slide — 5 × 3,5 m, 4+14+4 Isolierglas', qty: 1, price: 14600 },
        { productId: 'p-acc-heater', title: 'Infrarot-Heizstrahler 2000 W', qty: 2, price: 389 },
        { title: 'Montage Stuttgart inkl. Anfahrt', qty: 1, price: 1900 },
      ],
      validUntil: iso(now, 6),
      terms,
      version: 2,
      status: 'accepted',
      createdAt: iso(now, -18),
      owner: 'st-markus',
    },
    {
      id: 'q-027',
      number: 'Q-2026-027',
      customer: { name: 'Besnik Krasniqi', company: '', email: 'besnik.krasniqi@example.com', phone: '+383 44 318 270' },
      lines: [
        { productId: 'p-awning-combo', title: 'Glasdach + Markise Set — 6 × 4 m, Sattler Sand', qty: 1, price: 9800 },
        { productId: 'p-zip', title: 'ZIP-Screen 3 × 2,5 m', qty: 2, price: 1190 },
      ],
      validUntil: iso(now, -5),
      terms,
      version: 1,
      status: 'declined',
      createdAt: iso(now, -35),
      owner: 'st-arta',
    },
  ];
}

/* ================================================================== */
/* Menus & content models                                              */
/* ================================================================== */
export function buildMenus(): Menu[] {
  const cat = (id: string, label: L10n) => ({ id: `mi-${id}`, label, type: 'category' as const, target: id });
  const url = (id: string, label: L10n, target: string, children?: Menu['items']) => ({ id, label, type: 'url' as const, target, ...(children ? { children } : {}) });
  const page = (id: string, label: L10n) => ({ id: `mi-${id}`, label, type: 'page' as const, target: id });
  const categories = () => [
    cat('cat-bioclimatic', T('Bioklimatische Pergola', 'Sistemi Bioklimatik', 'Bioclimatic System')),
    cat('cat-glass-roof', T('Glasdach', 'Mbulojë Xhami', 'Glass Roof')),
    cat('cat-awning', T('Aufdachmarkise', 'Tendë mbi Xham', 'Over-Glass Awning')),
    cat('cat-guillotine', T('Guillotine Premium', 'Guillotine Premium', 'Guillotine Premium')),
    cat('cat-slide', T('Slide Premium', 'Slide Premium', 'Slide Premium')),
    cat('cat-zip', T('ZIP-Screen', 'Perde Zip', 'ZIP Screen')),
    cat('cat-accessories', T('Zubehör', 'Aksesorë', 'Accessories')),
  ];
  return [
    {
      id: 'menu-main',
      handle: 'main',
      title: 'Hauptmenü',
      items: [
        url('mi-products', T('Systeme', 'Sistemet', 'Systems'), '/shop', [...categories(), url('mi-sale', T('Angebote', 'Oferta', 'Offers'), '/shop?sale=1')]),
        url('mi-3d', T('3D-Builder', '3D Builder', '3D Builder'), '/3d'),
        url('mi-services', T('Service', 'Shërbimet', 'Services'), '/services'),
        url('mi-projects', T('Projekte', 'Projektet', 'Projects'), '/projects'),
        url('mi-about', T('Über uns', 'Rreth nesh', 'About'), '/about'),
        url('mi-journal', T('Journal', 'Journal', 'Journal'), '/journal'),
        url('mi-contact', T('Kontakt', 'Kontakt', 'Contact'), '/contact'),
      ],
    },
    {
      id: 'menu-footer',
      handle: 'footer',
      title: 'Fußzeile',
      items: [
        url('mi-f-shop', T('Systeme', 'Sistemet', 'Systems'), '/shop', [...categories(), url('mi-f-sale', T('Angebote', 'Oferta', 'Offers'), '/shop?sale=1')]),
        url('mi-f-company', T('Unternehmen', 'Kompania', 'Company'), '/about', [
          url('mi-f-about', T('Über uns', 'Rreth nesh', 'About'), '/about'),
          url('mi-f-services', T('Service', 'Shërbimet', 'Services'), '/services'),
          url('mi-f-projects', T('Projekte', 'Projektet', 'Projects'), '/projects'),
          url('mi-f-3d', T('3D-Builder', '3D Builder', '3D Builder'), '/3d'),
          url('mi-f-journal', T('Journal', 'Journal', 'Journal'), '/journal'),
          url('mi-f-contact', T('Kontakt', 'Kontakt', 'Contact'), '/contact'),
        ]),
        url('mi-f-help', T('Kundenservice', 'Për klientët', 'Customer care'), '', [
          page('pg-delivery', T('Lieferung & Montage', 'Dërgesa & montimi', 'Delivery & installation')),
          page('pg-terms', T('AGB', 'Kushtet', 'Terms')),
          page('pg-returns', T('Rückgabe & Reklamation', 'Kthimet & reklamimet', 'Returns & complaints')),
          page('pg-privacy', T('Datenschutz', 'Privatësia', 'Privacy policy')),
        ]),
      ],
    },
  ];
}

export function buildContentModels(projects: Project[], home: HomeSection[], locations: number): ContentModel[] {
  const faq = home.find((h) => h.type === 'faq');
  const services = home.find((h) => h.type === 'services');
  return [
    {
      id: 'cm-projects',
      name: T('Projekte', 'Projektet', 'Projects'),
      source: 'projects',
      fields: [
        { key: 'title', label: T('Titel', 'Titulli', 'Title'), type: 'text' },
        { key: 'location', label: T('Ort', 'Vendndodhja', 'Location'), type: 'text' },
        { key: 'year', label: T('Jahr', 'Viti', 'Year'), type: 'number' },
        { key: 'tags', label: T('Systeme', 'Sistemet', 'Systems'), type: 'choice' },
        { key: 'summary', label: T('Beschreibung', 'Përshkrimi', 'Summary'), type: 'text' },
        { key: 'image', label: T('Foto', 'Fotografia', 'Photo'), type: 'image' },
        { key: 'featured', label: T('Hervorgehoben', 'E veçuar', 'Featured'), type: 'boolean' },
      ],
      entries: projects.length,
    },
    {
      id: 'cm-faq',
      name: T('Häufige Fragen', 'Pyetje të shpeshta', 'FAQ'),
      source: 'home.faq',
      fields: [
        { key: 'q', label: T('Frage', 'Pyetja', 'Question'), type: 'text' },
        { key: 'a', label: T('Antwort', 'Përgjigjja', 'Answer'), type: 'text' },
      ],
      entries: faq && faq.type === 'faq' ? faq.data.items.length : 0,
    },
    {
      id: 'cm-services',
      name: T('Leistungen', 'Shërbimet', 'Services'),
      source: 'home.services',
      fields: [
        { key: 'image', label: T('Foto', 'Fotografia', 'Photo'), type: 'image' },
        { key: 'title', label: T('Titel', 'Titulli', 'Title'), type: 'text' },
        { key: 'text', label: T('Beschreibung', 'Përshkrimi', 'Description'), type: 'text' },
        { key: 'service', label: T('Termin (Leistung)', 'Termini (shërbimi)', 'Booking service'), type: 'reference' },
      ],
      entries: services && services.type === 'services' ? services.data.items.length : 0,
    },
    {
      id: 'cm-locations',
      name: T('Standorte', 'Lokacionet', 'Locations'),
      source: 'settings.locations',
      fields: [
        { key: 'name', label: T('Name', 'Emri', 'Name'), type: 'text' },
        { key: 'address', label: T('Adresse', 'Adresa', 'Address'), type: 'text' },
        { key: 'city', label: T('Stadt', 'Qyteti', 'City'), type: 'text' },
        { key: 'pickup', label: T('Abholung', 'Marrje në vend', 'Pickup'), type: 'boolean' },
        { key: 'map', label: T('Karte', 'Harta', 'Map'), type: 'link' },
      ],
      entries: locations,
    },
  ];
}

/* ================================================================== */
/* Homepage history & audit log                                        */
/* ================================================================== */
export function buildHomeHistory(now: Date, home: HomeSection[]): HomeVersion[] {
  const v1 = structuredClone(home).map((s) => (s.type === 'instagram' ? { ...s, enabled: false } : s));
  const v2 = structuredClone(home)
    .filter((s) => s.type !== 'promo')
    .map((s) => (s.type === 'blog' ? { ...s, enabled: false } : s));
  return [
    { at: iso(now, -6, -4), by: 'st-ana', sections: v1 },
    { at: iso(now, -21, -2), by: 'st-drita', sections: v2 },
  ];
}

export function buildAudit(now: Date, orders: Order[]): AuditEntry[] {
  const o = (i: number) => orders[Math.min(i, orders.length - 1)];
  const a = (id: number, hours: number, actor: string, action: AuditEntry['action'], object: AuditEntry['object'], objectId: string, detail?: string): AuditEntry => ({
    id: `au-${id}`,
    at: new Date(now.getTime() - hours * 3600000).toISOString(),
    actor,
    action,
    object,
    objectId,
    ...(detail ? { detail } : {}),
  });
  const list: AuditEntry[] = [
    a(1, 0.4, 'st-gent', 'login', 'staff', 'st-gent', 'CMS-Anmeldung'),
    a(2, 1.2, 'st-arta', 'status', 'order', o(3).id, `${o(3).number}: new → confirmed`),
    a(3, 3, 'st-milica', 'assign', 'inquiry', 'inq_120', 'Erion Hoxha → Arta Krasniqi'),
    a(4, 20, 'st-arta', 'create', 'draft', 'dr-1001', 'D-1001'),
    a(5, 26, 'st-blerim', 'fulfil', 'order', o(8).id, o(8).number),
    a(6, 30, 'st-milica', 'create', 'booking', 'bk-104', 'Aufmaß — Dienstag 10:00'),
    a(7, 47, 'st-drita', 'create', 'offer', 'of-blackfriday', 'Black Friday — Zubehör −20 %'),
    a(8, 48, 'st-drita', 'create', 'discount', 'd-bf-accessories', 'Black Friday — Zubehör −20 %'),
    a(9, 50, 'st-drita', 'create', 'placement', 'pl-bf', 'Hero — Black Friday Zubehör'),
    a(10, 70, 'st-gent', 'archive', 'product', ARCHIVED_PRODUCT, 'Guillotine Balkon'),
    a(11, 74, 'st-arta', 'send', 'quote', 'q-031', 'Q-2026-031 v2'),
    a(12, 96, 'st-blerim', 'adjust', 'inventory', 'p-acc-smart', 'TS-AC-705 −1 (damaged)'),
    a(13, 98, 'st-gent', 'send', 'draft', 'dr-1002', 'D-1002 — Rechnung'),
    a(14, 120, 'st-arta', 'receive', 'purchaseOrder', 'po-014', 'PO-2026-014: +102'),
    a(15, 146, 'st-ana', 'publish', 'home', 'home', 'Startseite — Promo WARM15'),
    a(16, 150, 'st-ana', 'update', 'page', 'pg-delivery', 'Lieferung & Montage'),
    a(17, 200, 'st-gent', 'update', 'settings', 'settings', 'shippingZones'),
    a(18, 574, 'st-gent', 'publish', 'offer', 'of-warm', 'Warme Abende — WARM15'),
    a(19, 590, 'st-drita', 'create', 'discount', 'd-warm15', 'Winter — Heizstrahler & LED −15 % (WARM15)'),
    a(20, 600, 'st-drita', 'create', 'collection', 'col-warm', 'Warme Abende'),
    a(21, 230, 'st-arta', 'refund', 'return', 'rt-1001', 'RT-1001'),
    a(22, 240, 'st-markus', 'status', 'quote', 'q-029', 'Q-2026-029: accepted'),
  ];
  return list;
}
