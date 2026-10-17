import { ArrowRight, ArrowUpRight, Award, Clock, Handshake, Mail, MapPin, Mountain, Phone, Ruler } from 'lucide-react';
import { Accent, Img, Reveal } from '@/components/ui/misc';
import { ButtonLink, buttonClass } from '@/components/ui/Button';
import { LogoMark } from '@/components/brand/Logo';
import { Breadcrumbs, SectionHeading } from '@/site/components/SectionHeading';
import { usePageTitle } from '@/site/layout/SiteLayout';
import { CtaBand, ProcessSteps, StatsBand } from '@/site/components/company/Blocks';
import { pad2, telHref, useHomeData } from '@/site/components/company/data';
import { defineDict, useDict, useL } from '@/i18n';
import { site } from '@/i18n/site';
import { useSettings } from '@/store/hooks';
import { cn } from '@/lib/utils';

const T = defineDict({
  de: {
    eyebrow: 'Über uns',
    title: 'Wir gestalten Räume *unter freiem Himmel*.',
    ourWork: 'Unsere Projekte',
    country: 'Kosovo · Europa · USA',
    floatSub: 'Planung & Montage',
    valuesEyebrow: 'Unsere Werte',
    valuesTitle: 'Woran wir *glauben*',
    valuesText: 'Vier Prinzipien, die jedes Projekt begleiten — vom ersten Entwurf bis zur Übergabe auf Ihrer Terrasse.',
    v1t: 'Qualität',
    v1: 'Pulverbeschichtetes Aluminium, gehärtetes Glas, deutsche Motoren und Tücher — nur Komponenten, die jahrzehntelang halten.',
    v2t: 'Zuverlässigkeit',
    v2: 'Vereinbarte Termine und Preise werden eingehalten. Was im Angebot steht, bekommen Sie auch — ohne versteckte Kosten.',
    v3t: 'Präzision',
    v3: 'Jeder Millimeter zählt — deshalb vermessen wir vor Ort, planen in 3D, montieren mit eigenen Teams und prüfen jedes Detail vor der Übergabe.',
    v4t: 'Für jedes Klima',
    v4: 'Unsere Systeme sind für Sonne, Wind, Regen und Schneelast ausgelegt — vom Balkan über die Alpen bis in die USA.',
    allServices: 'Alle Leistungen',
    showEyebrow: 'Showroom',
    showTitle: 'Besuchen Sie unseren *Showroom*',
    showText: 'Erleben Sie Pergolen, Glassysteme und ZIP-Screens in Bewegung und besprechen Sie Ihr Projekt bei einem Kaffee mit unseren Beratern.',
    address: 'Adresse',
    phone: 'Telefon',
    email: 'E-Mail',
    openMap: 'Karte öffnen',
  },
  sq: {
    eyebrow: 'Rreth nesh',
    title: 'Krijojmë hapësira *nën qiell të hapur*.',
    ourWork: 'Realizimet tona',
    country: 'Kosovë · Evropë · SHBA',
    floatSub: 'Projektim & montim',
    valuesEyebrow: 'Vlerat tona',
    valuesTitle: 'Ajo në të cilën *besojmë*',
    valuesText: 'Katër parime që udhëheqin çdo projekt — nga skica e parë deri te dorëzimi në tarracën tuaj.',
    v1t: 'Cilësia',
    v1: 'Alumin i lyer me pluhur, xham i kalitur, motorë dhe shtofa gjermane — vetëm komponentë që zgjasin dekada.',
    v2t: 'Besueshmëria',
    v2: 'Afatet dhe çmimet e dakorduara respektohen. Ajo që shkruan në ofertë — atë merrni, pa kosto të fshehura.',
    v3t: 'Saktësia',
    v3: 'Çdo milimetër ka rëndësi — prandaj masim në vend, projektojmë në 3D, montojmë me ekipet tona dhe kontrollojmë çdo detaj para dorëzimit.',
    v4t: 'Për çdo klimë',
    v4: 'Sistemet tona janë ndërtuar për diell, erë, shi dhe ngarkesë bore — nga Ballkani te Alpet e deri në SHBA.',
    allServices: 'Të gjitha shërbimet',
    showEyebrow: 'Salloni',
    showTitle: 'Vizitoni *sallonin* tonë',
    showText: 'Shikoni pergolat, sistemet e xhamit dhe perdet ZIP në lëvizje dhe me një kafe bisedoni me këshilltarët tanë për projektin tuaj.',
    address: 'Adresa',
    phone: 'Telefoni',
    email: 'E-mail',
    openMap: 'Hap hartën',
  },
  en: {
    eyebrow: 'About us',
    title: 'We shape spaces *under the open sky*.',
    ourWork: 'Our projects',
    country: 'Kosovo · Europe · USA',
    floatSub: 'Design & installation',
    valuesEyebrow: 'Our values',
    valuesTitle: 'What we *stand for*',
    valuesText: 'Four principles behind every project — from the first sketch to handover on your terrace.',
    v1t: 'Quality',
    v1: 'Powder-coated aluminium, toughened glass, German motors and fabrics — only components built to last for decades.',
    v2t: 'Reliability',
    v2: 'Agreed deadlines and prices are kept. What’s in the quote is what you get — no hidden costs.',
    v3t: 'Precision',
    v3: 'Every millimetre matters — so we survey on site, design in 3D, install with our own crews and check every detail before handover.',
    v4t: 'Built for every climate',
    v4: 'Our systems are engineered for sun, wind, rain and snow load — from the Balkans to the Alps and the USA.',
    allServices: 'All services',
    showEyebrow: 'Showroom',
    showTitle: 'Visit our *showroom*',
    showText: 'See pergolas, glass systems and ZIP screens in motion, and talk your project through with our advisers over a coffee.',
    address: 'Address',
    phone: 'Phone',
    email: 'E-mail',
    openMap: 'Open map',
  },
});

