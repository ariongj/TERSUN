import { Fragment, useEffect, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, FileX2, Printer } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { LangSwitcher } from '@/components/LangSwitcher';
import { Button, ButtonLink } from '@/components/ui/Button';
import { installationAmount, lineUnits, localizeLine } from '@/admin/components/orders/helpers';
import { defineDict, useDict, useL, useLang } from '@/i18n';
import { common } from '@/i18n/common';
import { useDb } from '@/store/db';
import { useSettings } from '@/store/hooks';
import { date, money, num, unitLabel } from '@/lib/format';
import { cn, round2 } from '@/lib/utils';
import { paymentOf, refundedOf } from '@/lib/orders';
import type { Order } from '@/lib/types';

/**
 * VAT rate (%) the order was placed at: stored on newer orders (`order.vatRate`); older orders get it back from
 * their own VAT amount and total — never from the current setting. null = cannot tell (nothing charged).
 */
function vatRateOf(o: Order): number | null {
  if (typeof o.vatRate === 'number') return o.vatRate;
  const net = o.total - (o.vat || 0);
  if (o.vat > 0 && net > 0) {
    const r = (o.vat / net) * 100;
    return Math.abs(r - Math.round(r)) < 0.3 ? Math.round(r) : Math.round(r * 10) / 10;
  }
  return o.total > 0 ? 0 : null;
}

/** When the order was paid: the first payment event that is not a refund; card orders are paid at checkout. */
function paidAtOf(o: Order): string | undefined {
  const refundTimes = new Set((o.refunds ?? []).map((r) => r.at));
  const ev = o.timeline.find((e) => e.status === 'payment' && !refundTimes.has(e.at) && !(e.note && /refund|RT-\d/i.test(e.note)));
  if (ev) return ev.at;
  if (o.payment.method === 'card') return o.createdAt;
  if (o.payment.method === 'cod') return o.timeline.find((e) => e.status === 'completed')?.at;
  return undefined;
}

