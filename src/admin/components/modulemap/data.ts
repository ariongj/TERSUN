// Harta e moduleve — content from the CMS proposal: p.47 (other modules), p.49 (phases), p.50 (acceptance criteria),
// p.51 (decisions). Each module/criterion says honestly what THIS demo already shows and links to that screen.
import type { L10n } from '@/lib/types';

const T = (de: string, sq: string, en: string): L10n => ({ de, sq, en });

/* ------------------------------------------------------------------ */
/* Modules by phase (p.49 + p.47)                                      */
/* ------------------------------------------------------------------ */
export type PhaseId = 'base' | 'second' | 'business';
/** demo = working screen in this demo · phase2 = planned for the second extension · need = only when the business needs it */
export type ModStatus = 'demo' | 'phase2' | 'need';

export interface Phase {
  id: PhaseId;
  title: L10n;
  text: L10n;
}

export const PHASES: Phase[] = [
  {
    id: 'base',
    title: T('Gemeinsame Basis', 'Baza e përbashkët', 'Shared core'),
    text: T('Was jedes Projekt im ersten Release erhält.', 'Ajo që çdo projekt merr në lëshimin e parë.', 'What every project gets in the first release.'),
  },
  {
    id: 'second',
    title: T('Zweite Ausbaustufe', 'Zgjerimi i dytë', 'Second extension'),
    text: T('Kommt, sobald die Basis in Produktion läuft.', 'Vjen pasi baza funksionon në prodhim.', 'Comes once the core runs in production.'),
  },
  {
    id: 'business',
    title: T('Nach Geschäftsbedarf', 'Sipas biznesit', 'Per business need'),
    text: T('Jede Integration hat eine Spezifikation, Grenzen und Tests.', 'Çdo integrim ka specifikim, kufij dhe prova.', 'Every integration has a specification, limits and tests.'),
  },
];

export interface ModuleItem {
  id: string;
  phase: PhaseId;
  status: ModStatus;
  name: L10n;
  text: L10n;
  /** Screen that shows it in this demo (admin route, or a storefront route when `site`) */
  to?: string;
  site?: boolean;
  /** A related (simulated) screen for modules that are not in the demo yet */
  related?: string;
}

