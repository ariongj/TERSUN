import type { CmsPage, Coupon, HomeSection, L10n, Post, Project, Settings } from '@/lib/types';

const T = (de: string, sq: string, en: string): L10n => ({ de, sq, en });

/* ------------------------------------------------------------------ */
/* Settings (placeholders are editable in Admin → Settings)            */
/* ------------------------------------------------------------------ */
export const DEFAULT_SETTINGS: Settings = {
  companyName: 'TERSUN',
  legalName: 'TERSUN L.L.C.',
  tagline: T('Beyond Outdoor Living', 'Beyond Outdoor Living', 'Beyond Outdoor Living'),
  about: T(
    'TERSUN entwickelt und montiert Premium-Systeme für das Leben im Freien – bioklimatische Pergolen, Glasdächer, Markisen, Glasschiebesysteme und ZIP-Screens. Aus Aluminium, mit deutschen Motoren und Stoffen, für Kunden in Europa und den USA.',
    'TERSUN projekton dhe monton sisteme premium për jetën në natyrë – pergola bioklimatike, mbuloja xhami, tenda, sisteme xhami rrëshqitëse dhe perde Zip. Nga alumini, me motorë dhe pëlhura gjermane, për klientë në Evropë dhe SHBA.',
    'TERSUN designs and installs premium outdoor-living systems – bioclimatic pergolas, glass roofs, awnings, sliding glass and ZIP screens. In aluminium, with German motors and fabrics, for clients across Europe and the USA.',
  ),
  email: 'info@tersun.com',
  phone: '+383 44 000 000',
  phone2: '+49 000 0000000',
  whatsapp: '+383 44 000 000',
  address: 'Rr. Agim Ramadani',
  city: 'Prishtina',
  mapUrl: 'https://maps.google.com/?q=Prishtina',
  hours: T('Mo–Fr 08–18 · Sa 09–14', 'Hën–Pre 08–18 · Sht 09–14', 'Mon–Fri 8am–6pm · Sat 9am–2pm'),
  pib: '81XXXXXX',
  pdv: '33XXXXXXX',
  bankName: 'Raiffeisen Bank Kosovo',
  bankAccount: 'XK05 XXXX XXXX XXXX XXXX',
  instagram: 'tersun',
  facebook: 'tersun',
  currency: 'EUR',
  vatRate: 18,
  freeShippingThreshold: 250,
  shippingZones: [
    { id: 'z1', name: 'Kosova', cities: ['Prishtina', 'Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica'], fee: 0, days: '1–2' },
    { id: 'z2', name: 'Shqipëri & Maqedoni e Veriut', cities: ['Tirana', 'Durrës', 'Vlora', 'Shkodra', 'Skopje', 'Tetovo'], fee: 15, days: '2–4' },
    { id: 'z3', name: 'EU / DACH', cities: ['München', 'Stuttgart', 'Frankfurt', 'Berlin', 'Wien', 'Zürich', 'Milano'], fee: 35, days: '4–7' },
  ],
  pickupAddress: 'Rr. Agim Ramadani, Prishtina',
  payments: { cod: true, bank: true, card: true },
  languages: { de: true, sq: true, en: true },
  announcements: [
    T('Kostenlose Beratung vor Ort · Montage in Europa & USA', 'Konsultë falas në vend · Montim në Evropë & SHBA', 'Free on-site consultation · Installation in Europe & USA'),
    T('Gestalten Sie Ihre Terrasse im 3D-Builder', 'Krijoni tarracën tuaj në 3D Builder', 'Design your terrace in the 3D Builder'),
    T('Becker-Motoren · Sattler-Tuch · bis 5 Jahre Garantie', 'Motorë Becker · Shtof Sattler · deri 5 vite garanci', 'Becker motors · Sattler fabric · up to 5-year warranty'),
  ],
  brandColor: '#8c6a3a',
  demoBanner: true,
  seo: {
    title: 'TERSUN — Beyond Outdoor Living',
    description: 'Bioclimatic pergolas, glass roofs, over-glass awnings, Guillotine and Slide glass, ZIP screens. Design yours in 3D.',
  },
  adminEmail: 'admin@tersun.com',

  /* ---- CMS v2 ---- */
  timezone: 'Europe/Belgrade',
  orderPrefix: 'TS-',
  locations: [
    { id: 'loc-pr', name: 'Showroom Prishtina', address: 'Rr. Agim Ramadani', city: 'Prishtina', pickup: true, isDefault: true },
    { id: 'loc-wh', name: 'Warehouse Fushë Kosovë', address: 'Zona Industriale', city: 'Fushë Kosovë', pickup: false, isDefault: false },
  ],
  notifications: [
    { id: 'nt-order', event: 'order_placed', enabled: true, recipients: 'customer', subject: T('Wir haben Ihre Bestellung {number} erhalten', 'E morëm porosinë tuaj {number}', 'We received your order {number}') },
    { id: 'nt-confirm', event: 'order_confirmed', enabled: true, recipients: 'customer', subject: T('Bestellung {number} ist bestätigt', 'Porosia {number} u konfirmua', 'Order {number} is confirmed') },
    { id: 'nt-payment', event: 'payment_received', enabled: true, recipients: 'customer', subject: T('Zahlung für {number} erhalten', 'Pagesa për porosinë {number} u regjistrua', 'Payment for order {number} received') },
    { id: 'nt-shipped', event: 'order_shipped', enabled: true, recipients: 'customer', subject: T('Bestellung {number} ist unterwegs', 'Porosia {number} është në rrugë', 'Order {number} is on its way') },
    { id: 'nt-return', event: 'return_requested', enabled: true, recipients: 'staff', subject: T('Neue Rücksendung {number}', 'Kërkesë e re për kthim {number}', 'New return request {number}') },
    { id: 'nt-refund', event: 'return_refunded', enabled: true, recipients: 'customer', subject: T('Erstattung für {number}', 'Rimbursimi për {number}', 'Refund for {number}') },
    { id: 'nt-contact', event: 'contact_received', enabled: true, recipients: 'customer', subject: T('Danke — wir melden uns heute', 'Faleminderit — do t’ju kontaktojmë sot', 'Thank you — we’ll get back to you today') },
    { id: 'nt-booking', event: 'booking_confirmed', enabled: true, recipients: 'customer', subject: T('Ihr Termin am {date} ist bestätigt', 'Termini {date} u konfirmua', 'Your appointment on {date} is confirmed') },
    { id: 'nt-reminder', event: 'booking_reminder', enabled: false, recipients: 'customer', subject: T('Erinnerung: Termin morgen um {time}', 'Kujtesë: termini nesër në {time}', 'Reminder: appointment tomorrow at {time}') },
    { id: 'nt-staff-order', event: 'staff_new_order', enabled: true, recipients: 'staff', subject: T('Neue Bestellung {number} — {total}', 'Porosi e re {number} — {total}', 'New order {number} — {total}') },
    { id: 'nt-staff-inquiry', event: 'staff_new_inquiry', enabled: true, recipients: 'staff', subject: T('Neue Anfrage: {name}', 'Kërkesë e re: {name}', 'New enquiry: {name}') },
  ],
  integrations: [
    { id: 'int-payment', kind: 'payment', name: 'Card payments (gateway)', status: 'test', note: 'Test mode — cards are not charged.' },
    { id: 'int-courier', kind: 'courier', name: 'Courier (DHL / local)', status: 'disconnected', note: 'Systems are delivered by our own crews; accessories by courier.' },
    { id: 'int-email', kind: 'email', name: 'Transactional e-mail (SMTP)', status: 'connected', note: 'Order and appointment confirmations from info@tersun.com.' },
    { id: 'int-fiscal', kind: 'fiscal', name: 'Fiscalisation', status: 'disconnected', note: 'Planned for phase 2.' },
    { id: 'int-analytics', kind: 'analytics', name: 'Google Analytics 4', status: 'test', note: 'Visits and conversions in a test property.' },
  ],
  markets: [
    { id: 'mk-xk', name: T('Kosovo', 'Kosova', 'Kosovo'), countries: ['XK'], currency: 'EUR', languages: ['sq', 'en', 'de'], status: 'active' },
    { id: 'mk-al', name: T('Albanien & Nordmazedonien', 'Shqipëria & Maqedonia e Veriut', 'Albania & North Macedonia'), countries: ['AL', 'MK'], currency: 'EUR', languages: ['sq', 'en'], status: 'active' },
    { id: 'mk-dach', name: T('Deutschland, Österreich, Schweiz', 'Gjermani, Austri, Zvicër', 'Germany, Austria, Switzerland'), countries: ['DE', 'AT', 'CH'], currency: 'EUR', languages: ['de', 'en'], status: 'active' },
    { id: 'mk-us', name: T('USA', 'SHBA', 'USA'), countries: ['US'], currency: 'USD', languages: ['en'], status: 'draft' },
  ],
  checkout: { guest: true, phoneRequired: true, companyField: 'optional', marketingOptIn: false },
  privacy: { cookieBanner: true },
};