const VALUES = [
  { icon: Award, title: 'v1t', text: 'v1' },
  { icon: Handshake, title: 'v2t', text: 'v2' },
  { icon: Ruler, title: 'v3t', text: 'v3' },
  { icon: Mountain, title: 'v4t', text: 'v4' },
] as const;

export default function About() {
  const ts = useDict(site);
  const t = useDict(T);
  const l = useL();
  const settings = useSettings();
  const stats = useHomeData('stats');
  const process = useHomeData('process');
  usePageTitle(ts('nav_about'));

  const hours = l(settings.hours)
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);

  const contactRows = [
    { icon: MapPin, label: t('address'), value: [settings.address, settings.city].filter(Boolean).join(', '), href: settings.mapUrl, external: true },
    { icon: Clock, label: ts('hours'), value: hours, href: undefined, external: false },
    { icon: Phone, label: t('phone'), value: settings.phone, href: telHref(settings.phone), external: false },
    { icon: Mail, label: t('email'), value: settings.email, href: `mailto:${settings.email}`, external: false },
  ];

  return (
    <>
      {/* Split hero */}
      <section className="overflow-hidden border-b border-line bg-paper">
        <div className="container-x grid items-center gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-24">
          <div className="animate-fade-up">
            <Breadcrumbs items={[{ label: ts('nav_about') }]} />
            <div className="eyebrow mb-4 mt-10">{t('eyebrow')}</div>
            <h1 className="display max-w-xl text-[44px] leading-[1.02] text-ink sm:text-[64px]">
              <Accent text={t('title')} />
            </h1>
            <p className="mt-7 max-w-xl text-[17.5px] leading-[1.7] text-ink-soft">{l(settings.about)}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/projects" variant="dark" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                {t('ourWork')}
              </ButtonLink>
              <ButtonLink to="/contact" variant="outline" size="lg">
                {ts('nav_contact')}
              </ButtonLink>
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-line pt-6 text-[13px] text-muted">
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>
                <span className="font-semibold text-ink">{settings.legalName}</span> · {settings.city}, {t('country')}
              </span>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -right-6 -top-6 hidden h-40 w-40 rounded-full bg-brand-100/70 blur-2xl lg:block" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-sand sm:aspect-[5/4] lg:aspect-[4/5]">
              <Img src="/images/misc/about.webp" eager alt={settings.companyName} className="h-full w-full object-cover object-[46%_50%]" />
            </div>
            <div className="absolute -bottom-8 left-4 right-4 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_30px_60px_-30px_rgba(28,26,23,0.45)] ring-1 ring-line sm:left-auto sm:right-8 sm:w-[340px] lg:-left-10 lg:right-auto">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-paper ring-1 ring-line">
                <LogoMark className="h-7" />
              </span>
              <div className="min-w-0">
                <div className="display text-[22px] leading-tight text-ink">{l(settings.tagline)}</div>
                <div className="mt-0.5 text-[12px] font-bold uppercase tracking-[0.16em] text-brand-700">{t('floatSub')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading eyebrow={t('valuesEyebrow')} title={t('valuesTitle')} subtitle={t('valuesText')} />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              const tone = i === 1 || i === 2;
              return (
                <Reveal key={v.title} delay={(i % 2) * 110} className="h-full">
                  <div className={cn('h-full', i % 2 === 1 && 'sm:translate-y-12')}>
                    <div className={cn('group flex h-full flex-col rounded-3xl p-7 ring-1 transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(28,26,23,0.4)] sm:p-8', tone ? 'bg-sand/70 ring-sand-2' : 'bg-white ring-line')}>
                      <div className="flex items-center justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white transition-transform duration-500 group-hover:-rotate-6">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="display text-[15px] text-muted">{pad2(i + 1)}</span>
                      </div>
                      <h3 className="display mt-10 text-[30px] leading-tight text-ink">{t(v.title)}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t(v.text)}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {stats && <StatsBand data={stats} />}

      {process && (
        <ProcessSteps
          data={process}
          action={
            <ButtonLink to="/services" variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
              {t('allServices')}
            </ButtonLink>
          }
        />
      )}

      {/* Showroom */}
      <section className="pt-24 sm:pt-28">
        <div className="container-x">
          <Reveal>
            <div className="grid overflow-hidden rounded-[36px] bg-white ring-1 ring-line lg:grid-cols-[1.05fr_1fr]">
              <div className="relative min-h-[300px] bg-sand sm:min-h-[380px] lg:min-h-[600px]">
                <Img src="/images/misc/view.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-[12px] font-bold text-ink shadow-sm backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" /> {settings.city}
                </div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <div className="eyebrow">{t('showEyebrow')}</div>
                <h2 className="display mt-3 text-[36px] leading-[1.05] text-ink sm:text-[48px]">
                  <Accent text={t('showTitle')} />
                </h2>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">{t('showText')}</p>
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {contactRows.map((r) => {
                    const Icon = r.icon;
                    const body = Array.isArray(r.value) ? (
                      r.value.map((line) => <span key={line} className="block">{line}</span>)
                    ) : (
                      r.value
                    );
                    return (
                      <li key={r.label} className="flex items-start gap-4 py-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{r.label}</div>
                          {r.href ? (
                            <a
                              href={r.href}
                              {...(r.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                              className="link-u mt-0.5 inline-block break-words text-[15.5px] font-semibold text-ink"
                            >
                              {body}
                            </a>
                          ) : (
                            <div className="mt-0.5 text-[15.5px] font-semibold text-ink">{body}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={settings.mapUrl} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'dark', size: 'lg' })}>
                    {t('openMap')} <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a href={telHref(settings.phone)} className={buttonClass({ variant: 'outline', size: 'lg' })}>
                    <Phone className="h-4 w-4" /> {ts('callUs')}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand image="/images/misc/night.webp" />
    </>
  );
}