const T = defineDict({
  de: {
    docTitle: 'Proforma / Rechnung',
    docNo: 'Nr. {n}',
    back: 'Zurück zur Bestellung',
    print: 'Drucken / PDF',
    preview: 'Druckvorschau',
    seller: 'Verkäufer',
    buyer: 'Rechnungsempfänger',
    delivery: 'Lieferung & Zahlung',
    issued: 'Ausstellungsdatum',
    orderDate: 'Bestelldatum',
    place: 'Ausstellungsort',
    due: 'Zahlungsziel',
    currency: 'Währung',
    pib: 'Steuernummer',
    pdv: 'USt-IdNr.',
    account: 'Bankkonto',
    tel: 'Tel.',
    email: 'E-Mail',
    company: 'Firma',
    country: 'Kosovo',
    col_no: 'Pos.',
    col_desc: 'Beschreibung',
    col_qty: 'Menge',
    col_unit: 'Einh.',
    col_price: 'Preis',
    col_amount: 'Betrag',
    sku: 'Art.-Nr.',
    packs: '{n} Pak. × {size} m²',
    installFor: 'Montage — {name}',
    shippingLine: 'Lieferung — {city}',
    discountLine: 'Rabatt (Gutschein {code})',
    discountPlain: 'Rabatt',
    unit_service: 'Leist.',
    base: 'Nettobetrag (ohne MwSt.)',
    vat: 'MwSt. {rate}%',
    toPay: 'Zu zahlender Gesamtbetrag',
    paidStamp: 'Bezahlt',
    payTitle: 'Zahlungshinweise',
    payMethod: 'Gewählte Zahlungsart',
    recipient: 'Empfänger',
    bank: 'Bank',
    reference: 'Verwendungszweck-Referenz',
    amount: 'Betrag',
    purpose: 'Verwendungszweck',
    purposeText: 'Zahlung zur Proforma-Rechnung {n}',
    note_cod: 'Der Betrag wird bei Lieferung oder Abholung der Ware bezahlt.',
    note_card: 'Die Bestellung wurde per Karte über den Onlineshop bezahlt.',
    note_bank: 'Bitte überweisen Sie den Betrag innerhalb von 8 Tagen unter Angabe der Referenz aus diesem Dokument.',
    thanks: 'Vielen Dank für Ihr Vertrauen!',
    thanksText: 'Bei Fragen zu Ihrer Bestellung, Lieferung oder Montage erreichen Sie uns unter {phone} oder {email}.',
    legal: 'Dieses Dokument wurde elektronisch erstellt und ist ohne Stempel und Unterschrift gültig. Alle Preise in Euro inkl. MwSt.',
    notFound: 'Bestellung nicht gefunden',
    notFoundText: 'Die Rechnung kann nicht angezeigt werden, da die Bestellung nicht existiert.',
    toOrders: 'Alle Bestellungen',
    vatPlain: 'MwSt.',
    total: 'Gesamtbetrag',
    totalPaid: 'Bezahlter Gesamtbetrag',
    refundedRow: 'Erstattet',
    netPaid: 'Netto bezahlt (nach Erstattungen)',
    nothingToPay: 'Nichts zu zahlen',
    stamp_partially_refunded: 'Teilw. erstattet',
    stamp_refunded: 'Erstattet',
    stamp_cancelled: 'Storniert',
    cancelledBanner: 'Bestellung storniert — dieses Dokument ist keine Zahlungsaufforderung.',
    cancelledOn: 'Storniert am',
    paidOn: 'Bezahlt am',
    paymentTitle: 'Zahlung',
    status: 'Status',
    refundOn: 'Erstattung {date}',
    note_paid: 'Der Betrag wurde vollständig bezahlt. Es ist keine weitere Zahlung erforderlich.',
    note_partly: 'Ein Teil des Betrags wurde erstattet. Es ist keine weitere Zahlung erforderlich.',
    note_refunded: 'Der gesamte Betrag wurde erstattet. Es ist keine Zahlung erforderlich.',
    note_cancelled: 'Die Bestellung wurde storniert. Es ist keine Zahlung erforderlich.',
    note_cancelledRefund: 'Die Bestellung wurde storniert; bereits bezahlte Beträge wurden erstattet. Es ist keine Zahlung erforderlich.',
    note_cardPending: 'Die Kartenzahlung ist noch nicht abgeschlossen.',
  },
  sq: {
    docTitle: 'Parafaturë / Faturë',
    docNo: 'nr. {n}',
    back: 'Kthehu te porosia',
    print: 'Printo / PDF',
    preview: 'Parapamje për printim',
    seller: 'Shitësi',
    buyer: 'Blerësi',
    delivery: 'Dorëzimi dhe pagesa',
    issued: 'Data e lëshimit',
    orderDate: 'Data e porosisë',
    place: 'Vendi i lëshimit',
    due: 'Afati i pagesës',
    currency: 'Monedha',
    pib: 'NUI',
    pdv: 'Nr. i TVSH-së',
    account: 'Llogaria bankare',
    tel: 'Tel.',
    email: 'E-mail',
    company: 'Kompania',
    country: 'Kosova',
    col_no: 'Nr.',
    col_desc: 'Përshkrimi',
    col_qty: 'Sasia',
    col_unit: 'Njës.',
    col_price: 'Çmimi',
    col_amount: 'Shuma',
    sku: 'Kodi',
    packs: '{n} pako × {size} m²',
    installFor: 'Montimi — {name}',
    shippingLine: 'Transporti — {city}',
    discountLine: 'Zbritje (kuponi {code})',
    discountPlain: 'Zbritje',
    unit_service: 'shërb.',
    base: 'Baza (pa TVSH)',
    vat: 'TVSH {rate}%',
    toPay: 'Totali për pagesë',
    paidStamp: 'E paguar',
    payTitle: 'Udhëzime për pagesë',
    payMethod: 'Mënyra e zgjedhur e pagesës',
    recipient: 'Përfituesi',
    bank: 'Banka',
    reference: 'Referenca',
    amount: 'Shuma',
    purpose: 'Qëllimi i pagesës',
    purposeText: 'Pagesë sipas parafaturës {n}',
    note_cod: 'Shuma paguhet në momentin e dorëzimit ose të marrjes së mallit.',
    note_card: 'Porosia është paguar me kartelë përmes dyqanit online.',
    note_bank: 'Ju lutemi kryeni pagesën brenda 8 ditëve, duke shënuar referencën e këtij dokumenti.',
    thanks: 'Faleminderit për besimin!',
    thanksText: 'Për çdo pyetje rreth porosisë, dorëzimit ose montimit jemi në dispozicionin tuaj në {phone} ose {email}.',
    legal: 'Dokumenti është lëshuar elektronikisht dhe është i vlefshëm pa vulë dhe nënshkrim. Çmimet janë në euro me TVSH të përfshirë.',
    notFound: 'Porosia nuk u gjet',
    notFoundText: 'Fatura nuk mund të shfaqet sepse porosia nuk ekziston.',
    toOrders: 'Të gjitha porositë',
    vatPlain: 'TVSH',
    total: 'Totali',
    totalPaid: 'Totali i paguar',
    refundedRow: 'E rimbursuar',
    netPaid: 'Neto e paguar (pas rimbursimeve)',
    nothingToPay: 'Asgjë për të paguar',
    stamp_partially_refunded: 'Rimbursuar pjesërisht',
    stamp_refunded: 'E rimbursuar',
    stamp_cancelled: 'E anuluar',
    cancelledBanner: 'Porosia është anuluar — ky dokument nuk është kërkesë për pagesë.',
    cancelledOn: 'Anuluar më',
    paidOn: 'Paguar më',
    paymentTitle: 'Pagesa',
    status: 'Statusi',
    refundOn: 'Rimbursim {date}',
    note_paid: 'Shuma është paguar plotësisht. Nuk nevojitet pagesë tjetër.',
    note_partly: 'Një pjesë e shumës është rimbursuar. Nuk nevojitet pagesë tjetër.',
    note_refunded: 'E gjithë shuma është rimbursuar. Nuk nevojitet pagesë.',
    note_cancelled: 'Porosia është anuluar. Nuk nevojitet pagesë.',
    note_cancelledRefund: 'Porosia është anuluar; shumat e paguara janë rimbursuar. Nuk nevojitet pagesë.',
    note_cardPending: 'Pagesa me kartelë ende nuk është përfunduar.',
  },
  en: {
    docTitle: 'Proforma / Invoice',
    docNo: 'no. {n}',
    back: 'Back to order',
    print: 'Print / PDF',
    preview: 'Print preview',
    seller: 'Seller',
    buyer: 'Bill to',
    delivery: 'Delivery & payment',
    issued: 'Issue date',
    orderDate: 'Order date',
    place: 'Place of issue',
    due: 'Payment due',
    currency: 'Currency',
    pib: 'Tax ID',
    pdv: 'VAT no.',
    account: 'Bank account',
    tel: 'Tel.',
    email: 'E-mail',
    company: 'Company',
    country: 'Kosovo',
    col_no: 'No.',
    col_desc: 'Description',
    col_qty: 'Qty',
    col_unit: 'Unit',
    col_price: 'Price',
    col_amount: 'Amount',
    sku: 'SKU',
    packs: '{n} packs × {size} m²',
    installFor: 'Installation — {name}',
    shippingLine: 'Delivery — {city}',
    discountLine: 'Discount (coupon {code})',
    discountPlain: 'Discount',
    unit_service: 'svc.',
    base: 'Tax base (excl. VAT)',
    vat: 'VAT {rate}%',
    toPay: 'Total to pay',
    paidStamp: 'Paid',
    payTitle: 'Payment instructions',
    payMethod: 'Selected payment method',
    recipient: 'Beneficiary',
    bank: 'Bank',
    reference: 'Reference',
    amount: 'Amount',
    purpose: 'Payment purpose',
    purposeText: 'Payment for proforma {n}',
    note_cod: 'The amount is paid on delivery or when collecting the goods.',
    note_card: 'This order was paid by card through the online shop.',
    note_bank: 'Please pay within 8 days, quoting the reference shown on this document.',
    thanks: 'Thank you for your trust!',
    thanksText: 'For any questions about your order, delivery or installation, reach us at {phone} or {email}.',
    legal: 'This document was issued electronically and is valid without stamp or signature. Prices are in euros and include VAT.',
    notFound: 'Order not found',
    notFoundText: 'The invoice cannot be shown because the order does not exist.',
    toOrders: 'All orders',
    vatPlain: 'VAT',
    total: 'Total',
    totalPaid: 'Total paid',
    refundedRow: 'Refunded',
    netPaid: 'Net paid (after refunds)',
    nothingToPay: 'Nothing to pay',
    stamp_partially_refunded: 'Part refunded',
    stamp_refunded: 'Refunded',
    stamp_cancelled: 'Cancelled',
    cancelledBanner: 'Order cancelled — this document is not a request for payment.',
    cancelledOn: 'Cancelled on',
    paidOn: 'Paid on',
    paymentTitle: 'Payment',
    status: 'Status',
    refundOn: 'Refund {date}',
    note_paid: 'This amount has been paid in full. No further payment is needed.',
    note_partly: 'Part of the amount has been refunded. No further payment is needed.',
    note_refunded: 'The full amount has been refunded. No payment is needed.',
    note_cancelled: 'This order was cancelled. No payment is needed.',
    note_cancelledRefund: 'This order was cancelled; any amount paid has been refunded. No payment is needed.',
    note_cardPending: 'The card payment has not been completed yet.',
  },
});