/* ------------------------------------------------------------------ */
/* Homepage sections — image-led, very little copy                     */
/* ------------------------------------------------------------------ */
export function buildHome(now = new Date()): HomeSection[] {
  const endsAt = new Date(now.getTime() + 12 * 86400000 + 5 * 3600000).toISOString();
  return [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      data: {
        autoplay: true,
        slides: [
          {
            id: 's1',
            image: '/images/video/bioclimatic.mp4',
            eyebrow: T('Bioklimatische Pergola', 'Sistemi Bioklimatik', 'Bioclimatic System'),
            title: T('Beyond *Outdoor* Living.', 'Beyond *Outdoor* Living.', 'Beyond *Outdoor* Living.'),
            subtitle: T('Sonne, Schatten, Regen – auf Knopfdruck.', 'Diell, hije, shi – me një prekje.', 'Sun, shade, rain – at a touch.'),
            primary: { label: T('Kollektion entdecken', 'Zbuloni koleksionin', 'Explore the collection'), href: '/shop' },
            secondary: { label: T('In 3D gestalten', 'Krijoni në 3D', 'Design in 3D'), href: '/3d' },
          },
          {
            id: 's2',
            image: '/images/hero/slide.webp',
            eyebrow: T('Slide Premium', 'Slide Premium', 'Slide Premium'),
            title: T('Glas, das *sich öffnet*.', 'Xham që *hapet*.', 'Glass that *opens*.'),
            subtitle: T('Wintergarten im Winter, Terrasse im Sommer.', 'Kopsht dimëror në dimër, tarracë në verë.', 'A winter garden in winter, a terrace in summer.'),
            primary: { label: T('Slide ansehen', 'Shikoni Slide', 'View Slide'), href: '/shop/slide' },
            secondary: { label: T('Beratung anfragen', 'Kërkoni konsultë', 'Book a consultation'), href: '/#consultation' },
          },
          {
            id: 's3',
            image: '/images/hero/awning.webp',
            eyebrow: T('Glasdach + Markise', 'Mbulojë Xhami + Tendë', 'Glass Roof + Awning'),
            title: T('Licht. *Ohne Hitze*.', 'Dritë. *Pa nxehtësi*.', 'Light. *Without the heat*.'),
            subtitle: T('Sattler-Tuch über dem Glas.', 'Shtof Sattler mbi xham.', 'Sattler fabric above the glass.'),
            primary: { label: T('Glasdächer ansehen', 'Shikoni mbulojat', 'View glass roofs'), href: '/shop/glass-roof' },
            secondary: { label: T('Projekte', 'Projektet', 'Projects'), href: '/projects' },
          },
          {
            id: 's4',
            image: '/images/hero/zip.webp',
            eyebrow: T('ZIP-Screen', 'Perde Zip', 'ZIP Screen'),
            title: T('Ihre Terrasse. *Ihre Regeln*.', 'Tarraca juaj. *Rregullat tuaja*.', 'Your terrace. *Your rules*.'),
            subtitle: T('Sonne, Wind und Blicke bleiben draußen.', 'Dielli, era dhe shikimet mbeten jashtë.', 'Sun, wind and eyes stay outside.'),
            primary: { label: T('ZIP ansehen', 'Shikoni Zip', 'View ZIP'), href: '/shop/zip-screen' },
            secondary: { label: T('In 3D gestalten', 'Krijoni në 3D', 'Design in 3D'), href: '/3d' },
          },
        ],
      },
    },
    {
      id: 'trust',
      type: 'trust',
      enabled: true,
      data: {
        items: [
          { icon: 'Cog', title: T('Becker-Motoren', 'Motorë Becker', 'Becker motors'), text: T('Made in Germany', 'Prodhim gjerman', 'Made in Germany') },
          { icon: 'Sparkles', title: T('Sattler-Tuch', 'Shtof Sattler', 'Sattler fabric'), text: T('5 Jahre Garantie', '5 vite garanci', '5-year warranty') },
          { icon: 'ShieldCheck', title: T('Aluminium', 'Alumin', 'Aluminium'), text: T('Pulverbeschichtet, RAL', 'I ngjyrosur, RAL', 'Powder-coated, RAL') },
          { icon: 'Globe', title: T('Europa & USA', 'Evropë & SHBA', 'Europe & USA'), text: T('Eigene Montageteams', 'Ekipe tona montimi', 'Our own install crews') },
        ],
      },
    },
    {
      id: 'categories',
      type: 'categories',
      enabled: true,
      data: {
        eyebrow: T('Kollektion', 'Koleksioni', 'Collection'),
        title: T('Sechs Systeme. *Ein Lebensgefühl*.', 'Gjashtë sisteme. *Një stil jete*.', 'Six systems. *One way of living*.'),
        subtitle: T('', '', ''),
      },
    },
    {
      id: 'builder3d',
      type: 'promo',
      enabled: true,
      data: {
        eyebrow: T('3D-Builder', '3D Builder', '3D Builder'),
        title: T('Gestalten Sie Ihre Pergola *in 3D*.', 'Krijoni pergolën tuaj *në 3D*.', 'Design your pergola *in 3D*.'),
        text: T('Maße, Farbe, Licht, Tag & Nacht – in Echtzeit.', 'Masa, ngjyra, drita, ditë & natë – në kohë reale.', 'Size, colour, light, day & night – in real time.'),
        image: '/images/misc/builder-night.webp',
        cta: { label: T('3D-Builder öffnen', 'Hapni 3D Builder', 'Open the 3D Builder'), href: '/3d' },
        endsAt: '',
        code: '',
      },
    },
    {
      id: 'featured',
      type: 'featured',
      enabled: true,
      data: {
        eyebrow: T('Signature', 'Signature', 'Signature'),
        title: T('Die Favoriten', 'Të preferuarat', 'The favourites'),
        mode: 'manual',
        productIds: ['p-bio-free', 'p-glass-wall', 'p-guillotine', 'p-slide', 'p-zip', 'p-awning', 'p-slide-wintergarden', 'p-bio-wall'],
      },
    },
    {
      id: 'promo',
      type: 'promo',
      enabled: true,
      data: {
        eyebrow: T('Wintersaison', 'Sezoni i dimrit', 'Winter season'),
        title: T('−15% auf Heizstrahler & LED', '−15% për ngrohës & LED', '−15% on heaters & LED'),
        text: T('Mit Code WARM15 im Zubehör-Shop.', 'Me kodin WARM15 në dyqanin e aksesorëve.', 'With code WARM15 in the accessories shop.'),
        image: '/images/misc/night.webp',
        cta: { label: T('Zubehör ansehen', 'Shikoni aksesorët', 'Shop accessories'), href: '/shop/accessories' },
        endsAt,
        code: 'WARM15',
      },
    },
    {
      id: 'projects',
      type: 'projects',
      enabled: true,
      data: {
        eyebrow: T('Projekte', 'Projektet', 'Projects'),
        title: T('Terrassen, die wir *verwandelt* haben', 'Tarraca që i kemi *transformuar*', 'Terraces we have *transformed*'),
        subtitle: T('', '', ''),
      },
    },
    {
      id: 'process',
      type: 'process',
      enabled: true,
      data: {
        eyebrow: T('Ablauf', 'Procesi', 'Process'),
        title: T('Vier Schritte zur *Traumterrasse*', 'Katër hapa drejt *tarracës së ëndrrave*', 'Four steps to your *dream terrace*'),
        steps: [
          { title: T('3D-Entwurf', 'Projekt 3D', '3D design'), text: T('Online oder im Showroom.', 'Online ose në showroom.', 'Online or in the showroom.') },
          { title: T('Aufmaß vor Ort', 'Matja në vend', 'On-site survey'), text: T('Kostenlos und unverbindlich.', 'Falas dhe pa detyrim.', 'Free, no obligation.') },
          { title: T('Fertigung', 'Prodhimi', 'Manufacturing'), text: T('Nach Maß, in Ihrer RAL-Farbe.', 'Me masë, në ngjyrën tuaj RAL.', 'Made to measure, in your RAL colour.') },
          { title: T('Montage', 'Montimi', 'Installation'), text: T('Durch unsere eigenen Teams.', 'Nga ekipet tona.', 'By our own crews.') },
        ],
      },
    },
    {
      id: 'stats',
      type: 'stats',
      enabled: true,
      data: {
        image: '/images/misc/view.webp',
        quote: T('Wir bauen keine Dächer. Wir bauen Räume zum Leben.', 'Ne nuk ndërtojmë çati. Ndërtojmë hapësira për të jetuar.', 'We don’t build roofs. We build spaces to live in.'),
        items: [
          { value: '6', label: T('Premium-Systeme', 'sisteme premium', 'premium systems') },
          { value: '135°', label: T('Lamellenwinkel', 'këndi i lamelave', 'louvre rotation') },
          { value: '5', label: T('Jahre Garantie', 'vite garanci', 'year warranty') },
          { value: '3', label: T('Sprachen, zwei Kontinente', 'gjuhë, dy kontinente', 'languages, two continents') },
        ],
      },
    },
    {
      id: 'faq',
      type: 'faq',
      enabled: true,
      data: {
        eyebrow: T('FAQ', 'Pyetje', 'FAQ'),
        title: T('Kurz gefragt', 'Shkurt', 'Quick answers'),
        items: [
          {
            q: T('Wie lange dauert es bis zur Montage?', 'Sa zgjat deri te montimi?', 'How long until installation?'),
            a: T('In der Regel 3–6 Wochen nach dem Aufmaß.', 'Zakonisht 3–6 javë pas matjes.', 'Usually 3–6 weeks after the survey.'),
          },
          {
            q: T('Montieren Sie auch in Deutschland und den USA?', 'A montoni edhe në Gjermani dhe SHBA?', 'Do you install in Germany and the USA?'),
            a: T('Ja – mit eigenen Teams in Europa und Partnern in den USA.', 'Po – me ekipe tona në Evropë dhe partnerë në SHBA.', 'Yes – with our own crews in Europe and partners in the USA.'),
          },
          {
            q: T('Ist die bioklimatische Pergola wasserdicht?', 'A është pergola bioklimatike e papërshkueshme nga uji?', 'Is the bioclimatic pergola watertight?'),
            a: T('Ja. Geschlossen läuft das Wasser verdeckt durch die Pfosten ab.', 'Po. E mbyllur, uji largohet i fshehur përmes shtyllave.', 'Yes. When closed, water drains invisibly through the posts.'),
          },
          {
            q: T('Welche Farben gibt es?', 'Cilat ngjyra ka?', 'Which colours are available?'),
            a: T('Anthrazit RAL 7016 als Standard – jede RAL-Farbe auf Anfrage.', 'Antracit RAL 7016 standard – çdo ngjyrë RAL sipas kërkesës.', 'Anthracite RAL 7016 as standard – any RAL colour on request.'),
          },
          {
            q: T('Was kostet ein System?', 'Sa kushton një sistem?', 'What does a system cost?'),
            a: T('Jedes System wird nach Maß gefertigt. Gestalten Sie es im 3D-Builder und erhalten Sie ein Angebot innerhalb von 48 Stunden.', 'Çdo sistem prodhohet me masë. Krijojeni në 3D Builder dhe merrni ofertë brenda 48 orëve.', 'Every system is made to measure. Design it in the 3D Builder and get a quote within 48 hours.'),
          },
        ],
      },
    },
    {
      id: 'instagram',
      type: 'instagram',
      enabled: true,
      data: {
        title: T('@tersun auf Instagram', '@tersun në Instagram', '@tersun on Instagram'),
        images: ['/images/p/bioclimatic-2.webp', '/images/p/slide-4.webp', '/images/p/zip-3.webp', '/images/p/awning-3.webp', '/images/p/guillotine-2.webp', '/images/p/glass-roof-2.webp'],
      },
    },
    {
      id: 'cta',
      type: 'cta',
      enabled: true,
      data: {
        eyebrow: T('Kostenlose Beratung', 'Konsultë falas', 'Free consultation'),
        title: T('Lassen Sie uns Ihre Terrasse planen', 'Le ta planifikojmë tarracën tuaj', 'Let’s plan your terrace'),
        text: T('Wir melden uns innerhalb von 24 Stunden.', 'Ju kontaktojmë brenda 24 orëve.', 'We’ll get back to you within 24 hours.'),
        image: '/images/p/slide-2.webp',
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Projects / portfolio                                                */
/* ------------------------------------------------------------------ */
const TAG = {
  bio: T('Bioklimatisch', 'Bioklimatik', 'Bioclimatic'),
  glass: T('Glasdach', 'Mbulojë xhami', 'Glass roof'),
  awning: T('Markise', 'Tendë', 'Awning'),
  guillotine: T('Guillotine', 'Guillotine', 'Guillotine'),
  slide: T('Slide', 'Slide', 'Slide'),
  zip: T('ZIP', 'Zip', 'ZIP'),
};

export const PROJECTS: Project[] = [
  {
    id: 'pr-1',
    title: T('Pool-Lounge bei Sonnenuntergang', 'Lounge pishine në perëndim', 'Pool lounge at sunset'),
    location: 'Prizren',
    year: 2026,
    tags: [TAG.bio],
    summary: T('Freistehende Bioclimatic mit LED.', 'Bioclimatic vetëqëndruese me LED.', 'Freestanding Bioclimatic with LED.'),
    image: '/images/p/bioclimatic-1.webp',
    featured: true,
  },
  {
    id: 'pr-2',
    title: T('Wintergarten mit Aussicht', 'Kopsht dimëror me pamje', 'Winter garden with a view'),
    location: 'Prishtina',
    year: 2026,
    tags: [TAG.slide, TAG.glass],
    summary: T('Glasdach und Slide-Wände auf drei Seiten.', 'Mbulojë xhami dhe mure Slide në tri anë.', 'Glass roof and Slide walls on three sides.'),
    image: '/images/p/slide-3.webp',
    featured: true,
  },
  {
    id: 'pr-3',
    title: T('Villa-Terrasse mit Markise', 'Tarracë vile me tendë', 'Villa terrace with awning'),
    location: 'Stuttgart',
    year: 2025,
    tags: [TAG.glass, TAG.awning],
    summary: T('Glasdach mit Aufdachmarkise.', 'Mbulojë xhami me tendë mbi xham.', 'Glass roof with over-glass awning.'),
    image: '/images/p/awning-4.webp',
    featured: true,
  },
  {
    id: 'pr-4',
    title: T('Guillotine am Meer', 'Guillotine buzë detit', 'Guillotine by the sea'),
    location: 'Durrës',
    year: 2025,
    tags: [TAG.guillotine],
    summary: T('Windschutz für ein Strandrestaurant.', 'Mbrojtje nga era për një restorant plazhi.', 'Wind protection for a beach restaurant.'),
    image: '/images/p/guillotine-3.webp',
    featured: true,
  },
  {
    id: 'pr-5',
    title: T('Moderne Fassade mit ZIP', 'Fasadë moderne me Zip', 'Modern façade with ZIP'),
    location: 'München',
    year: 2025,
    tags: [TAG.zip],
    summary: T('Außenliegender Sonnenschutz, Anthrazit.', 'Mbrojtje e jashtme nga dielli, antracit.', 'External sun protection, anthracite.'),
    image: '/images/p/zip-3.webp',
    featured: true,
  },
  {
    id: 'pr-6',
    title: T('Glasdach am Familienhaus', 'Mbulojë xhami në shtëpi familjare', 'Glass roof at a family home'),
    location: 'Peja',
    year: 2025,
    tags: [TAG.glass],
    summary: T('Wandmontiert mit Samsung LED.', 'Në mur me LED Samsung.', 'Wall-mounted with Samsung LED.'),
    image: '/images/p/glass-roof-2.webp',
    featured: true,
  },
  {
    id: 'pr-7',
    title: T('Penthouse-Terrasse', 'Tarracë penthouse', 'Penthouse terrace'),
    location: 'Tirana',
    year: 2026,
    tags: [TAG.slide],
    summary: T('Slide Premium mit Panoramablick.', 'Slide Premium me pamje panoramike.', 'Slide Premium with a panoramic view.'),
    image: '/images/p/slide-2.webp',
    featured: false,
  },
  {
    id: 'pr-8',
    title: T('Lounge am Garten', 'Lounge në kopsht', 'Garden lounge'),
    location: 'Zürich',
    year: 2024,
    tags: [TAG.zip, TAG.glass],
    summary: T('Glasdach mit ZIP-Screens rundum.', 'Mbulojë xhami me perde Zip rreth e rrotull.', 'Glass roof with ZIP screens all round.'),
    image: '/images/p/zip-4.webp',
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* CMS pages                                                           */
/* ------------------------------------------------------------------ */
export function buildPages(now = new Date()): CmsPage[] {
  const at = now.toISOString();
  return [
    {
      id: 'pg-delivery',
      slug: 'delivery-installation',
      title: T('Lieferung & Montage', 'Dërgesa & montimi', 'Delivery & installation'),
      body: T(
        `## Systeme
Alle Systeme werden nach Maß gefertigt und von unseren eigenen Teams montiert – in Kosovo, Albanien, Nordmazedonien und der EU. In den USA arbeiten wir mit zertifizierten Partnern.

- Aufmaß vor Ort: kostenlos
- Fertigung: 3–5 Wochen
- Montage: 1–3 Tage

## Zubehör
- Kosovo: 1–2 Tage, kostenlos
- Albanien & Nordmazedonien: 2–4 Tage, 15 €
- EU / DACH: 4–7 Tage, 35 €

Ab 250 € liefern wir **kostenlos**.`,
        `## Sistemet
Të gjitha sistemet prodhohen me masë dhe montohen nga ekipet tona – në Kosovë, Shqipëri, Maqedoni të Veriut dhe BE. Në SHBA punojmë me partnerë të certifikuar.

- Matja në vend: falas
- Prodhimi: 3–5 javë
- Montimi: 1–3 ditë

## Aksesorët
- Kosova: 1–2 ditë, falas
- Shqipëri & Maqedoni e Veriut: 2–4 ditë, 15 €
- BE / DACH: 4–7 ditë, 35 €

Mbi 250 € dërgesa është **falas**.`,
        `## Systems
Every system is made to measure and installed by our own crews – in Kosovo, Albania, North Macedonia and the EU. In the USA we work with certified partners.

- On-site survey: free
- Manufacturing: 3–5 weeks
- Installation: 1–3 days

## Accessories
- Kosovo: 1–2 days, free
- Albania & North Macedonia: 2–4 days, €15
- EU / DACH: 4–7 days, €35

Delivery is **free** over €250.`,
      ),
      published: true,
      showInFooter: true,
      updatedAt: at,
    },
    {
      id: 'pg-terms',
      slug: 'terms',
      title: T('AGB', 'Kushtet e blerjes', 'Terms of sale'),
      body: T(
        `## Angebote
Systeme werden nach Aufmaß angeboten. Das Angebot ist 30 Tage gültig.

## Zahlung
- 40 % Anzahlung bei Auftrag
- 60 % nach Montage
- Zubehör: Karte, Überweisung oder Nachnahme

## Garantie
Bis zu 5 Jahre auf Systeme und Sattler-Tuch, 2 Jahre auf Elektronik.`,
        `## Ofertat
Sistemet ofrohen pas matjes. Oferta vlen 30 ditë.

## Pagesa
- 40 % paradhënie me porosinë
- 60 % pas montimit
- Aksesorët: kartelë, transfertë ose para në dorëzim

## Garancia
Deri 5 vite për sistemet dhe shtofin Sattler, 2 vite për elektronikën.`,
        `## Quotes
Systems are quoted after the survey. Quotes are valid for 30 days.

## Payment
- 40% deposit on order
- 60% after installation
- Accessories: card, bank transfer or cash on delivery

## Warranty
Up to 5 years on systems and Sattler fabric, 2 years on electronics.`,
      ),
      published: true,
      showInFooter: true,
      updatedAt: at,
    },
    {
      id: 'pg-returns',
      slug: 'returns',
      title: T('Rückgabe', 'Kthimet', 'Returns'),
      body: T(
        `Zubehör kann innerhalb von **14 Tagen** unbenutzt zurückgegeben werden. Maßgefertigte Systeme sind von der Rückgabe ausgeschlossen.

Schreiben Sie an info@tersun.com – wir kümmern uns um alles.`,
        `Aksesorët mund të kthehen brenda **14 ditëve** të papërdorur. Sistemet e prodhuara me masë nuk kthehen.

Na shkruani në info@tersun.com – kujdesemi ne për gjithçka.`,
        `Accessories can be returned unused within **14 days**. Made-to-measure systems cannot be returned.

Write to info@tersun.com – we take care of the rest.`,
      ),
      published: true,
      showInFooter: true,
      updatedAt: at,
    },
    {
      id: 'pg-privacy',
      slug: 'privacy',
      title: T('Datenschutz', 'Privatësia', 'Privacy policy'),
      body: T(
        `Wir verwenden Ihre Daten nur, um Ihre Anfrage oder Bestellung zu bearbeiten. Keine Weitergabe an Dritte, außer an Zahlungs- und Versanddienstleister.

## Ihre Rechte
Auskunft, Berichtigung und Löschung jederzeit unter info@tersun.com.`,
        `Të dhënat tuaja i përdorim vetëm për të përpunuar kërkesën ose porosinë. Nuk i ndajmë me palë të treta, përveç ofruesve të pagesave dhe dërgesave.

## Të drejtat tuaja
Informim, korrigjim dhe fshirje në çdo kohë në info@tersun.com.`,
        `We only use your data to handle your enquiry or order. No sharing with third parties except payment and delivery providers.

## Your rights
Access, correction and deletion at any time via info@tersun.com.`,
      ),
      published: true,
      showInFooter: true,
      updatedAt: at,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */
export function buildPosts(now = new Date()): Post[] {
  const d = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
  return [
    {
      id: 'post-bioclimatic',
      slug: 'bioclimatic-vs-glass-roof',
      title: T('Bioklimatische Pergola oder Glasdach?', 'Pergolë bioklimatike apo mbulojë xhami?', 'Bioclimatic pergola or glass roof?'),
      excerpt: T('Zwei Wege zum Dach über der Terrasse – kurz verglichen.', 'Dy rrugë për një çati mbi tarracë – krahasim i shkurtër.', 'Two ways to roof your terrace – a quick comparison.'),
      body: T(
        `## Bioklimatisch
- Lamellen öffnen sich für Luft und Licht
- Ideal für heiße Sommer
- Wasserdicht geschlossen

## Glasdach
- Volles Tageslicht, auch im Winter
- Perfekt mit Slide-Wänden zum Wintergarten
- Mit Aufdachmarkise gegen Hitze

> Unsicher? Testen Sie beide im 3D-Builder.`,
        `## Bioklimatike
- Lamelat hapen për ajër dhe dritë
- Ideale për verë të nxehtë
- E papërshkueshme kur mbyllet

## Mbulojë xhami
- Dritë e plotë, edhe në dimër
- E përsosur me mure Slide për kopsht dimëror
- Me tendë mbi xham kundër nxehtësisë

> Të pasigurt? Provoni të dyja në 3D Builder.`,
        `## Bioclimatic
- Louvres open for air and light
- Ideal for hot summers
- Watertight when closed

## Glass roof
- Full daylight, even in winter
- Perfect with Slide walls as a winter garden
- With an over-glass awning against the heat

> Not sure? Try both in the 3D Builder.`,
      ),
      cover: '/images/p/bioclimatic-1.webp',
      tag: T('Ratgeber', 'Udhëzues', 'Guide'),
      author: 'TERSUN Studio',
      readMinutes: 3,
      publishedAt: d(6),
      published: true,
    },
    {
      id: 'post-zip',
      slug: 'zip-screen-explained',
      title: T('ZIP-Screen: warum der Reißverschluss zählt', 'Perde Zip: pse zinxhiri ka rëndësi', 'ZIP screens: why the zip matters'),
      excerpt: T('Straff bei Wind, dicht gegen Insekten.', 'E tendosur në erë, e mbyllur për insektet.', 'Taut in the wind, sealed against insects.'),
      body: T(
        `Beim ZIP-Screen ist das Tuch seitlich mit einem Reißverschluss in der Führungsschiene gehalten. Das Ergebnis: **keine Spalten**, kein Flattern, kein Insekt.

- Sattler-Tuch, 5 Jahre Garantie
- Bis 5 m Breite
- Optional Windsensor`,
        `Te perdja Zip, pëlhura mbahet anash me zinxhir në shinë. Rezultati: **pa hapësira**, pa valëvitje, pa insekte.

- Shtof Sattler, 5 vite garanci
- Deri 5 m gjerësi
- Opsionalisht sensor ere`,
        `With a ZIP screen the fabric is held in the side rails by a zip. The result: **no gaps**, no flapping, no insects.

- Sattler fabric, 5-year warranty
- Up to 5 m wide
- Optional wind sensor`,
      ),
      cover: '/images/p/zip-2.webp',
      tag: T('Technik', 'Teknikë', 'Technology'),
      author: 'TERSUN Studio',
      readMinutes: 2,
      publishedAt: d(19),
      published: true,
    },
    {
      id: 'post-winter',
      slug: 'terrace-all-year',
      title: T('Die Terrasse das ganze Jahr nutzen', 'Tarraca gjatë gjithë vitit', 'Use your terrace all year'),
      excerpt: T('Glas, Wärme und Licht für die kalten Monate.', 'Xham, ngrohje dhe dritë për muajt e ftohtë.', 'Glass, heat and light for the cold months.'),
      body: T(
        `## Schließen
Guillotine oder Slide verwandeln jedes Dach in einen Wintergarten.

## Wärmen
Ein Infrarot-Heizstrahler ist in Sekunden warm.

## Beleuchten
Warmweiße LED in Rahmen und Lamellen.`,
        `## Mbyllni
Guillotine ose Slide e kthejnë çdo çati në kopsht dimëror.

## Ngrohni
Një ngrohës infra të kuqe ngrohet për sekonda.

## Ndriçoni
LED e bardhë e ngrohtë në profil dhe lamela.`,
        `## Close
Guillotine or Slide turn any roof into a winter garden.

## Warm
An infrared heater is warm in seconds.

## Light
Warm-white LED in the frame and louvres.`,
      ),
      cover: '/images/p/slide-4.webp',
      tag: T('Inspiration', 'Frymëzim', 'Inspiration'),
      author: 'TERSUN Studio',
      readMinutes: 2,
      publishedAt: d(41),
      published: true,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */
export function buildCoupons(now = new Date()): Coupon[] {
  return [
    { id: 'cp-1', code: 'WELCOME10', type: 'percent', value: 10, minTotal: 100, active: true, uses: 37, description: 'Welcome — 10% on accessories over €100' },
    { id: 'cp-2', code: 'WARM15', type: 'percent', value: 15, minTotal: 0, active: true, uses: 12, expiresAt: new Date(now.getTime() + 20 * 86400000).toISOString(), description: 'Winter — 15% on heaters & LED' },
    { id: 'cp-3', code: 'PARTNER50', type: 'fixed', value: 50, minTotal: 500, active: false, uses: 4, description: 'Architects & partners (inactive)' },
  ];
}
