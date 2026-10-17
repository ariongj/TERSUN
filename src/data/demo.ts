// Realistic demo activity (orders + inquiries) so the CMS dashboard looks alive.
// Deterministic for a given seed, always relative to "now".
import type { CartItem, Collection, Customer, Discount, Inquiry, Lang, Order, OrderEvent, OrderStatus, PaymentMethod, Product, Settings } from '@/lib/types';
import { priceCart, defaultOptions, packsForArea } from '@/lib/pricing';
import { lt } from '@/i18n';
import { collectionIdsFor } from '@/lib/collections';
import { pick, rng, slugify, weighted } from '@/lib/utils';

type Country = 'XK' | 'AL' | 'MK' | 'DE' | 'AT' | 'CH' | 'US';

const SQ_FIRST = ['Arben', 'Drita', 'Besnik', 'Lindita', 'Driton', 'Valon', 'Arta', 'Blerina', 'Fatmir', 'Mimoza', 'Agron', 'Elira', 'Ardit', 'Albina', 'Kujtim', 'Teuta', 'Granit', 'Vjosa', 'Ilir', 'Shqipe', 'Dardan', 'Erza', 'Leart', 'Rinor', 'Era'];
const SQ_LAST = ['Gjonaj', 'Krasniqi', 'Berisha', 'Hoxha', 'Gashi', 'Shala', 'Morina', 'Kelmendi', 'Bytyqi', 'Rexhepi', 'Thaçi', 'Dervishi', 'Hasani', 'Kastrati', 'Mustafa', 'Leka', 'Dushku', 'Rama', 'Sopi', 'Zeqiri'];
const DE_FIRST = ['Thomas', 'Sabine', 'Michael', 'Julia', 'Stefan', 'Andrea', 'Markus', 'Katrin', 'Florian', 'Claudia', 'Lukas', 'Anna', 'Reto', 'Simone', 'Matthias', 'Nina', 'Jonas', 'Petra'];
const DE_LAST = ['Müller', 'Schmidt', 'Weber', 'Huber', 'Gruber', 'Keller', 'Meier', 'Bauer', 'Hofmann', 'Fischer', 'Steiner', 'Brunner', 'Wagner', 'Baumann', 'Schneider', 'Moser'];
const US_FIRST = ['James', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Laura'];
const US_LAST = ['Johnson', 'Miller', 'Davis', 'Anderson', 'Thompson', 'Walker', 'Collins', 'Parker'];

const COUNTRY: Record<Country, { phone: string[]; groups: [number, number]; streets: string[] }> = {
  XK: { phone: ['+383 44', '+383 45', '+383 49'], groups: [3, 3], streets: ['Rr. Nëna Terezë', 'Rr. Adem Jashari', 'Rr. Skënderbeu', 'Rr. Fehmi Agani', 'Bulevardi Bill Clinton', 'Rr. Luan Haradinaj', 'Rr. Agim Ramadani', 'Rr. UÇK'] },
  AL: { phone: ['+355 67', '+355 68', '+355 69'], groups: [3, 4], streets: ['Rruga Skënderbeu', 'Rruga Ismail Qemali', 'Rruga Naim Frashëri', 'Bulevardi Dëshmorët e Kombit', 'Rruga Myslym Shyri', 'Rruga Taulantia'] },
  MK: { phone: ['+389 70', '+389 71', '+389 75'], groups: [3, 3], streets: ['Bulevar Ilinden', 'Ulica Makedonija', 'Rr. Ilindenit', 'Bulevar Partizanski Odredi'] },
  DE: { phone: ['+49 151', '+49 160', '+49 171'], groups: [4, 4], streets: ['Hauptstraße', 'Bahnhofstraße', 'Lindenstraße', 'Gartenstraße', 'Schillerstraße', 'Goethestraße', 'Leopoldstraße', 'Königstraße'] },
  AT: { phone: ['+43 664', '+43 676', '+43 699'], groups: [3, 4], streets: ['Hauptstraße', 'Mariahilfer Straße', 'Schulgasse', 'Lindengasse', 'Landstraßer Hauptstraße'] },
  CH: { phone: ['+41 76', '+41 78', '+41 79'], groups: [3, 4], streets: ['Bahnhofstrasse', 'Seefeldstrasse', 'Dorfstrasse', 'Seestrasse', 'Kirchweg'] },
  US: { phone: ['+1 212', '+1 917', '+1 646'], groups: [3, 4], streets: ['Broadway', 'Park Avenue', 'Arthur Avenue', 'Main Street', 'Lexington Avenue'] },
};

const CITIES: (readonly [string, number, Country])[] = [
  ['Prishtina', 20, 'XK'], ['Prizren', 7, 'XK'], ['Peja', 5, 'XK'], ['Gjakova', 4, 'XK'], ['Ferizaj', 4, 'XK'], ['Gjilan', 3, 'XK'], ['Mitrovica', 2, 'XK'],
  ['Tirana', 9, 'AL'], ['Durrës', 5, 'AL'], ['Vlora', 2, 'AL'], ['Shkodra', 2, 'AL'],
  ['Skopje', 4, 'MK'], ['Tetovo', 3, 'MK'],
  ['München', 6, 'DE'], ['Stuttgart', 5, 'DE'], ['Frankfurt', 3, 'DE'], ['Düsseldorf', 2, 'DE'],
  ['Zürich', 4, 'CH'], ['Basel', 2, 'CH'], ['Luzern', 1, 'CH'],
  ['Wien', 4, 'AT'], ['Graz', 1, 'AT'], ['Salzburg', 1, 'AT'],
  ['New York', 2, 'US'], ['Chicago', 1, 'US'], ['Detroit', 1, 'US'],
];
const CITY_COUNTRY = new Map(CITIES.map(([c, , k]) => [c, k]));
const CITY_WEIGHTS = CITIES.map(([c, w]) => [c, w] as const);

function customer(r: () => number, forcedCity?: string): Customer {
  const city = forcedCity ?? weighted(CITY_WEIGHTS, r);
  const country = CITY_COUNTRY.get(city) ?? 'XK';
  // Albanian names at home and in the diaspora; local names in DACH and the USA
  const albanian = country === 'XK' || country === 'AL' || country === 'MK' || r() < (country === 'US' ? 0.35 : 0.45);
  const firstName = albanian ? pick(SQ_FIRST, r) : country === 'US' ? pick(US_FIRST, r) : pick(DE_FIRST, r);
  const lastName = albanian ? pick(SQ_LAST, r) : country === 'US' ? pick(US_LAST, r) : pick(DE_LAST, r);
  const c = COUNTRY[country];
  const digits = (n: number) => String(Math.floor(r() * 9 * 10 ** (n - 1)) + 10 ** (n - 1));
  const street = pick(c.streets, r);
  const no = Math.floor(r() * 120) + 1;
  return {
    firstName,
    lastName,
    email: `${slugify(firstName)}.${slugify(lastName)}@example.com`,
    phone: `${pick(c.phone, r)} ${digits(c.groups[0])} ${digits(c.groups[1])}`,
    city,
    address: country === 'US' ? `${no} ${street}` : `${street} ${no}`,
  };
}

/** Shop language: Albanian at home, German in DACH (diaspora often in Albanian), English in the USA. */
function langFor(c: Customer, r: () => number): Lang {
  const country = CITY_COUNTRY.get(c.city) ?? 'XK';
  const albanian = SQ_FIRST.includes(c.firstName);
  if (country === 'XK' || country === 'AL' || country === 'MK') return r() < 0.88 ? 'sq' : 'en';
  if (country === 'US') return albanian && r() < 0.4 ? 'sq' : 'en';
  return albanian && r() < 0.45 ? 'sq' : 'de';
}

function lineFor(p: Product, r: () => number): CartItem {
  const options = defaultOptions(p);
  for (const o of p.options) options[o.id] = pick(o.values, r).id;
  let qty = 1;
  if (p.unit === 'm2' && p.packSize) qty = packsForArea(12 + Math.floor(r() * 80), p.packSize);
  else if (p.categoryId === 'cat-zip') qty = 1 + Math.floor(r() * 4);
  else if (p.id === 'p-acc-heater') qty = 1 + Math.floor(r() * 3);
  else if (p.categoryId === 'cat-accessories') qty = r() < 0.8 ? 1 : 2;
  else if (p.categoryId === 'cat-slide' && !p.id.includes('wintergarden')) qty = 1 + Math.floor(r() * 2);
  else qty = 1;
  const installation = !!p.installation?.available && (p.quoteOnly || r() < 0.45);
  return { key: '', productId: p.id, qty, options, installation };
}

function statusFor(ageDays: number, r: () => number): OrderStatus {
  if (ageDays < 0.6) return r() < 0.75 ? 'new' : 'confirmed';
  if (ageDays < 3) return weighted([['confirmed', 4], ['processing', 4], ['new', 1]] as const, r);
  if (ageDays < 9) return weighted([['processing', 3], ['shipped', 3], ['installation', 3], ['completed', 2], ['cancelled', 0.4]] as const, r);
  if (ageDays < 20) return weighted([['shipped', 2], ['installation', 2], ['completed', 6], ['cancelled', 0.6]] as const, r);
  return weighted([['completed', 15], ['cancelled', 1]] as const, r);
}

const FLOW: OrderStatus[] = ['new', 'confirmed', 'processing', 'shipped', 'installation', 'completed'];

/**
 * Orders over the last 75 days. Most are accessories bought online; about one in ten is a system
 * (pergola, glass roof, glass walls, screens) converted from an accepted quote. Every cart goes through
 * the real pricing + discount engine with the order date as "now", so automatic rules only apply inside
 * their window.
 */
export function generateOrders(products: Product[], settings: Settings, discounts: Discount[], collections: Collection[], now = new Date(), seed = 42): Order[] {
  const r = rng(seed);
  const sellable = products.filter((p) => !p.quoteOnly && p.status === 'active');
  const systems = products.filter((p) => p.quoteOnly && p.status === 'active');
  const addOns = sellable.filter((p) => p.installation?.available);
  const weights = sellable.map((p) => [p, Math.sqrt(p.sold + 5)] as const);
  const systemWeights = systems.map((p) => [p, Math.sqrt(p.sold + 5)] as const);
  const prefix = settings.orderPrefix || 'TS-';
  const orders: Order[] = [];
  const past: Customer[] = [];
  let seq = 1001;
  const DAYS = 75;
  for (let day = DAYS; day >= 0; day--) {
    // gentle growth trend + weekly rhythm (quieter Sundays)
    const date = new Date(now.getTime() - day * 86400000);
    const dow = date.getDay();
    const base = 0.35 + ((DAYS - day) / DAYS) * 0.75;
    const mean = dow === 0 ? base * 0.3 : dow === 6 ? base * 0.8 : base;
    let count = 0;
    let x = r();
    let p = Math.exp(-mean);
    let cdf = p;
    while (x > cdf && count < 5) {
      count++;
      p = (p * mean) / count;
      cdf += p;
    }
    if (day === 0) count = Math.max(count, 3);
    for (let i = 0; i < count; i++) {
      const hour = 8 + Math.floor(r() * 12);
      const created = new Date(date);
      created.setHours(hour, Math.floor(r() * 60), Math.floor(r() * 60), 0);
      if (created > now) created.setTime(now.getTime() - (i + 1) * 47 * 60000);
      const ageDays = (now.getTime() - created.getTime()) / 86400000;

      // about one order in ten is a system converted from a quote (never in the last few hours)
      const isSystem = systems.length > 0 && ageDays > 1 && r() < 0.1;
      const cart: CartItem[] = [];
      const used = new Set<string>();
      if (isSystem) {
        const main = weighted(systemWeights, r);
        used.add(main.id);
        cart.push(lineFor(main, r));
        // pergolas and glass roofs often come with screens or extras
        if (r() < 0.45 && main.categoryId !== 'cat-zip') {
          const zip = systems.find((s) => s.id === 'p-zip');
          if (zip) cart.push(lineFor(zip, r));
        }
        if (r() < 0.6 && addOns.length) {
          const extra = pick(addOns, r);
          cart.push({ ...lineFor(extra, r), installation: true });
        }
      } else {
        const nLines = weighted([[1, 5], [2, 3], [3, 1.5], [4, 0.5]] as const, r);
        for (let k = 0; k < nLines; k++) {
          const prod = weighted(weights, r);
          if (used.has(prod.id)) continue;
          used.add(prod.id);
          cart.push(lineFor(prod, r));
        }
        // shoppers following the "buy X get Y" promo add the free item themselves (manual mode)
        for (const d of discounts) {
          const b = d.bxgy;
          if (d.kind !== 'bxgy' || !b || d.method !== 'auto' || b.getScope !== 'products' || new Date(d.startsAt) > created) continue;
          const xQty = cart.filter((c) => b.buyScope === 'products' && b.buyIds.includes(c.productId)).reduce((n, c) => n + c.qty, 0);
          const y = products.find((p) => p.id === b.getIds[0]);
          if (y && xQty >= b.buyQty && !cart.some((c) => c.productId === y.id) && r() < 0.7) cart.push({ key: '', productId: y.id, qty: b.getQty * Math.min(b.maxUses || 1, Math.floor(xQty / b.buyQty)), options: defaultOptions(y), installation: false });
        }
      }
      // about one order in six comes from a returning customer
      const cust = past.length > 4 && r() < 0.16 ? { ...pick(past, r) } : customer(r);
      past.push(cust);
      const delivery = !isSystem && r() < 0.15 ? 'pickup' : 'delivery';
      const lang: Lang = langFor(cust, r);
      // codes people typed: the welcome code, plus the seasonal code that was live on that day
      const x = r();
      const seasonal = discounts.find((d) => d.method === 'code' && d.id !== 'd-welcome10' && d.status === 'active' && new Date(d.startsAt) <= created && (!d.endsAt || new Date(d.endsAt) > created));
      // a product-scoped seasonal code (e.g. WARM15) is typed far more often when the cart holds eligible items
      const eligible = !!seasonal && seasonal.appliesTo.scope !== 'all' && cart.some((c) => {
        const prod = products.find((p) => p.id === c.productId);
        if (!prod) return false;
        return seasonal.appliesTo.scope === 'collections' ? collectionIdsFor(prod, collections).some((id) => seasonal.appliesTo.ids.includes(id)) : seasonal.appliesTo.ids.includes(prod.id);
      });
      const couponCode = isSystem ? null : x < 0.12 ? 'WELCOME10' : seasonal && x < (eligible ? 0.65 : 0.28) ? seasonal.code! : null;
      const totals = priceCart(cart, products, settings, { lang, couponCode, discounts, collections, delivery, city: cust.city, now: created });
      const payMethod: PaymentMethod = isSystem ? 'bank' : weighted([['card', 5], ['bank', 2.5], ['cod', 2]] as const, r);
      const status = statusFor(ageDays, r);

      const idx = FLOW.indexOf(status);
      const timeline: OrderEvent[] = [{ at: created.toISOString(), status: 'new', by: isSystem ? 'admin' : 'web' }];
      if (status === 'cancelled') {
        timeline.push({ at: new Date(created.getTime() + 5 * 3600000).toISOString(), status: 'cancelled', note: 'Kunde hat telefonisch storniert', by: 'admin' });
      } else {
        for (let s = 1; s <= idx; s++) {
          const at = new Date(created.getTime() + s * Math.min(ageDays / (idx + 1), 2.2) * 86400000);
          timeline.push({ at: at.toISOString(), status: FLOW[s], by: 'admin' });
        }
      }
      const paid = payMethod === 'card' ? true : payMethod === 'bank' ? idx >= 1 : status === 'completed';
      orders.push({
        id: `o_${seq}`,
        number: `${prefix}${seq}`,
        createdAt: created.toISOString(),
        status,
        customer: cust,
        items: totals.lines.map((l) => ({
          productId: l.product.id,
          sku: l.product.sku,
          name: lt(l.product.name, lang),
          image: l.product.images[0] ?? '',
          unit: l.product.unit,
          packSize: l.product.packSize,
          qty: l.item.qty,
          options: l.optionsLabel,
          unitPrice: l.unitPrice,
          installation: l.item.installation,
          installationPrice: l.installationUnitPrice,
          lineTotal: l.lineTotal,
          discount: l.discount,
          allocations: l.allocations,
        })),
        delivery: { method: delivery, fee: totals.shipping },
        payment: { method: payMethod, status: status === 'cancelled' ? (paid && payMethod === 'card' ? 'refunded' : 'pending') : paid ? 'paid' : 'pending' },
        coupon: totals.coupon ? { code: totals.coupon.code, discount: totals.discount } : null,
        discounts: totals.applied,
        shippingBeforeDiscount: totals.shippingBeforeDiscount,
        subtotal: totals.subtotal,
        installationTotal: totals.installationTotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        vat: totals.vat,
        lang,
        timeline,
        seen: ageDays > 0.6,
        demo: true,
        ...(isSystem ? { tags: ['system', 'quote'], internalNote: 'Aus angenommenem Angebot übernommen — Anzahlung 40 %, Rest nach Montage.' } : {}),
        ...(status === 'shipped' || status === 'installation' || status === 'completed'
          ? { fulfillment: { shippedAt: timeline.find((e) => e.status === 'shipped' || e.status === 'installation')?.at ?? created.toISOString(), ...(status === 'completed' ? { deliveredAt: timeline[timeline.length - 1].at } : {}) } }
          : {}),
      });
      seq++;
    }
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const INQ_MSG: { type: Inquiry['type']; city: string; service?: string; productId?: string; message: string }[] = [
  { type: 'measurement', city: 'Prishtina', service: 'Bioclimatic', message: 'Përshëndetje, dua një pergolë bioklimatike për tarracën, rreth 5 × 4 m. Kur mund të vini për matje? Jam në shtëpi pas orës 16:00.' },
  { type: 'measurement', city: 'München', service: 'Glass roof', message: 'Wir planen ein Glasdach an der Hauswand, ca. 6 × 3,5 m, mit LED. Wann wäre ein Aufmaßtermin möglich?' },
  { type: 'quote', city: 'Zürich', service: 'Bioclimatic', productId: 'p-bio-double', message: 'Bitte um Offerte für eine Bioclimatic Double, ca. 10 × 4 m, für unsere Restaurant-Terrasse – mit Heizstrahlern und ZIP-Screens an zwei Seiten.' },
  { type: 'measurement', city: 'Tirana', service: 'ZIP', message: 'Kam nevojë për perde Zip për 4 dritare dhe derën e ballkonit. Apartament në katin e 7-të.' },
  { type: 'contact', city: 'Peja', message: 'A e keni telekomandën me 5 kanale në stok? Kam Bioclimatic me LED dhe perde Zip.' },
  { type: 'measurement', city: 'Wien', service: 'Guillotine', message: 'Wir möchten unseren Balkon mit Guillotine-Glas schließen, ca. 3 m breit. Bitte um Rückruf.' },
  { type: 'quote', city: 'Stuttgart', service: 'Slide', productId: 'p-slide-wintergarden', message: 'Wintergarten mit Slide-Wänden an drei Seiten, Grundfläche ca. 5 × 3,5 m. Bitte Angebot mit Isolierglas.' },
  { type: 'measurement', city: 'Prizren', service: 'Awning', message: 'Kemi mbulojë xhami dhe në verë është shumë nxehtë. Dua tendë mbi xham me motor, rreth 6 m.' },
  { type: 'contact', city: 'New York', message: 'Do you ship and install in the US? We have a house in Westchester and would like a bioclimatic pergola, about 20 × 13 ft.' },
  { type: 'measurement', city: 'Skopje', service: 'Glass roof', message: 'Mbulojë xhami në formë L rreth qoshes së shtëpisë. A punoni edhe në Shkup?' },
  { type: 'quote', city: 'Durrës', service: 'Guillotine', productId: 'p-guillotine', message: 'Ofertë për 6 panele Guillotine për restorantin në plazh, 4 × 2,5 m secili, me xham termopan.' },
  { type: 'measurement', city: 'Basel', service: 'Bioclimatic', message: 'Freistehende Pergola am Pool, ca. 4 × 4 m, mit Wind- und Regensensor. Braucht es dafür eine Baubewilligung?' },
];

export function generateInquiries(now = new Date(), seed = 7): Inquiry[] {
  const r = rng(seed);
  return INQ_MSG.map((m, i) => {
    const ageHours = i === 0 ? 2.5 : i === 1 ? 9 : Math.floor(14 + r() * 28 * 24);
    const created = new Date(now.getTime() - ageHours * 3600000);
    const c = customer(r, m.city);
    const ageDays = ageHours / 24;
    const status: Inquiry['status'] = ageDays < 1 ? 'new' : ageDays < 4 ? (r() < 0.5 ? 'contacted' : 'scheduled') : ageDays < 12 ? (r() < 0.6 ? 'scheduled' : 'done') : 'done';
    const scheduledAt = status === 'scheduled' ? new Date(now.getTime() + (1 + Math.floor(r() * 5)) * 86400000).toISOString() : undefined;
    return {
      id: `inq_${100 + i}`,
      createdAt: created.toISOString(),
      type: m.type,
      name: `${c.firstName} ${c.lastName}`,
      phone: c.phone,
      email: c.email,
      city: c.city,
      service: m.service,
      productId: m.productId,
      message: m.message,
      preferredDate: m.type === 'measurement' ? new Date(now.getTime() + (2 + i) * 86400000).toISOString().slice(0, 10) : undefined,
      status,
      seen: status !== 'new',
      scheduledAt,
    } satisfies Inquiry;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