/** Page-level print rules: A4, no browser margins (the sheet carries its own), keep colours. */
const PRINT_CSS = `
@page { size: A4; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;

export default function Invoice() {
  const { id } = useParams();
  const t = useDict(T, 'admin');
  const order = useDb((s) => s.orders.find((o) => o.id === id || o.number === id));
  const companyName = useDb((s) => s.settings.companyName);

  useEffect(() => {
    const prev = document.title;
    document.title = order ? `${order.number} — ${companyName}` : companyName;
    return () => {
      document.title = prev;
    };
  }, [order, companyName]);

  return (
    <div className="min-h-screen bg-canvas pb-16 print:min-h-0! print:bg-white print:p-0!">
      <style>{PRINT_CSS}</style>
      <div className="no-print sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[calc(210mm+2rem)] items-center gap-2 px-4">
          {order ? (
            <Link to={`/admin/narudzbe/${order.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-ink-soft hover:bg-ink/[0.05] hover:text-ink">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('back')}</span>
            </Link>
          ) : (
            <span />
          )}
          {order && (
            <span className="ml-1 hidden truncate text-[13px] text-muted md:inline">
              {t('preview')} · <span className="font-semibold text-ink">{order.number}</span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <LangSwitcher scope="admin" compact />
            {order && (
              <Button size="sm" shape="rounded" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                {t('print')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {order ? (
        <div className="px-3 pt-6 sm:px-4 sm:pt-10 print:p-0!">
          <Sheet order={order} />
        </div>
      ) : (
        <div className="mx-auto mt-16 max-w-md px-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand text-ink-soft">
            <FileX2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-ink">{t('notFound')}</h1>
          <p className="mt-1.5 text-sm text-muted">{t('notFoundText')}</p>
          <ButtonLink to="/admin/narudzbe" variant="dark" size="sm" shape="rounded" className="mt-6">
            {t('toOrders')}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

type InvoiceRow = { key: string; desc: ReactNode; sub?: ReactNode; qty: string; unit: string; price: number | null; amount: number; muted?: boolean };

function Sheet({ order }: { order: Order }) {
  const t = useDict(T, 'admin');
  const tc = useDict(common, 'admin');
  const lang = useLang('admin');
  const s = useSettings();
  const products = useDb((st) => st.products);
  const rules = useDb((st) => st.discounts);
  const tl = useL('admin');
  const c = order.customer;

  // payment state: refunds and cancellation change what the document asks for
  const pay = paymentOf(order);
  const cancelled = order.status === 'cancelled';
  const settled = pay === 'paid' || pay === 'partially_refunded' || pay === 'refunded';
  const refunded = refundedOf(order);
  const net = round2(Math.max(0, order.total - refunded));
  const paidAt = settled ? paidAtOf(order) : undefined;
  const cancelledAt = cancelled ? [...order.timeline].reverse().find((e) => e.status === 'cancelled')?.at : undefined;
  const refunds = order.refunds?.length ? order.refunds : refunded > 0 ? [{ id: 'all', at: cancelledAt ?? order.createdAt, amount: refunded }] : [];
  const awaiting = !cancelled && !settled;

  // the document's own date: when it was paid, otherwise the order date (not today)
  const issued = paidAt ?? order.createdAt;
  const dueDate = new Date(new Date(order.createdAt).getTime() + 8 * 86400000).toISOString();
  const d = (iso: string) => date(iso, lang, { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Build invoice rows: products, their installation, delivery, discount
  const rows: InvoiceRow[] = [];
  order.items.forEach((l, i) => {
    const loc = localizeLine(l, products.find((p) => p.id === l.productId), order.lang, lang);
    const units = lineUnits(l);
    const sub = [`${t('sku')} ${l.sku}`, loc.options, l.unit === 'm2' && l.packSize ? t('packs', { n: l.qty, size: num(l.packSize, lang) }) : ''].filter(Boolean).join(' · ');
    rows.push({ key: `p${i}`, desc: loc.name, sub, qty: num(units, lang), unit: unitLabel(l.unit, lang), price: l.unitPrice, amount: l.lineTotal });
    const inst = installationAmount(l);
    if (inst > 0) rows.push({ key: `i${i}`, desc: t('installFor', { name: loc.name }), qty: num(units, lang), unit: unitLabel(l.unit, lang), price: l.installationPrice, amount: inst });
  });
  if (order.shipping > 0) rows.push({ key: 'ship', desc: t('shippingLine', { city: c.city }), sub: tc(`delivery_${order.delivery.method}`), qty: '1', unit: t('unit_service'), price: order.shipping, amount: order.shipping });
  // one row per applied product / order discount (the shipping discount is already reflected in the delivery row)
  const applied = (order.discounts ?? []).filter((a) => a.kind !== 'shipping' && a.amount > 0);
  if (applied.length)
    for (const a of applied) {
      const rule = rules.find((r) => r.id === a.id);
      const name = (rule && tl(rule.publicTitle)) || a.title;
      rows.push({ key: `disc-${a.id}`, desc: a.code ? t('discountLine', { code: a.code }) : t('discountPlain'), sub: name, qty: '', unit: '', price: null, amount: -a.amount, muted: true });
    }
  else if (order.discount > 0)
    rows.push({ key: 'disc', desc: order.coupon?.code ? t('discountLine', { code: order.coupon.code }) : t('discountPlain'), qty: '', unit: '', price: null, amount: -order.discount, muted: true });

  const rate = vatRateOf(order);
  const vat = order.vat > 0 ? order.vat : rate ? round2(order.total - order.total / (1 + rate / 100)) : 0;
  const base = round2(order.total - vat);
  const stamp = cancelled ? 'stamp_cancelled' : pay === 'refunded' ? 'stamp_refunded' : pay === 'partially_refunded' ? 'stamp_partially_refunded' : pay === 'paid' ? 'paidStamp' : null;
  const payNote = cancelled
    ? refunded > 0
      ? t('note_cancelledRefund')
      : t('note_cancelled')
    : pay === 'refunded'
      ? t('note_refunded')
      : pay === 'partially_refunded'
        ? t('note_partly')
        : settled
          ? t('note_paid')
          : order.payment.method === 'card'
            ? t('note_cardPending')
            : t(`note_${order.payment.method}`);
  const payRows: [string, ReactNode][] = awaiting
    ? [
        [t('recipient'), s.legalName],
        [t('bank'), s.bankName],
        [t('account'), <span className="font-semibold tracking-wide tabular-nums">{s.bankAccount}</span>],
        [t('reference'), <span className="font-bold tracking-wide text-brand-700">{order.number}</span>],
        [t('amount'), <span className="font-semibold">{money(net, lang)}</span>],
        [t('purpose'), t('purposeText', { n: order.number })],
      ]
    : [
        [t('status'), <span className="font-semibold">{cancelled ? t('stamp_cancelled') : tc(`paystatus_${order.payment.status}`)}</span>],
        ...(paidAt ? ([[t('paidOn'), d(paidAt)]] as [string, ReactNode][]) : []),
        ...(settled ? ([[t('totalPaid'), <span className="font-semibold tabular-nums">{money(order.total, lang)}</span>]] as [string, ReactNode][]) : []),
        ...refunds.map((r): [string, ReactNode] => [t('refundOn', { date: d(r.at) }), <span className="font-semibold tabular-nums">− {money(r.amount, lang)}</span>]),
        [t('reference'), <span className="font-bold tracking-wide text-brand-700">{order.number}</span>],
      ];

  return (
    <article className="print-sheet relative mx-auto w-full max-w-[210mm] bg-white px-5 py-7 text-[12px] leading-normal text-ink shadow-[0_1px_2px_rgb(28_26_23/0.06),0_24px_60px_-28px_rgb(28_26_23/0.35)] ring-1 ring-line/70 sm:min-h-[297mm] sm:px-[14mm] sm:py-[12mm] print:min-h-0! print:ring-0!">
      {/* brand rule */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-brand-600" />

      {cancelled && (
        <p className="mb-4 rounded-md border-2 border-red-600 px-3 py-2 text-center text-[12px] font-extrabold uppercase tracking-[0.12em] text-red-700">{t('cancelledBanner')}</p>
      )}

      {/* Header: company + document meta */}
      <header className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div>
          <Logo tagline className="h-10" />
          <div className="mt-3 space-y-px text-[11.5px] text-ink-soft">
            <p className="text-[13px] font-extrabold text-ink">{s.legalName}</p>
            <p>
              {s.address}, {s.city}, {t('country')}
            </p>
            <p>
              {t('pib')}: {s.pib} · {t('pdv')}: {s.pdv}
            </p>
            <p>
              {t('account')}: {s.bankAccount} ({s.bankName})
            </p>
            <p>
              {t('tel')} {s.phone} · {s.email}
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <h1 className="display text-[26px] leading-tight text-ink sm:text-[30px]">{t('docTitle')}</h1>
          <p className="mt-0.5 text-[15px] font-extrabold tracking-wide text-brand-700">{t('docNo', { n: order.number })}</p>
          <dl className="mt-4 grid grid-cols-[auto_auto] justify-start gap-x-4 gap-y-0.5 text-[11.5px] sm:justify-end">
            <Meta label={t('issued')}>{d(issued)}</Meta>
            <Meta label={t('orderDate')}>{d(order.createdAt)}</Meta>
            {paidAt && <Meta label={t('paidOn')}>{d(paidAt)}</Meta>}
            {cancelledAt && <Meta label={t('cancelledOn')}>{d(cancelledAt)}</Meta>}
            <Meta label={t('place')}>{s.city}</Meta>
            {order.payment.method === 'bank' && awaiting && <Meta label={t('due')}>{d(dueDate)}</Meta>}
            <Meta label={t('currency')}>EUR (€)</Meta>
          </dl>
        </div>
      </header>

      {/* Parties */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-lg bg-canvas/70 px-4 py-3">
          <Label>{t('buyer')}</Label>
          <p className="mt-1 text-[13.5px] font-bold text-ink">
            {c.firstName} {c.lastName}
          </p>
          {c.company && <p className="font-semibold text-ink-soft">{c.company}</p>}
          {c.pib && (
            <p className="text-ink-soft">
              {t('pib')}: {c.pib}
            </p>
          )}
          <p className="text-ink-soft">{c.address}</p>
          <p className="text-ink-soft">
            {c.city}, {t('country')}
          </p>
          <p className="text-ink-soft">
            {c.phone} · {c.email}
          </p>
        </div>
        <div className="rounded-lg border border-line px-4 py-3">
          <Label>{t('delivery')}</Label>
          <p className="mt-1 font-semibold text-ink">{tc(`delivery_${order.delivery.method}`)}</p>
          <p className="text-ink-soft">{order.delivery.method === 'pickup' ? s.pickupAddress : `${c.address}, ${c.city}`}</p>
          <p className="mt-1.5 font-semibold text-ink">{tc(`pay_${order.payment.method}`)}</p>
          <p className="text-ink-soft">{cancelled ? t('stamp_cancelled') : tc(`paystatus_${order.payment.status}`)}</p>
        </div>
      </section>

      {/* Items */}
      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-ink text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            <th className="hidden w-8 py-2 pr-2 font-bold sm:table-cell">{t('col_no')}</th>
            <th className="py-2 pr-3 font-bold">{t('col_desc')}</th>
            <th className="py-2 pr-2 text-right font-bold">{t('col_qty')}</th>
            <th className="hidden py-2 pl-1.5 pr-3 font-bold sm:table-cell">{t('col_unit')}</th>
            <th className="hidden py-2 pr-3 text-right font-bold sm:table-cell">{t('col_price')}</th>
            <th className="py-2 text-right font-bold">{t('col_amount')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.key} className="border-b border-line/80 align-top">
              <td className="hidden py-2 pr-2 tabular-nums text-muted sm:table-cell">{i + 1}.</td>
              <td className="py-2 pr-3">
                <span className={cn('block font-semibold leading-snug', r.muted ? 'text-ink-soft' : 'text-ink')}>{r.desc}</span>
                {r.sub && <span className="block text-[10.5px] leading-snug text-muted">{r.sub}</span>}
                {r.price !== null && <span className="block text-[10.5px] text-muted sm:hidden">{money(r.price, lang)} / {r.unit}</span>}
              </td>
              <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                {r.qty}
                <span className="sm:hidden"> {r.unit}</span>
              </td>
              <td className="hidden py-2 pl-1.5 pr-3 text-ink-soft sm:table-cell">{r.unit}</td>
              <td className="hidden whitespace-nowrap py-2 pr-3 text-right tabular-nums sm:table-cell">{r.price !== null ? money(r.price, lang) : ''}</td>
              <td className={cn('whitespace-nowrap py-2 text-right font-semibold tabular-nums', r.amount < 0 && 'text-emerald-700')}>{r.amount < 0 ? `− ${money(-r.amount, lang)}` : money(r.amount, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment instructions + totals */}
      <section className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_272px] sm:gap-8">
        <div className="order-2 rounded-lg border border-dashed border-ink/20 px-4 py-3 sm:order-1">
          <Label>{awaiting ? t('payTitle') : t('paymentTitle')}</Label>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[11.5px]">
            {payRows.map(([k, v], i) => (
              <Fragment key={i}>
                <dt className="text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </Fragment>
            ))}
          </dl>
          <p className="mt-2.5 border-t border-line/80 pt-2 text-[11px] text-ink-soft">
            <span className="font-semibold text-ink">{t('payMethod')}:</span> {tc(`pay_${order.payment.method}`)}. {payNote}
          </p>
        </div>

        <div className="order-1 sm:order-2">
          <dl className="space-y-1 text-[12px]">
            <TotalRow label={t('base')} value={money(base, lang)} />
            <TotalRow label={rate != null ? t('vat', { rate: num(rate, lang) }) : t('vatPlain')} value={money(vat, lang)} />
            {(refunded > 0 || cancelled) && <TotalRow label={t('total')} value={<span className={cn(cancelled && 'line-through')}>{money(order.total, lang)}</span>} />}
            {refunded > 0 && <TotalRow label={t('refundedRow')} value={`− ${money(refunded, lang)}`} />}
          </dl>
          <div className={cn('mt-2 flex items-baseline justify-between gap-3 rounded-lg px-3.5 py-2 text-paper', cancelled ? 'bg-red-700' : 'bg-ink')}>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-paper/75">
              {cancelled ? t('nothingToPay') : awaiting ? t('toPay') : refunded > 0 ? t('netPaid') : t('totalPaid')}
            </span>
            <span className="whitespace-nowrap text-[17px] font-extrabold tabular-nums">{money(cancelled ? 0 : net, lang)}</span>
          </div>
          {stamp && (
            <div className="mt-4 flex justify-end">
              <span
                className={cn(
                  '-rotate-6 rounded-md border-2 px-3 py-1 text-[13px] font-extrabold uppercase tracking-[0.2em]',
                  cancelled ? 'border-red-600 text-red-700' : pay === 'paid' ? 'border-emerald-600 text-emerald-700' : 'border-amber-600 text-amber-700',
                )}
              >
                {t(stamp)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Thank-you + legal */}
      <footer className="mt-6 border-t border-line pt-4">
        <p className="display text-[20px] italic text-brand-700">{t('thanks')}</p>
        <p className="mt-1 text-pretty text-[11.5px] text-ink-soft">{t('thanksText', { phone: s.phone, email: s.email })}</p>
        <p className="mt-3 text-[10px] leading-snug text-muted">{t('legal')}</p>
      </footer>
    </article>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{children}</p>;
}

function Meta({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold tabular-nums text-ink">{children}</dd>
    </>
  );
}

function TotalRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
