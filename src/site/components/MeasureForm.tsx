import { useRef, useState } from 'react';
import { CalendarClock, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { defineDict, useDict, useL, useLang } from '@/i18n';
import { site } from '@/i18n/site';
import { useDb } from '@/store/db';
import { useCategories, useSettings } from '@/store/hooks';
import { allCities } from '@/lib/pricing';
import type { InquiryType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { longDate, timeRange } from '@/admin/components/appointments/dates';
import { readRules, webSlot } from '@/admin/components/appointments/rules';

/** Booking note on the success screen (CMS v2 — appointments, PDF p.45). */
const B = defineDict({
  de: { slot: 'Vorläufiger Termin: {when}', slotHint: 'Der Termin ist noch nicht bestätigt — wir bestätigen ihn telefonisch.' },
  sq: { slot: 'Termin i përkohshëm: {when}', slotHint: 'Termini është në pritje — do ta konfirmojmë me telefon.' },
  en: { slot: 'Provisional slot: {when}', slotHint: 'Pending — we will confirm it by phone.' },
});

/** Service used for measurement requests from the website. */
const MEASURE_SERVICE = 'sv-mjerenje';

/** Validation messages are kept as dictionary keys, so they follow a language switch. */
type ErrKey = 'f_required' | 'f_invalidPhone' | 'f_invalidEmail' | 'f_pastDate';
type Field = 'name' | 'phone' | 'email' | 'date' | 'message';
/** Order in which the first invalid field gets focus */
const FIELDS: Field[] = ['name', 'phone', 'email', 'date', 'message'];

/** Today as YYYY-MM-DD in the visitor's local time (toISOString would give the UTC day). */
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Digits, spaces and + ( ) / - only, with 8–15 digits. */
const validPhone = (v: string) => /^[\d\s+()/-]+$/.test(v) && /^\d{8,15}$/.test(v.replace(/\D/g, ''));
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/**
 * Lead form used for "free measurement", "request a quote" and plain contact.
 * Submissions land in Admin → Contacts instantly.
 */
export function MeasureForm({
  type = 'measurement',
  productId,
  defaultService,
  defaultMessage,
  className,
  onDone,
}: {
  type?: InquiryType;
  productId?: string;
  /** Pre-selected service chip: a category id, or 'other' */
  defaultService?: string;
  defaultMessage?: string;
  className?: string;
  onDone?: () => void;
}) {
  const t = useDict(site);
  const l = useL();
  const cats = useCategories();
  const settings = useSettings();
  const addInquiry = useDb((s) => s.addInquiry);
  const tb = useDict(B);
  const lang = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', service: defaultService ?? '', date: '', message: defaultMessage ?? '' });
  const [errors, setErrors] = useState<Partial<Record<Field, ErrKey>>>({});
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const reg = (k: Field) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    refs.current[k] = el;
  };
  const [sent, setSent] = useState<{ name: string; phone: string; slot?: { start: string; durationMin: number } } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const today = localToday();
  // Service chips by id, labelled in the current language (so a language switch keeps the selection)
  const services = [...cats.map((c) => ({ id: c.id, label: l(c.name) })), { id: 'other', label: t('f_other') }];
  const serviceLabel = services.find((x) => x.id === form.service)?.label ?? '';

  /**
   * A measurement request with a preferred date also books a PENDING appointment (10:00, or the next free
   * slot that day) linked to the inquiry. Closed / full day → no booking; the team schedules it by hand.
   */
  const bookMeasurement = (inquiryId: string, day: string) => {
    const st = useDb.getState();
    const service = st.services.find((x) => x.id === MEASURE_SERVICE) ?? st.services.find((x) => x.location === 'onsite');
    if (!service) return undefined;
    const slot = webSlot(day, service, { bookings: st.bookings, services: st.services, rules: readRules(st.settings) });
    if (!slot?.staffId) return undefined;
    const res = st.addBooking({
      serviceId: service.id,
      staffId: slot.staffId,
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.city ? { city: form.city } : {}),
      start: slot.start,
      location: service.location ?? 'onsite',
      inquiryId,
      note: [serviceLabel, form.message.trim()].filter(Boolean).join(' — ') || undefined,
      status: 'pending',
    });
    if (!res.ok) return undefined;
    // addBooking marks the inquiry as scheduled + seen — a web request must stay new/unseen in the inbox.
    st.updateInquiry(inquiryId, { status: 'new', seen: false, scheduledAt: res.booking.start });
    return { start: res.booking.start, durationMin: res.booking.durationMin };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Partial<Record<Field, ErrKey>> = {};
    if (!form.name.trim()) err.name = 'f_required';
    if (!form.phone.trim()) err.phone = 'f_required';
    else if (!validPhone(form.phone.trim())) err.phone = 'f_invalidPhone';
    if (form.email.trim() && !validEmail(form.email.trim())) err.email = 'f_invalidEmail';
    if (type === 'measurement' && form.date && form.date < localToday()) err.date = 'f_pastDate';
    if (type === 'contact' && !form.message.trim()) err.message = 'f_required';
    setErrors(err);
    const first = FIELDS.find((k) => err[k]);
    if (first) {
      // after the error text has rendered, so it is read with the field
      requestAnimationFrame(() => refs.current[first]?.focus());
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    const inq = addInquiry({
      type,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      city: form.city || undefined,
      service: serviceLabel || undefined,
      productId,
      message: form.message.trim() || '—',
      preferredDate: form.date || undefined,
    });
    const slot = type === 'measurement' && form.date ? bookMeasurement(inq.id, form.date) : undefined;
    setBusy(false);
    setSent({ name: form.name.trim().split(' ')[0], phone: form.phone.trim(), slot });
    onDone?.();
  };

  if (sent) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center ring-1 ring-line sm:p-10', className)}>
        <span className="grid h-14 w-14 animate-pop place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="display mt-5 text-3xl">{t('f_successTitle', { name: sent.name })}</h3>
        <p className="mt-2 max-w-sm text-muted">{t('f_successText', { phone: sent.phone })}</p>
        {sent.slot && (
          <div className="mt-5 flex max-w-sm items-start gap-3 rounded-2xl bg-sand/60 px-4 py-3 text-left ring-1 ring-line">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <span className="text-sm">
              <span className="block font-semibold text-ink">{tb('slot', { when: `${longDate(sent.slot.start, lang)}, ${timeRange(sent.slot.start, sent.slot.durationMin)}` })}</span>
              <span className="mt-0.5 block text-muted">{tb('slotHint')}</span>
            </span>
          </div>
        )}
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(null);
            setForm({ name: '', phone: '', email: '', city: '', service: defaultService ?? '', date: '', message: defaultMessage ?? '' });
          }}
        >
          {t('f_newRequest')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cn('rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input ref={reg('name')} label={t('f_name')} required value={form.name} onChange={set('name')} error={errors.name && t(errors.name)} autoComplete="name" />
        <Input
          ref={reg('phone')}
          label={t('f_phone')}
          required
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone && t(errors.phone)}
          placeholder="+383 4_ ___ ___"
          autoComplete="tel"
        />
        {type === 'contact' ? (
          <Input ref={reg('email')} label={t('f_email')} type="email" value={form.email} onChange={set('email')} error={errors.email && t(errors.email)} wrapClassName="sm:col-span-2" autoComplete="email" />
        ) : (
          <>
            <Select label={t('f_city')} value={form.city} onChange={set('city')}>
              <option value="">{t('f_chooseCity')}</option>
              {allCities(settings).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            {type === 'measurement' ? (
              <Input ref={reg('date')} label={t('f_date')} type="date" min={today} value={form.date} onChange={set('date')} error={errors.date && t(errors.date)} />
            ) : (
              <Input ref={reg('email')} label={t('f_email')} type="email" value={form.email} onChange={set('email')} error={errors.email && t(errors.email)} autoComplete="email" />
            )}
            {type === 'measurement' && (
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{t('f_service')}</span>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={form.service === s.id}
                      onClick={() => setForm((f) => ({ ...f, service: f.service === s.id ? '' : s.id }))}
                      className={cn(
                        'rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                        form.service === s.id ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink-soft hover:border-ink/30',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <Textarea
          ref={reg('message')}
          label={t('f_message')}
          required={type === 'contact'}
          rows={3}
          value={form.message}
          onChange={set('message')}
          placeholder={t('f_messagePh')}
          error={errors.message && t(errors.message)}
          wrapClassName="sm:col-span-2"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted sm:max-w-[55%]">{t('f_privacy')}</p>
        <Button type="submit" size="lg" loading={busy} iconRight={<Send className="h-4 w-4" />}>
          {t('f_submit')}
        </Button>
      </div>
    </form>
  );
}
