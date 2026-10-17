// Integrations catalogue (PDF p.06 "Integrime: pagesa, korrier, email, ERP, analitikë", p.40 "Integrime dhe webhook
// endpoints me scopes, status, histori dhe rotacion secrets", p.51 "Pagesa, korrieri, fiskalizimi/kontabiliteti").
// Everything here is a DEMO description: nothing connects to a real service.
import type { ComponentType } from 'react';
import { ChartColumn, CreditCard, Database, Mail, Receipt, Truck } from 'lucide-react';
import type { Integration, IntegrationKind, L10n, Order } from '@/lib/types';

const T = (de: string, sq: string, en: string): L10n => ({ de, sq, en });

export const KINDS: IntegrationKind[] = ['payment', 'courier', 'email', 'fiscal', 'analytics', 'erp'];

export interface IntegrationX extends Integration {
  provider?: string;
  scopes?: string[];
  env?: 'test' | 'live';
  lastSync?: string;
  /** demo connection log entries, newest first */
  log?: { at: string; level: 'ok' | 'warn' | 'error'; text: L10n }[];
}

export interface KindMeta {
  icon: ComponentType<{ className?: string }>;
  label: L10n;
  title: L10n;
  desc: L10n;
  providers: { id: string; name: string; note: L10n }[];
  scopes: { id: string; label: L10n; required?: boolean }[];
}