export const MODULES_MAP: ModuleItem[] = [
  /* ---------------- 01 Baza e përbashkët ---------------- */
  { id: 'access', phase: 'base', status: 'demo', to: '/admin/konfiguracija/stafi', name: T('Anmeldung, Rollen und Verlauf', 'Hyrja, rolet dhe auditi', 'Sign-in, roles and audit'), text: T('Berechtigungen pro Aktion; Menüs und Schaltflächen werden je nach Rolle ausgeblendet.', 'Leje sipas veprimit; menytë dhe butonat fshihen sipas rolit.', 'Permissions per action; menus and buttons hide per role.') },
  { id: 'catalog', phase: 'base', status: 'demo', to: '/admin/proizvodi', name: T('Katalog mit Varianten', 'Katalog me variante', 'Catalogue with variants'), text: T('Produkte, Optionen, Preise, Status und SEO.', 'Produkte, opsione, çmime, status dhe SEO.', 'Products, options, prices, status and SEO.') },
  { id: 'collections', phase: 'base', status: 'demo', to: '/admin/kolekcije', name: T('Kollektionen', 'Koleksionet', 'Collections'), text: T('Manuelle und intelligente Kollektionen mit Bedingungen.', 'Koleksione manuale dhe smart me kushte.', 'Manual and smart collections with conditions.') },
  { id: 'inventory', phase: 'base', status: 'demo', to: '/admin/inventar', name: T('Inventar — ein Standort', 'Inventari — një lokacion', 'Inventory — one location'), text: T('Lagerbewegungen mit Grund; verfügbar = auf Lager − reserviert.', 'Lëvizje stoku me arsye; e disponueshme = në dorë − e angazhuar.', 'Stock movements with a reason; available = on hand − committed.') },
  { id: 'orders', phase: 'base', status: 'demo', to: '/admin/narudzbe', name: T('Bestellungen und Entwürfe', 'Porositë dhe draftet', 'Orders and drafts'), text: T('Zahlung, Versand und Erstattung getrennt; Bestellentwürfe.', 'Pagesa, përmbushja dhe rimbursimi veç e veç; porosi draft.', 'Payment, fulfilment and refunds kept apart; draft orders.') },
  { id: 'customers', phase: 'base', status: 'demo', to: '/admin/kupci', name: T('Kunden und Segmente', 'Klientët dhe segmentet', 'Customers and segments'), text: T('Kundenprofil, Bestellhistorie und Segmente.', 'Profili i klientit, historia e porosive dhe segmentet.', 'Customer profile, order history and segments.') },
  { id: 'payship', phase: 'base', status: 'demo', to: '/admin/konfiguracija/pagesat', name: T('Zahlung und Versand', 'Pagesa dhe dërgesa', 'Payment and shipping'), text: T('Ausgewählte Zahlungsarten, Versandzonen und Checkout.', 'Mënyrat e zgjedhura të pagesës, zonat e dërgesës dhe checkout.', 'Chosen payment methods, shipping zones and checkout.') },
  { id: 'discounts', phase: 'base', status: 'demo', to: '/admin/popusti', name: T('Vier Rabattarten', 'Katër llojet e zbritjeve', 'Four discount types'), text: T('Code oder automatisch, Kombinierbarkeit, Schwellenwerte und Limits.', 'Me kod ose automatike, kombinime, pragje dhe kufij.', 'Code or automatic, combinations, thresholds and limits.') },
  { id: 'content', phase: 'base', status: 'demo', to: '/admin/stranice', name: T('Seiten, Menüs und Dateien', 'Faqet, menytë dhe skedarët', 'Pages, menus and files'), text: T('Inhalte in drei Sprachen, mit Entwurf und Veröffentlichung.', 'Përmbajtje në tre gjuhë, me draft dhe publikim.', 'Content in three languages, with draft and publish.') },
  { id: 'offers', phase: 'base', status: 'demo', to: '/admin/ponude', name: T('Angebotszentrale', 'Qendra e ofertave', 'Offers centre'), text: T('Ein Angebot verknüpft Rabattregel, Landingpage und Banner.', 'Oferta lidh rregullin e zbritjes, landing page dhe bannerët.', 'An offer ties the discount rule, landing page and banners.') },
  { id: 'slides', phase: 'base', status: 'demo', to: '/admin/prodavnica/slajdovi', name: T('Slider und Banner', 'Slideshow dhe bannerë', 'Slideshow and banners'), text: T('Bilder für Desktop und Mobil, CTA, Zeitplan und Hinweisleiste.', 'Imazhe desktop/mobile, CTA, orar dhe announcement bar.', 'Desktop/mobile images, CTA, schedule and announcement bar.') },
  { id: 'editor', phase: 'base', status: 'demo', to: '/admin/prodavnica/editor', name: T('Onlineshop und Editor', 'Online Store dhe editori', 'Online Store and editor'), text: T('Startseiten-Sektionen, Entwurf, Veröffentlichung und Versionswiederherstellung.', 'Seksionet e ballinës, draft, publikim dhe rikthim versioni.', 'Homepage sections, draft, publish and version rollback.') },
  { id: 'contacts', phase: 'base', status: 'demo', to: '/admin/kontakti', name: T('Kontakte', 'Kontaktet', 'Contacts'), text: T('Anfragen von der Website, Zuständige, Status und Antwortfrist.', 'Kërkesat nga faqja, përgjegjësi, statusi dhe afati.', 'Website enquiries, assignee, status and follow-up.') },
  { id: 'settings', phase: 'base', status: 'demo', to: '/admin/konfiguracija', name: T('Einstellungen und Benachrichtigungen', 'Konfigurimet dhe njoftimet', 'Settings and notifications'), text: T('Shop, Personal, Sprachen, E-Mail-Vorlagen und Datenschutz.', 'Dyqani, stafi, gjuhët, shabllonet email dhe privatësia.', 'Store, staff, languages, email templates and privacy.') },
  { id: 'reports', phase: 'base', status: 'demo', to: '/admin/analitika', name: T('Basisberichte', 'Raporte bazë', 'Basic reports'), text: T('Verkauf, Betrieb und Kampagnen, mit CSV-Export.', 'Shitje, operacione dhe fushata, me eksport CSV.', 'Sales, operations and campaigns, with CSV export.') },

  /* ---------------- 02 Zgjerimi i dytë ---------------- */
  { id: 'purchasing', phase: 'second', status: 'demo', to: '/admin/nabavke', name: T('Einkauf bei Lieferanten', 'Furnizimet', 'Purchase orders'), text: T('Der Wareneingang ist idempotent — derselbe Eingang zweimal erhöht den Bestand nicht.', 'Pranimi i mallit është idempotent — i njëjti pranim dy herë nuk shton stok.', 'Receiving is idempotent — the same receipt twice adds no stock.') },
  { id: 'transfers', phase: 'second', status: 'phase2', related: '/admin/inventar', name: T('Umlagerungen und mehrere Standorte', 'Transferimet dhe multi-location', 'Transfers and multi-location'), text: T('Vorerst ein Standort und Korrekturen mit Begründung.', 'Për tani një lokacion dhe korrigjime me arsye.', 'One location and reasoned adjustments for now.') },
  { id: 'models', phase: 'second', status: 'demo', to: '/admin/modeli', name: T('Blog und Inhaltsmodelle', 'Blogu dhe modelet e përmbajtjes', 'Blog and content models'), text: T('Strukturierte Inhalte: Projekte, FAQ, Leistungen, Standorte.', 'Përmbajtje e strukturuar: projekte, FAQ, shërbime, lokacione.', 'Structured content: projects, FAQ, services, locations.') },
  { id: 'markets', phase: 'second', status: 'demo', to: '/admin/trzista', name: T('Märkte und mehrere Währungen', 'Tregjet dhe shumë valuta', 'Markets and currencies'), text: T('Länder, Sprachen, Währung und Rundungsregel.', 'Shtete, gjuhë, valutë dhe politikë rrumbullakimi.', 'Countries, languages, currency and rounding policy.') },
  { id: 'returns', phase: 'second', status: 'demo', to: '/admin/povrati', name: T('Retouren', 'Kthimet', 'Returns'), text: T('Teilretouren mit exaktem Betrag und Wiedereinlagerung.', 'Kthim i pjesshëm me shumë të saktë dhe rikthim në stok.', 'Partial returns with the exact amount and restocking.') },
  { id: 'selfservice', phase: 'second', status: 'phase2', name: T('Self-Service für Kunden', 'Vetëshërbim për klientët', 'Customer self-service'), text: T('Der Kunde meldet die Retoure selbst an und verfolgt den Status.', 'Klienti e kërkon vetë kthimin dhe ndjek statusin.', 'Customers request returns and track the status themselves.') },
  { id: 'appointments', phase: 'second', status: 'demo', to: '/admin/termini', name: T('Termine und Kalender', 'Terminet dhe kalendari', 'Appointments and calendar'), text: T('Vor-Ort-Termine und Montagen ohne Überschneidungen.', 'Takime në vend dhe montime pa mbivendosje terminesh.', 'On-site visits and installs without overlapping slots.') },
  { id: 'b2b', phase: 'second', status: 'demo', to: '/admin/kontakti/ponude', name: T('B2B-Angebote', 'Oferta B2B', 'B2B quotes'), text: T('Angebot aus einer Anfrage, Positionen, Gültigkeit und Status.', 'Ofertë nga kërkesa, artikuj, afat vlefshmërie dhe status.', 'Quote from an enquiry, lines, validity and status.') },
  { id: 'campaigns', phase: 'second', status: 'demo', to: '/admin/analitika?tab=campaigns', name: T('Kampagnenberichte', 'Raportet e fushatave', 'Campaign reports'), text: T('Besuche, Klicks, Code-Nutzungen, Bestellungen und Rabatt in Euro.', 'Vizita, klikime, përdorime kodi, porosi dhe ulje monetare.', 'Visits, clicks, code uses, orders and money off.') },
  { id: 'fiscal', phase: 'second', status: 'phase2', related: '/admin/integracije', name: T('Fiskalisierung', 'Fiskalizimi', 'Fiscalisation'), text: T('Registrierung von Rechnungen im Steuersystem — über eine Integration.', 'Regjistrimi i faturave në sistemin tatimor — përmes integrimit.', 'Invoices registered with the tax system — via an integration.') },
  { id: 'automations', phase: 'second', status: 'phase2', name: T('Automatisierungen', 'Automatizimet', 'Automations'), text: T('Auslöser → Bedingung → Aktion, mit Protokoll, Wiederholung und Schleifenschutz.', 'Trigger → kusht → veprim, me log, riprovim dhe parandalim ciklesh.', 'Trigger → condition → action, with log, retry and loop protection.') },
  { id: 'import', phase: 'second', status: 'phase2', related: '/admin/proizvodi', name: T('Erweiterter Import', 'Import i avancuar', 'Advanced import'), text: T('Der einfache CSV-Import mit SKU-Duplikatprüfung funktioniert bereits in der Demo.', 'Importi bazë CSV me kontroll dublikatash SKU funksionon tashmë në demo.', 'Basic CSV import with a duplicate-SKU check already works in the demo.') },

  /* ---------------- 03 Sipas biznesit ---------------- */
  { id: 'wishlist', phase: 'business', status: 'demo', to: '/wishlist', site: true, name: T('Merkliste, Suche und Filter', 'Wishlist, kërkim dhe filtra', 'Wishlist, search and filters'), text: T('Merkliste, Suche und Filter funktionieren bereits auf der öffentlichen Website.', 'Në faqen publike funksionojnë tashmë wishlist, kërkimi dhe filtrat.', 'Wishlist, search and filters already work on the public site.') },
  { id: 'pos', phase: 'business', status: 'need', name: T('POS mit Synchronisierung', 'POS me sinkronizim', 'POS with sync'), text: T('Eine einzige verlässliche Quelle für Bestand und Bestellungen.', 'Një burim i qartë për stokun dhe porositë.', 'One source of truth for stock and orders.') },
  { id: 'marketplace', phase: 'business', status: 'need', name: T('Marktplätze und soziale Netzwerke', 'Marketplace dhe rrjete sociale', 'Marketplaces and social'), text: T('Produktzuordnung, Warteschlange und Synchronisierungsfehler.', 'Mapim produktesh, queue dhe gabime sinkronizimi.', 'Product mapping, queue and sync errors.') },
  { id: 'erp', phase: 'business', status: 'need', related: '/admin/integracije', name: T('ERP / Buchhaltung', 'ERP / kontabilitet', 'ERP / accounting'), text: T('Artikel, Bestand, Bestellungen und Rechnungen mit der Buchhaltung.', 'Artikuj, stok, porosi dhe fatura me kontabilitetin.', 'Items, stock, orders and invoices with accounting.') },
  { id: 'courier', phase: 'business', status: 'need', related: '/admin/integracije', name: T('Kurier-API', 'API i korrierit', 'Courier API'), text: T('Etiketten und Sendungsverfolgung in der Bestellung.', 'Etiketa dhe gjurmim i dërgesës në porosi.', 'Labels and shipment tracking on the order.') },
  { id: 'giftcards', phase: 'business', status: 'need', name: T('Geschenkkarten und Guthaben', 'Gift cards dhe store credit', 'Gift cards and store credit'), text: T('Saldo und Nutzungsprotokoll.', 'Balancë dhe regjistër përdorimi.', 'Balance and usage ledger.') },
  { id: 'b2bprices', phase: 'business', status: 'need', name: T('B2B-Firmen und Preislisten', 'Kompani B2B dhe çmime sipas klientit', 'B2B companies and price lists'), text: T('Kataloge und Preise pro Kunde.', 'Katalogë dhe çmime sipas klientit.', 'Catalogues and prices per customer.') },
  { id: 'bundles', phase: 'business', status: 'need', name: T('Produktbundles', 'Bundles', 'Bundles'), text: T('Der Bestand der Komponenten wird gemeinsam reduziert.', 'Stoku i komponentëve zbritet bashkë.', 'Component stock is reduced together.') },
  { id: 'subscriptions', phase: 'business', status: 'need', name: T('Abonnements und digitale Produkte', 'Abonime dhe produkte digjitale', 'Subscriptions and digital products'), text: T('Verlängerung und Kündigung über einen Anbieter für wiederkehrende Zahlungen.', 'Rinovim dhe anulim përmes ofruesit të pagesave periodike.', 'Renewal and cancellation via a recurring-payments provider.') },
  { id: 'loyalty', phase: 'business', status: 'need', name: T('Treueprogramm', 'Program besnikërie', 'Loyalty programme'), text: T('Punkte oder Gutscheine, mit Protokoll und Rückbuchung von Punkten.', 'Pikë ose kupona, me regjistër dhe kthim pikësh.', 'Points or coupons, with a ledger and reversals.') },
  { id: 'reviews', phase: 'business', status: 'need', name: T('Bewertungen', 'Reviews', 'Reviews'), text: T('Moderation und verifizierter Kauf.', 'Moderim dhe verifikim blerjeje.', 'Moderation and verified purchase.') },
  { id: 'abandoned', phase: 'business', status: 'need', name: T('Abgebrochene Warenkörbe', 'Shporta të braktisura', 'Abandoned carts'), text: T('Erinnerung nur mit Einwilligung des Kunden.', 'Kujtesë vetëm me pëlqimin e klientit.', 'Reminders only with the customer’s consent.') },
  { id: 'ai', phase: 'business', status: 'need', name: T('KI-Inhaltsvorschläge', 'AI për sugjerime përmbajtjeje', 'AI content suggestions'), text: T('Immer mit Prüfung vor der Veröffentlichung; ändert nie selbst Preise oder Rabatte.', 'Gjithmonë me shqyrtim para publikimit; nuk ndryshon vetë çmime apo zbritje.', 'Always reviewed before publishing; never changes prices or discounts on its own.') },
  { id: 'multistore', phase: 'business', status: 'need', name: T('Dashboard für mehrere Shops', 'Panel për shumë dyqane', 'Multi-store dashboard'), text: T('Ein eigenes Plattformprojekt, mit Datenisolierung.', 'Projekt platforme më vete, me izolim të dhënash.', 'A separate platform project, with data isolation.') },
];