export const KIND_META: Record<IntegrationKind, KindMeta> = {
  payment: {
    icon: CreditCard,
    label: T('Zahlungen', 'Pagesa', 'Payments'),
    title: T('Kartenzahlung', 'Pagesa me kartelë', 'Card payments'),
    desc: T('Online-Kartenzahlung, Autorisierung, Abbuchung und Rückerstattung. Das CMS speichert nur Transaktionsreferenzen, niemals Kartennummern.', 'Pagesë online me kartelë, autorizim, capture dhe rimbursim. CMS ruan vetëm referenca transaksioni, jo numra kartash.', 'Online card payments, authorisation, capture and refunds. The CMS stores transaction references only, never card numbers.'),
    providers: [
      { id: 'bank', name: 'Banka · e-commerce', note: T('Vertrag mit einer Bank in Kosovo', 'Kontratë me një bankë në Kosovë', 'Contract with a Kosovar bank') },
      { id: 'monri', name: 'Monri WebPay', note: T('Regionaler Kartenabwickler', 'Procesor rajonal kartelash', 'Regional card processor') },
      { id: 'stripe', name: 'Stripe', note: T('Internationaler Abwickler', 'Procesor ndërkombëtar', 'International processor') },
    ],
    scopes: [
      { id: 'payments:write', label: T('Zahlungen erstellen und abbuchen', 'Krijo dhe kap pagesa', 'Create and capture payments'), required: true },
      { id: 'refunds:write', label: T('Rückerstattungen', 'Rimburso', 'Refunds') },
      { id: 'webhooks:read', label: T('Webhook-Benachrichtigungen (signiert)', 'Njoftime webhook (të nënshkruara)', 'Webhook notifications (signed)'), required: true },
    ],
  },
  courier: {
    icon: Truck,
    label: T('Kurier', 'Korrier', 'Courier'),
    title: T('Kurierdienst', 'Shërbimi i korrierit', 'Courier service'),
    desc: T('Sendungen und Etiketten erstellen, Sendungsnummer in der Bestellung und Benachrichtigung an den Kunden.', 'Krijim dërgesash dhe etiketash, numri i gjurmimit në porosi dhe njoftim për klientin.', 'Shipments and labels, tracking number on the order and a customer notification.'),
    providers: [
      { id: 'posta', name: 'Posta e Kosovës', note: T('Nationale Post', 'Posta kombëtare', 'National post') },
      { id: 'cityexpress', name: 'City Express', note: T('Regionaler Kurier', 'Korrier në rajon', 'Regional courier') },
      { id: 'dhl', name: 'DHL Express', note: T('Internationale Sendungen', 'Dërgesa ndërkombëtare', 'International shipments') },
    ],
    scopes: [
      { id: 'shipments:write', label: T('Sendungen und Etiketten', 'Dërgesa dhe etiketa', 'Shipments and labels'), required: true },
      { id: 'tracking:read', label: T('Sendungsverfolgung', 'Gjurmimi i dërgesës', 'Shipment tracking'), required: true },
      { id: 'pickups:write', label: T('Abholungen planen', 'Porosit marrje', 'Schedule pickups') },
    ],
  },
  email: {
    icon: Mail,
    label: T('E-mail', 'E-mail', 'E-mail'),
    title: T('Transaktions-E-Mail', 'E-mail transaksionalë', 'Transactional e-mail'),
    desc: T('Bestätigungen für Bestellungen, Zahlungen, Versand, Retouren, Kontakte und Termine — mit Versandprotokoll und erneuten Zustellversuchen.', 'Konfirmime porosie, pagese, dërgese, kthimi, kontakti dhe termini — me log dërgimi dhe riprovim.', 'Order, payment, shipping, return, contact and booking confirmations — with a send log and retries.'),
    providers: [
      { id: 'smtp', name: 'SMTP (info@tersun.com)', note: T('Bestehender Mailserver', 'Serveri ekzistues i postës', 'Existing mail server') },
      { id: 'postmark', name: 'Postmark', note: T('Dienst für Transaktions-E-Mails', 'Shërbim për e-mail transaksionalë', 'Transactional e-mail service') },
      { id: 'ses', name: 'Amazon SES', note: T('Hohes Versandvolumen', 'Vëllim i madh dërgimi', 'High sending volume') },
    ],
    scopes: [
      { id: 'messages:send', label: T('Nachrichten senden', 'Dërgo mesazhe', 'Send messages'), required: true },
      { id: 'templates:read', label: T('Vorlagen', 'Shabllonet', 'Templates') },
      { id: 'bounces:read', label: T('Unzustellbare Nachrichten (Bounce)', 'Mesazhet e kthyera (bounce)', 'Bounces') },
    ],
  },
  fiscal: {
    icon: Receipt,
    label: T('Fiskalisierung', 'Fiskalizimi', 'Fiscalisation'),
    title: T('Fiskalisierung', 'Fiskalizimi', 'Fiscalisation'),
    desc: T('Registrierung von Rechnungen bei der Steuerbehörde und Speicherung der Fiskalcodes auf der Rechnung. Das CMS ersetzt nicht die fiskalische Spezifikation.', 'Regjistrimi i faturës te administrata tatimore dhe ruajtja e kodeve fiskale në faturë. CMS nuk zëvendëson specifikimin fiskal.', 'Registers invoices with the tax authority and stores the fiscal codes on the invoice. The CMS does not replace the fiscal specification.'),
    providers: [
      { id: 'efi', name: 'ATK — Administrata Tatimore e Kosovës', note: T('Direkt, mit dem Firmenzertifikat', 'Drejtpërdrejt, me certifikatën e kompanisë', 'Direct, with the company certificate') },
      { id: 'accounting', name: 'ERP / POS', note: T('Fiskalisierung durch die Buchhaltungssoftware', 'Fiskalizon kontabiliteti', 'Fiscalised by the accounting software') },
    ],
    scopes: [
      { id: 'invoices:fiscalize', label: T('Rechnungen fiskalisieren', 'Fiskalizo faturat', 'Fiscalise invoices'), required: true },
      { id: 'invoices:read', label: T('Rechnungsstatus', 'Statusi i faturave', 'Invoice status'), required: true },
      { id: 'cash:write', label: T('Bargeldeinzahlung', 'Depozita e arkës', 'Cash deposit') },
    ],
  },
  analytics: {
    icon: ChartColumn,
    label: T('Analytik', 'Analitikë', 'Analytics'),
    title: T('Besuchs- und Conversion-Tracking', 'Matja e vizitave dhe konvertimeve', 'Visit and conversion tracking'),
    desc: T('Strukturierte Ereignisse: Besuch, Warenkorb, Checkout, Kauf, UTM und Angebotsklicks — unter Beachtung der Cookie-Einwilligung.', 'Ngjarje të strukturuara: vizitë, shportë, checkout, blerje, UTM dhe klikime ofertash — duke respektuar pëlqimin për cookies.', 'Structured events: visit, cart, checkout, purchase, UTM and offer clicks — respecting cookie consent.'),
    providers: [
      { id: 'ga4', name: 'Google Analytics 4', note: T('Kostenlos, Standard', 'Falas, standard', 'Free, standard') },
      { id: 'plausible', name: 'Plausible', note: T('Ohne Cookies', 'Pa cookies', 'Cookie-less') },
      { id: 'meta', name: 'Meta Pixel', note: T('Social-Media-Kampagnen', 'Fushata në rrjete', 'Social campaigns') },
    ],
    scopes: [
      { id: 'events:write', label: T('Ereignisse senden', 'Dërgo ngjarje', 'Send events'), required: true },
      { id: 'consent:read', label: T('Cookie-Einwilligung', 'Pëlqimi për cookies', 'Cookie consent'), required: true },
      { id: 'reports:read', label: T('Berichte im CMS lesen', 'Lexo raportet në CMS', 'Read reports in the CMS') },
    ],
  },
  erp: {
    icon: Database,
    label: T('ERP / Buchhaltung', 'ERP / kontabilitet', 'ERP / accounting'),
    title: T('ERP und Buchhaltung', 'ERP dhe kontabiliteti', 'ERP and accounting'),
    desc: T('Synchronisierung von Artikeln, Lagerbeständen, Bestellungen und Rechnungen mit der Buchhaltung. Wird bei Bedarf aktiviert, mit Spezifikation und Tests.', 'Sinkronizim artikujsh, stoku, porosish dhe faturash me kontabilitetin. Aktivizohet sipas nevojës, me specifikim dhe prova.', 'Syncs items, stock, orders and invoices with accounting. Switched on when needed, with a specification and tests.'),
    providers: [
      { id: 'pantheon', name: 'Pantheon', note: T('Regionales ERP', 'ERP në rajon', 'Regional ERP') },
      { id: 'minimax', name: 'Minimax', note: T('Online-Buchhaltung', 'Kontabilitet online', 'Online accounting') },
      { id: 'csv', name: 'CSV / API', note: T('Export für das bestehende System', 'Eksport për sistemin ekzistues', 'Export for the existing system') },
    ],
    scopes: [
      { id: 'products:read', label: T('Artikel und Lagerbestand', 'Artikuj dhe stok', 'Items and stock'), required: true },
      { id: 'orders:write', label: T('Bestellungen senden', 'Dërgo porositë', 'Send orders'), required: true },
      { id: 'invoices:read', label: T('Rechnungen', 'Faturat', 'Invoices') },
    ],
  },
};