/* ------------------------------------------------------------------ */
/* Acceptance criteria (p.50)                                          */
/* ------------------------------------------------------------------ */
/** demo = demonstrated here · partial = visible in the demo, completed in the implementation · impl = verified during implementation */
export type CritState = 'demo' | 'partial' | 'impl';

export interface Criterion {
  id: string;
  state: CritState;
  text: L10n;
  how: L10n;
  to?: string;
  site?: boolean;
}

export interface CriteriaGroup {
  id: string;
  title: L10n;
  items: Criterion[];
}

export const CRITERIA: CriteriaGroup[] = [
  {
    id: 'catalog',
    title: T('Katalog, Bestellungen und Berechtigungen', 'Katalog, porosi dhe leje', 'Catalogue, orders and permissions'),
    items: [
      { id: 'variant', state: 'partial', to: '/admin/narudzbe/o_1001', text: T('Korrekte Variante', 'Variant i saktë', 'Correct variant'), how: T('Optionen (Breite, Farbe) und ihr Preis werden in Warenkorb und Bestellung gespeichert; der Bestand pro Variante wird in der Implementierung geprüft.', 'Opsionet (gjerësia, ngjyra) dhe çmimi i tyre ruhen në shportë dhe porosi; stoku për variant verifikohet në implementim.', 'Options (width, colour) and their price are kept in the cart and order; per-variant stock is verified in the implementation.') },
      { id: 'import', state: 'demo', to: '/admin/proizvodi', text: T('Import ohne Duplikate', 'Import pa duplikate', 'Import without duplicates'), how: T('Der CSV-Import meldet doppelte SKUs und bietet an, das vorhandene Produkt zu aktualisieren.', 'Importi CSV raporton SKU të dyfishtë dhe ofron përditësimin e produktit ekzistues.', 'The CSV import reports duplicate SKUs and offers to update the existing product.') },
      { id: 'archive', state: 'demo', to: '/admin/proizvodi', text: T('Archivierung ohne Verlust der Historie', 'Arkivim pa humbje historie', 'Archiving without losing history'), how: T('Ein archiviertes Produkt verschwindet von der Website, bleibt aber in alten Bestellungen und Berichten erhalten.', 'Produkti i arkivuar largohet nga faqja, por mbetet në porositë dhe raportet e vjetra.', 'An archived product leaves the site but stays in past orders and reports.') },
      { id: 'oversell', state: 'partial', to: '/admin/inventar', text: T('Verkauf des letzten Stücks ohne Überverkauf', 'Shitja e njësisë së fundit pa overselling', 'Selling the last unit without overselling'), how: T('Die Demo zeigt verfügbar = auf Lager − reserviert; die Servertransaktion für gleichzeitige Käufe wird in der Implementierung geprüft.', 'Demo tregon të disponueshmen = në dorë − e angazhuar; transaksioni në server për blerje të njëkohshme verifikohet në implementim.', 'The demo shows available = on hand − committed; the server transaction for simultaneous purchases is verified in the implementation.') },
      { id: 'payment', state: 'partial', to: '/admin/nabavke', text: T('Eine wiederholte Zahlung erzeugt weder doppelte Zahlung noch doppelte Bestellung', 'Pagesë e përsëritur nuk krijon pagesë/porosi të dyfishtë', 'A repeated payment never creates a duplicate payment or order'), how: T('Das Idempotenzprinzip zeigt sich beim Wareneingang: derselbe Eingang zweimal erhöht den Bestand nicht. Zahlungen werden beim Anbieter geprüft.', 'Parimi i idempotencës shihet te pranimi i furnizimit: i njëjti pranim dy herë nuk shton stok. Pagesat verifikohen me ofruesin.', 'Idempotency shows when receiving a purchase order: the same receipt twice adds no stock. Payments are verified with the provider.') },
      { id: 'return', state: 'demo', to: '/admin/povrati', text: T('Teilretoure mit exakter Menge und Rabatt', 'Kthim i pjesshëm me sasi dhe ulje të saktë', 'Partial return with exact quantity and discount'), how: T('Die Erstattung berechnet sich aus dem netto bezahlten Betrag der Positionen — der auf die Positionen verteilte Rabatt wird berücksichtigt.', 'Rimbursimi llogaritet nga shuma neto e paguar e artikujve — ulja e shpërndarë në artikuj merret parasysh.', 'The refund is the net paid amount of the lines — the discount allocated to them is taken into account.') },
      { id: 'perm', state: 'partial', to: '/admin/konfiguracija/stafi', text: T('Ohne Berechtigung kein Veröffentlichen, Löschen oder Erstatten', 'API refuzon publikimin/fshirjen/rimbursimin pa leje', 'The API refuses publish/delete/refund without permission'), how: T('Wechseln Sie die Rolle im Kontomenü: Menüs und Schaltflächen werden ausgeblendet (Marketing bereitet vor, veröffentlicht aber nicht). Die Ablehnung durch die API wird in der Implementierung geprüft.', 'Ndërroni rolin te menuja e llogarisë: menytë dhe butonat fshihen (Marketingu përgatit, por nuk publikon). Refuzimi në API verifikohet në implementim.', 'Switch the role in the account menu: menus and buttons hide (Marketing prepares but cannot publish). The API refusal is verified in the implementation.') },
    ],
  },
  {
    id: 'promo',
    title: T('Rabatte und Angebote', 'Zbritje dhe oferta', 'Discounts and offers'),
    items: [
      { id: 'four', state: 'demo', to: '/admin/popusti', text: T('Alle vier Arten, per Code oder automatisch', 'Të katër llojet me kod ose automatike', 'All four types, by code or automatic'), how: T('Produkte, Bestellung, Kaufe X erhalte Y und Versand — jeweils per Code oder automatisch.', 'Produkte, porosi, Blej X merr Y dhe dërgesë — secila me kod ose automatike.', 'Products, order, Buy X get Y and shipping — each by code or automatic.') },
      { id: 'threshold', state: 'demo', to: '/admin/popusti', text: T('Schwelle vor/nach Rabatten ist festgelegt', 'Prag para/pas uljeve i specifikuar', 'Threshold before/after discounts is specified'), how: T('TERSUN10 gilt ab 100 € nach Produktrabatten — sichtbar im Warenkorbtest.', 'TERSUN10 vlen nga 100 € pas zbritjeve të produkteve — shihet në testin e shportës.', 'TERSUN10 applies from €100 after product discounts — visible in the cart tester.') },
      { id: 'combine', state: 'demo', to: '/admin/popusti', text: T('Gegenseitige Kombinierbarkeit und bester Wert', 'Kombinim i ndërsjellë dhe best value', 'Mutual combination and best value'), how: T('Beide Regeln müssen die Kombination erlauben; die Engine wählt die größte Ersparnis in Euro, nicht den höchsten Prozentsatz.', 'Të dy rregullat duhet ta lejojnë kombinimin; motori zgjedh kursimin më të madh në euro, jo përqindjen më të lartë.', 'Both rules must allow combining; the engine picks the largest saving in euros, not the highest percentage.') },
      { id: 'cents', state: 'demo', to: '/admin/popusti', text: T('Keine negative Summe, exakte Cents', 'Pa total negativ dhe centë të saktë', 'No negative total, exact cents'), how: T('Die Zahlenbeispiele von S. 26 bestehen den Test der Rabatt-Engine; die Aufteilung auf Positionen erfolgt in Cents.', 'Shembujt numerikë të fq. 26 kalojnë në testin e motorit të zbritjeve; shpërndarja në artikuj bëhet në centë.', 'The numeric examples from p.26 pass the discount-engine test; allocation per line is done in cents.') },
      { id: 'usage', state: 'partial', to: '/admin/popusti', text: T('Atomares Nutzungslimit', 'Kufi përdorimi atomik', 'Atomic usage limit'), how: T('Limit und Nutzungszähler sind vorhanden (z. B. JESEN25); die Atomarität unter Last wird auf dem Server geprüft.', 'Kufiri dhe numëruesi i përdorimeve ekzistojnë (p.sh. JESEN25); atomiciteti nën ngarkesë verifikohet në server.', 'The limit and usage counter exist (e.g. JESEN25); atomicity under load is verified on the server.') },
      { id: 'expiry', state: 'demo', to: '/admin/ponude', text: T('Angebot endet pünktlich', 'Oferta skadon në kohën e duhur', 'An offer expires on time'), how: T('Der Status ergibt sich aus den Daten: Ein abgelaufenes Angebot verschwindet aus Bannern und Leiste, und seine Slides werden deaktiviert.', 'Gjendja llogaritet nga datat: oferta e skaduar largohet nga bannerët dhe shiriti, dhe slide-t e saj fiken.', 'State derives from dates: an expired offer leaves the banners and bar, and its slides switch off.') },
      { id: 'fallback', state: 'demo', to: '/offer/bioclimatic-season-2027', site: true, text: T('Produkt ohne Bestand und inaktive Landingpage', 'Produkt pa stok dhe landing page joaktive trajtohen', 'Out-of-stock product and inactive landing page are handled'), how: T('Ein Entwurf oder abgelaufenes Angebot zeigt „Das Angebot ist beendet“ mit den aktiven Angeboten; Angebotsprüfungen warnen vor Produkten ohne Bestand.', 'Oferta draft ose e skaduar shfaq „Oferta ka përfunduar“ me ofertat aktive; kontrollet e ofertës paralajmërojnë për produktet pa stok.', 'A draft or expired offer shows “This offer has ended” with the live offers; offer checks warn about out-of-stock products.') },
    ],
  },
  {
    id: 'ops',
    title: T('Inhalte und Betrieb', 'Përmbajtje dhe operim', 'Content and operations'),
    items: [
      { id: 'slides', state: 'demo', to: '/admin/prodavnica/slajdovi', text: T('Slide mit Mobil-/Desktop-Bild, gültigem CTA und Alt-Text', 'Slide me media mobile/desktop, CTA e vlefshme dhe tekst alternativ', 'Slide with mobile/desktop media, a valid CTA and alt text'), how: T('Der Slide-Editor prüft den Link, verlangt einen Alt-Text und zeigt beide Formate an.', 'Editori i slide-it kontrollon linkun, kërkon tekst alternativ dhe shfaq të dy formatet.', 'The slide editor checks the link, requires alt text and previews both formats.') },
      { id: 'drafts', state: 'demo', to: '/admin/prodavnica/editor', text: T('Entwürfe sind nicht öffentlich; kontrollierte Veröffentlichung und Wiederherstellung', 'Draftet jo publike; publish/rollback i kontrolluar', 'Drafts are not public; controlled publish/rollback'), how: T('Die Startseite wird als Entwurf bearbeitet, mit einem Klick veröffentlicht und aus dem Versionsverlauf wiederhergestellt.', 'Ballina redaktohet si draft, publikohet me një klik dhe rikthehet nga historia e versioneve.', 'The homepage is edited as a draft, published in one click and restored from version history.') },
      { id: 'forms', state: 'impl', text: T('Formulare ohne Duplikate und Spam', 'Formular pa duplikim/spam', 'Forms without duplicates or spam'), how: T('Der Schutz vor Spam (Honeypot, Ratenbegrenzung) und Duplikaten läuft auf dem Server.', 'Mbrojtja nga spami (honeypot, kufizim frekuence) dhe dublikatat funksionon në server.', 'Spam (honeypot, rate limit) and duplicate protection run on the server.') },
      { id: 'bookings', state: 'demo', to: '/admin/termini', text: T('Termine ohne Überschneidung', 'Termine pa mbivendosje', 'Appointments without overlap'), how: T('Der Kalender lehnt einen Termin ab, wenn der Monteur belegt oder die Kapazität der Leistung ausgeschöpft ist.', 'Kalendari refuzon terminin kur montuesi është i zënë ose kapaciteti i shërbimit është plot.', 'The calendar rejects a booking when the installer is busy or the service is at capacity.') },
      { id: 'notify', state: 'impl', text: T('Benachrichtigungen werden nach einem erneuten Versuch nicht wiederholt', 'Njoftimet nuk përsëriten pas retry', 'Notifications are not repeated after a retry'), how: T('Warteschlange mit Idempotenzschlüssel auf dem Server.', 'Queue me çelës idempotence në server.', 'A server queue with an idempotency key.') },
      { id: 'backup', state: 'partial', to: '/admin/konfiguracija/demo', text: T('Ein Backup lässt sich wiederherstellen', 'Backup rikthehet', 'A backup can be restored'), how: T('Demodaten werden in den Einstellungen exportiert und importiert; ein echtes Backup mit Wiederherstellungstest läuft auf dem Server.', 'Të dhënat demo eksportohen dhe importohen te Konfigurimet; backup-i real me provë rikthimi funksionon në server.', 'Demo data is exported and imported in Settings; a real backup with a restore test runs on the server.') },
      { id: 'second', state: 'impl', text: T('Zweites Projekt ohne Kopieren der Logik', 'Projekti i dytë instalohet pa kopjim logjike', 'A second project installs without copying logic'), how: T('Derselbe Core mit anderer Konfiguration (Marke, Sprachen, Module) — wird im Pilotprojekt geprüft.', 'I njëjti core me konfigurim tjetër (marka, gjuhët, modulet) — verifikohet në projektin pilot.', 'The same core with another configuration (brand, languages, modules) — verified on the pilot project.') },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Decisions for the client (p.51)                                     */
/* ------------------------------------------------------------------ */
export interface Decision {
  id: string;
  q: L10n;
  /** What the demo currently assumes — may contain {staff} {roles} {langs} {tz} {products} {connected} {test} */
  hint?: L10n;
}

export interface DecisionGroup {
  id: string;
  title: L10n;
  items: Decision[];
}

export const DECISIONS: DecisionGroup[] = [
  {
    id: 'identity',
    title: T('Identität und Pilotprojekt', 'Identitet dhe projekti pilot', 'Identity and pilot project'),
    items: [
      { id: 'brand', q: T('Name und Marke des CMS?', 'Emri dhe marka e CMS-it?', 'The CMS name and brand?'), hint: T('In der Demo: „CMS“ mit dem TERSUN-Zeichen', 'Në demo: „CMS“ me shenjën TERSUN', 'In the demo: “CMS” with the TERSUN mark') },
      { id: 'pilot', q: T('Erste Website (Pilot), Produktart und vorhandener Code?', 'Website-i i parë (pilot), tipi i produkteve dhe kodi ekzistues?', 'The first website (pilot), product types and existing code?'), hint: T('Vorschlag: TERSUN — Pergolen, Glasdächer, Glassysteme und ZIP-Screens nach Maß', 'Propozim: TERSUN — pergola, mbuloja xhami, sisteme xhami dhe perde ZIP me porosi', 'Proposal: TERSUN — made-to-measure pergolas, glass roofs, glass systems and ZIP screens') },
      { id: 'staff', q: T('Wer wird das CMS nutzen und mit welchen Rollen?', 'Stafi që do ta përdorë dhe rolet?', 'Who will use it, and with which roles?'), hint: T('In der Demo: {staff} Personen, {roles} Rollen', 'Në demo: {staff} persona, {roles} role', 'In the demo: {staff} people, {roles} roles') },
      { id: 'locale', q: T('Sprachen, Währung, Domain und Zeitzone?', 'Gjuhët, valuta, domeni dhe zona kohore?', 'Languages, currency, domain and time zone?'), hint: T('In der Demo: {langs} · EUR · {tz}', 'Në demo: {langs} · EUR · {tz}', 'In the demo: {langs} · EUR · {tz}') },
      { id: 'catalog', q: T('Katalogumfang und Daten für die Migration?', 'Vëllimi i katalogut dhe të dhënat për migrim?', 'Catalogue size and data to migrate?'), hint: T('In der Demo: {products} Produkte; Import per CSV', 'Në demo: {products} produkte; import me CSV', 'In the demo: {products} products; CSV import') },
    ],
  },
  {
    id: 'promo',
    title: T('Aktionen', 'Promocionet', 'Promotions'),
    items: [
      { id: 'pricing', q: T('Aktionspreis im Katalog oder Rabatt im Warenkorb?', 'Çmimi në katalog apo ulje në checkout?', 'Sale price in the catalogue or a discount at checkout?'), hint: T('In der Demo: beides — Aktionspreis am Produkt und automatische Rabatte im Warenkorb', 'Në demo: të dyja — çmim promocional te produkti dhe zbritje automatike në shportë', 'In the demo: both — a sale price on the product and automatic discounts in the cart') },
      { id: 'combos', q: T('Welche Kombinationen sind erlaubt; Schwellenwerte und Limits?', 'Cilat kombinime lejohen; pragjet dhe kufijtë?', 'Which combinations are allowed; thresholds and limits?'), hint: T('In der Demo: TERSUN10 ist nicht mit anderen Bestellrabatten kombinierbar', 'Në demo: TERSUN10 nuk kombinohet me zbritje tjetër porosie', 'In the demo: TERSUN10 does not combine with another order discount') },
      { id: 'offers', q: T('Für Angebote: Landingpage, Slider, Banner und Zeitplan?', 'Për ofertat: landing page, slideshow, bannerë dhe orar?', 'For offers: landing page, slideshow, banners and schedule?'), hint: T('In der Demo: alle vier, mit demselben Angebot verknüpft', 'Në demo: të katërta, të lidhura me të njëjtën ofertë', 'In the demo: all four, linked to the same offer') },
      { id: 'bxgy', q: T('Geschenk bei „Kaufe X, erhalte Y“ manuell oder automatisch?', 'Dhurata te „Blej X, merr Y“ manuale apo automatike?', 'Is the “Buy X get Y” gift manual or automatic?'), hint: T('In der Demo: automatisch (3 Türen → Türgriff gratis)', 'Në demo: automatike (3 dyer → doreza falas)', 'In the demo: automatic (3 doors → free handle)') },
      { id: 'approval', q: T('Gibt ein Manager vor der Aktivierung frei?', 'Miratim nga menaxheri para aktivizimit?', 'Manager approval before activation?'), hint: T('In der Demo: Marketing bereitet vor, Manager oder Inhaber veröffentlicht', 'Në demo: Marketingu përgatit, menaxheri ose pronari publikon', 'In the demo: Marketing prepares, a manager or the owner publishes') },
    ],
  },
  {
    id: 'integrations',
    title: T('Integrationen und Module', 'Integrimet dhe modulet', 'Integrations and modules'),
    items: [
      { id: 'providers', q: T('Zahlung, Kurier, Fiskalisierung/Buchhaltung und Kanäle — welche Anbieter?', 'Pagesa, korrieri, fiskalizimi/kontabiliteti dhe kanalet — cilët ofrues?', 'Payments, courier, fiscalisation/accounting and channels — which providers?'), hint: T('Stand in der Demo: {connected} verbunden, {test} im Test', 'Gjendja në demo: {connected} e lidhur, {test} në prove', 'Demo status: {connected} connected, {test} in test') },
      { id: 'bookings', q: T('Termine: Buchungen oder Terminanfragen; Zahlung oder Anzahlung?', 'Terminet: rezervime apo kërkesa takimesh; pagesë/depozitë?', 'Appointments: bookings or meeting requests; payment or deposit?'), hint: T('In der Demo: Buchungen, die das Personal bestätigt, ohne Anzahlung', 'Në demo: rezervime që stafi i konfirmon, pa depozitë', 'In the demo: bookings confirmed by staff, no deposit') },
      { id: 'scope', q: T('Werden im ersten Release B2B, POS, mehrere Standorte oder Abonnements benötigt?', 'A duhen B2B, POS, multi-location ose abonim në lëshimin e parë?', 'Are B2B, POS, multi-location or subscriptions needed in the first release?') },
    ],
  },
];