/** Localised versions of the seeded notes (the stored note has a single language). */
export const SEEDED_NOTES: Record<string, L10n> = {
  'int-payment': T('Testmodus — Karten werden nicht belastet. Live-Schlüssel nach dem Bankvertrag.', 'Mjedis prove — kartelat nuk ngarkohen. Çelësat e prodhimit pas kontratës me bankën.', 'Test mode — cards are not charged. Live keys after the bank contract.'),
  'int-courier': T('Systeme montieren unsere eigenen Teams; Zubehör geht per Kurier — die API hängt vom gewählten Partner ab.', 'Sistemet i montojnë ekipet tona; aksesorët dërgohen me korrier — API sipas partnerit të zgjedhur.', 'Systems are installed by our own crews; accessories ship by courier — the API depends on the chosen partner.'),
  'int-email': T('Bestell- und Terminbestätigungen werden von info@tersun.com versendet.', 'Konfirmimet e porosive dhe termineve dërgohen nga info@tersun.com.', 'Order and booking confirmations are sent from info@tersun.com.'),
  'int-fiscal': T('Anbindung an das Steuersystem — geplant für Phase 2.', 'Lidhja me sistemin tatimor — e planifikuar për fazën 2.', 'Connection to the tax system — planned for phase 2.'),
  'int-analytics': T('Besuchs- und Conversion-Tracking in einer Test-Property.', 'Matja e vizitave dhe konvertimeve në një property prove.', 'Visit and conversion tracking in a test property.'),
};

export const DEFAULT_PROVIDER: Partial<Record<IntegrationKind, string>> = { payment: 'bank', email: 'smtp', analytics: 'ga4' };

/** Every kind has a card: kinds missing from settings show as "not connected". */
export function integrationList(stored: Integration[]): IntegrationX[] {
  return KINDS.map((kind) => {
    const found = stored.find((i) => i.kind === kind) as IntegrationX | undefined;
    const base: IntegrationX = found ?? { id: `int-${kind}`, kind, name: KIND_META[kind].title.de, status: 'disconnected', note: '' };
    return {
      ...base,
      provider: base.provider ?? (base.status !== 'disconnected' ? DEFAULT_PROVIDER[kind] : undefined),
      scopes: base.scopes ?? (base.status !== 'disconnected' ? KIND_META[kind].scopes.map((s) => s.id) : []),
      env: base.env ?? (base.status === 'connected' ? 'live' : base.status === 'test' ? 'test' : undefined),
    };
  });
}

export const maskEmail = (e: string) => {
  const [u, d] = e.split('@');
  return d ? `${u.slice(0, 1)}•••@${d}` : e;
};

/** Demo activity log, derived from real store data so it changes with the demo. */
export function demoLog(x: IntegrationX, orders: Order[], now: Date): { at: string; level: 'ok' | 'warn' | 'error'; text: L10n }[] {
  const out = [...(x.log ?? [])];
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const min = (n: number) => new Date(now.getTime() - n * 60000).toISOString();
  if (x.kind === 'payment' && x.status !== 'disconnected') {
    for (const o of recent.filter((o) => o.payment.method === 'card').slice(0, 4))
      out.push({ at: o.createdAt, level: 'ok', text: T(`payment.succeeded — ${o.number} · Webhook-Signatur verifiziert`, `payment.succeeded — ${o.number} · nënshkrimi i webhook-ut u verifikua`, `payment.succeeded — ${o.number} · webhook signature verified`) });
    out.push({ at: min(60 * 26), level: 'warn', text: T('Testmodus: Karten werden nicht belastet', 'Mjedis prove: kartelat nuk ngarkohen', 'Test mode: cards are not charged') });
  }
  if (x.kind === 'email' && x.status !== 'disconnected') {
    for (const o of recent.slice(0, 5))
      out.push({ at: o.createdAt, level: 'ok', text: T(`Gesendet: „Wir haben Ihre Bestellung ${o.number} erhalten“ → ${maskEmail(o.customer.email)}`, `U dërgua „E morëm porosinë tuaj ${o.number}“ → ${maskEmail(o.customer.email)}`, `Sent “We received your order ${o.number}” → ${maskEmail(o.customer.email)}`) });
    out.push({ at: min(60 * 30), level: 'warn', text: T('1 Nachricht unzustellbar (Bounce) — erneuter Versuch geplant', '1 mesazh u kthye (bounce) — riprovimi u planifikua', '1 message bounced — retry scheduled') });
  }
  if (x.kind === 'analytics' && x.status !== 'disconnected') {
    out.push({ at: min(9), level: 'ok', text: T('312 Ereignisse (page_view, add_to_cart, purchase) an die Test-Property gesendet', 'U dërguan 312 ngjarje (page_view, add_to_cart, purchase) në property prove', '312 events sent (page_view, add_to_cart, purchase) to the test property') });
    out.push({ at: min(60 * 5), level: 'warn', text: T('18 % der Besucher haben Analyse-Cookies abgelehnt — werden nicht erfasst', '18 % e vizitorëve refuzuan cookies analitike — nuk maten', '18% of visitors declined analytics cookies — not measured') });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}
