# TERSUN — Raporti i SEO-së teknike (dorëzimi final)

**Faqja:** https://ariongj.github.io/TERSUN/
**Data:** 21 nëntor 2026
**Versioni i testuar:** commit `ea36f94` + rregullimi `/admin`
**Si u bë testi:**
- Crawl me shfletues të vërtetë (Chromium) në 52 URL, dhe me curl mbi faqen live.
- Lighthouse 12 në profilin mobil, me ngadalësim të simuluar.
- Krahasim me versionin para ndryshimeve (`b7fe8c9`), me të njëjtat URL dhe kushte.

## Përmbledhje

| Matja | Para | Pas |
|---|---|---|
| URL publike që kthejnë **200** | 10 nga 46 (36 kthenin **404**) | **52 nga 52** |
| Faqe me `canonical` | 0 | 48 (të gjitha të indeksueshmet) |
| Tituj unikë në HTML (para JS) | 1 (i njëjti kudo) | 52 nga 52 |
| Meta description unike | 1 (i njëjti kudo) | 48 nga 48 të indeksueshmet |
| Faqe me JSON-LD (schema) | 0 | 48 |
| `sitemap.xml` / `robots.txt` | mungonin (404) | 200, 48 URL |
| Imazhe pa `width`/`height` | 727 | 0 |
| Faqe me H1 ≠ 1 ose me nivele titujsh të kapërcyer | 2 | 0 |
| Faqe pa asnjë lidhje hyrëse | 7 (4 koleksione, 3 oferta) | 0 |
| Gabime JavaScript gjatë crawl-it | 0 | 0 |
| Lighthouse SEO (4 faqet e matura) | 100 vetëm ballina; 3 të tjerat s'u matën dot (404) | 100 / 100 / 100 / 100 |

Problemi kryesor ishte ky: GitHub Pages i kthente **404** Google-it për çdo produkt, kategori dhe artikull, sepse faqja është SPA. Tani çdo faqe publike ka skedarin e vet HTML me titull, përshkrim, canonical, Open Graph dhe schema. Këto gjenerohen automatikisht në çdo build.

## Statusi i secilës pikë

| # | Pika | Statusi | Çfarë u bë / shënim |
|---|---|---|---|
| 01 | Etiketat noindex | **kryer** | Faqet publike kthejnë 200 pa noindex dhe pa `X-Robots-Tag`. `noindex, follow` vetëm në `/cart`, `/checkout`, `/wishlist`, `/search`, `/admin` dhe 404. CMS-ja kërkon hyrje. *Mbetet:* testi live i URL Inspection në Search Console (pika 20). |
| 02 | robots.txt | **kryer, me kufizim** | `/TERSUN/robots.txt` jep `Allow: /` dhe URL-në absolute të sitemap-it. Nuk bllokon CSS ose JS. **Kufizim:** Google lexon vetëm `/robots.txt` në rrënjë të hostit, dhe `ariongj.github.io/robots.txt` nuk është i këtij projekti. Kalon automatikisht kur faqja të ketë domenin e vet. Deri atëherë sitemap-i dorëzohet direkt në Search Console. |
| 03 | Sitemap XML | **kryer** | `/TERSUN/sitemap.xml` ka 48 URL kanonike HTTPS, të gjitha 200, pa noindex dhe pa ridrejtime (verifikuar live). Ka `lastmod` dhe rigjenerohet në çdo publikim. Dorëzimi në Search Console mbetet te pika 20. |
| 04 | Canonical | **kryer** | `rel=canonical` absolute HTTPS në çdo faqe të indeksueshme, e njëjtë me URL-në në sitemap dhe me lidhjet e brendshme. Destinacioni kthen 200 (verifikuar live, 48 nga 48). |
| 05 | HTTPS | **kryer** | Certifikata TLS dhe ridrejtimi 301 HTTP→HTTPS sigurohen nga GitHub Pages. Nuk ka mixed content: të gjitha burimet, canonical-et, og:image dhe sitemap-i janë HTTPS. |
| 06 | Meta titles | **kryer** | Saktësisht një `<title>` për faqe, unik në 52 nga 52. Formati: `Tema — TERSUN`. Titulli i kategorisë dallon nga produkti (`Bioclimatic · të gjitha modelet`). |
| 07 | Meta descriptions | **kryer** | Përshkrim i veçantë në shqip për çdo faqe, deri në 155 shenja. Vjen nga fusha SEO e produktit, nga përshkrimi, ose nga shablloni i faqes. |
| 08 | Hierarkia e titujve | **kryer** | 0 kapërcime nivelesh. U rregulluan *Projektet* (H3→H2) dhe *Kërkimi* e *Koleksioni* (shtuar H2 për listën). |
| 09 | Një H1 për faqe | **kryer** | Çdo faqe ka saktësisht një H1 që përputhet me temën. Logoja nuk është H1. |
| 10 | Open Graph | **kryer, me shënim** | `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (absolute HTTPS, fotoja e produktit ose imazhi rezervë `og.jpg`) dhe Twitter card. *Mbetet:* provë me një link real në Facebook/WhatsApp (Sharing Debugger). |
| 11 | Përshtatja për telefon | **kryer** | Ballina, dyqani, kategoria, produkti, artikulli, kontakti, shërbimet, 3D, shporta dhe admin u testuan në 360, 390 dhe 768 px. Nuk ka scroll horizontal dhe nuk ka gabime. |
| 12 | Core Web Vitals | **në pritje (pjesërisht)** | Të dhëna reale (CrUX) nuk ka ende, se faqja s'ka trafik. Matjet laboratorike janë më poshtë. CLS ≤ 0.034 dhe TBT 120–220 ms janë brenda synimit. **LCP 6.4–7.8 s në profilin e ngadaltë mobil del mbi 2.5 s.** Shkaku: përmbajtja shfaqet pasi ngarkohet JS-ja e aplikacionit (render delay ~6.3 s). Rregullimi i plotë kërkon pre-rendering të trupit të faqes (SSR/SSG), që është hapi i radhës i rekomanduar. |
| 13 | Alt text | **kryer** | 0 imazhe informative pa alt. Fotot e galerisë kanë alt përshkrues me numër (`Emri (2/5)`). Imazhet dekorative kanë `alt=""`. Butonat me ikona kanë `aria-label`. |
| 14 | Imazhet | **kryer** | Të gjitha imazhet janë WebP. `width`/`height` deklarohen kudo (727 → 0), dhe hero ka variant të veçantë për telefon. Imazhi LCP ngarkohet `eager` + `fetchpriority=high`, ndërsa pjesa tjetër është lazy. |
| 15 | Schema markup | **kryer, verifikimi në pritje** | JSON-LD: `Organization` + `WebSite` (ballina), `Product` + `Offer`/`AggregateOffer` (produktet), `BreadcrumbList` (të gjitha) dhe `Article` (blogu). `LocalBusiness` **nuk u shtua**, se adresa, telefoni dhe orari në faqe janë ende placeholder. Shtohet kur të jepen të dhënat reale. *Mbetet:* kontrolli në Schema Markup Validator dhe Rich Results Test. Çmimet në demo janë placeholder dhe duhen saktësuar para lançimit. |
| 16 | URL slugs | **kryer** | URL-të janë të lexueshme, me shkronja të vogla dhe viza (`/product/bioclimatic-freestanding`, `/shop/glass-roof`). **Asnjë URL nuk u ndryshua**, prandaj nuk nevojitet hartë ridrejtimesh. GitHub Pages nuk mund të japë 301, prandaj në domenin e ri ridrejtimet bëhen në server. |
| 17 | Lidhjet e brendshme | **kryer** | Koleksionet dhe ofertat aktive tani lidhen nga Dyqani (blloku *Koleksione & oferta*). Të 52 faqet arrihen me linke HTML `<a href>` drejt URL-ve kanonike. |
| 18 | Lidhjet e prishura | **kryer** | 67 lidhje të brendshme unike, të gjitha drejt URL-ve që kthejnë 200. `/admin` u rregullua: kthente 404, tani kthen 200 me noindex. Nuk ka ridrejtim masiv te ballina, dhe URL-të e panjohura kthejnë 404 të vërtetë. |
| 19 | Backlinks | **nuk aplikohet për developer-in (në pritje te marketingu)** | Developer-i siguron URL-të përfundimtare (lista në sitemap). Plani i propozuar është në fund të raportit. |
| 20 | Google Search Console | **në pritje (pronari)** | Kërkon llogarinë e biznesit. Hapat janë më poshtë. |

## Matjet para/pas (Lighthouse 12, mobil, ngadalësim i simuluar)

| URL | Perf para → pas | SEO para → pas | A11y pas | LCP para → pas | TBT para → pas | CLS pas |
|---|---|---|---|---|---|---|
| `/` | 61 → 62 | 100 → 100 | 96 | 7.4 s → 7.5 s | 210 → 160 ms | 0.034 |
| `/shop` | **s'u mat (404)** → 63 | — → 100 | 95 | — → 6.8 s | — → 220 ms | 0 |
| `/product/bioclimatic-freestanding` | **s'u mat (404)** → 63 | — → 100 | 90 | — → 7.8 s | — → 170 ms | 0 |
| `/journal/terrace-all-year` | **s'u mat (404)** → 67 | — → 100 | 100 | — → 6.4 s | — → 120 ms | 0.006 |

**Kufizimi:** këto janë matje laboratorike me CPU 4× më të ngadaltë dhe rrjet 4G të ngadaltë, në një makinë pa GPU. Nuk janë të dhëna reale të përdoruesve. Para ndryshimeve, Lighthouse dështonte (`ERRORED_DOCUMENT_REQUEST`) në 3 nga 4 faqet, sepse dokumenti kthente 404. INP nuk matet në laborator; TBT është treguesi i përafërt dhe është i ulët. Synimi LCP ≤ 2.5 s kërkon pre-rendering (shih pikën 12).

## Harta e ridrejtimeve

Nuk u ndryshua asnjë URL, prandaj nuk ka ridrejtime. Të gjitha URL-të e vjetra mbeten të njëjta dhe tani kthejnë 200 në vend të 404.

| URL e vjetër | URL e re | Kodi |
|---|---|---|
| — | — | — |

## Hapat për pronarin

1. **Search Console:**
   - Krijo një property *URL-prefix* për `https://ariongj.github.io/TERSUN/`, ose *Domain* me DNS kur të blihet domeni.
   - Verifiko pronësinë. Metoda me skedar HTML: dërgoma skedarin dhe e vendos unë.
   - Dërgo `https://ariongj.github.io/TERSUN/sitemap.xml`.
   - Inspekto ballinën, `/shop` dhe një produkt.
2. **Domeni i vet:** e rekomandoj fort. Me të, `robots.txt` kalon në rrënjë dhe ridrejtimet 301 bëhen të mundshme. Pas kalimit, ndryshohet `SITE_ORIGIN` në build dhe gjithçka rigjenerohet.
3. **Të dhënat reale:** adresa, telefoni, orari dhe çmimet. Pastaj shtoj `LocalBusiness` dhe saktësoj `Offer`.
4. **Validimi:** kalo 3–4 URL në https://validator.schema.org dhe në Rich Results Test, dhe testo një link në Facebook Sharing Debugger.
5. **Shumë gjuhë (rekomandim):** sot një URL shërben shqip, anglisht dhe gjermanisht, dhe indeksohet vetëm shqipja. Për trafik nga Gjermania/Zvicra duhen URL të veçanta (`/en/…`, `/de/…`) me `hreflang`.
6. **Backlinks (plani i propozuar):**
   - **Faqet që promovohen:** ballina, `/shop/bioclimatic`, `/3d`, `/projects`.
   - **Burimet:**
     - Google Business Profile;
     - drejtori biznesi në Kosovë dhe Shqipëri;
     - arkitektë dhe studio dizajni partnere;
     - shoqatat e ndërtuesve;
     - artikuj në portale për shtëpi dhe ndërtim;
     - faqet e furnitorëve dhe prodhuesve.
   - **Monitorimi:** raporti *Links* në Search Console, një herë në muaj.
   - **Mos bli lidhje.**

## Kufizime teknike të njohura

- Faqet HTML statike gjenerohen nga të dhënat e projektit gjatë build-it. Ndryshimet në CMS-në demo ruhen vetëm në shfletues, prandaj nuk arrijnë te Google. Me një backend të vërtetë, build-i lidhet me databazën.
- Gjuha e indeksuar është shqipja (shih hapin 5).

## Lista e URL-ve të testuara dhe raporti i crawl-it

*Para* = statusi HTTP në versionin e vjetër; *Pas* = statusi tani. "—" = URL që nuk ekzistonte para (6 faqe të reja të zbuluara pas lidhjes së koleksioneve dhe ofertave). Gjithashtu u testua `/admin`: 200, noindex.

| URL | Para | Pas | Indeksim | Title | H1 | JSON-LD | Img pa W/H |
|---|---|---|---|---|---|---|---|
| / | 200 | 200 | index | TERSUN — Beyond Outdoor Living | 1 | Organization, WebSite | 0 |
| /3d | 200 | 200 | index | Sistemi Bioklimatik · 3D Builder — TERSUN | 1 | BreadcrumbList | 0 |
| /about | 200 | 200 | index | Rreth nesh — TERSUN | 1 | BreadcrumbList | 0 |
| /cart | 200 | 200 | noindex | Shporta — TERSUN | 1 | — | 0 |
| /checkout | 200 | 200 | noindex | Pagesa — TERSUN | 1 | — | 0 |
| /collection/bestsellers | — | 200 | index | Më të shiturat — TERSUN | 1 | BreadcrumbList | 0 |
| /collection/signature-systems | — | 200 | index | Sistemet Signature — TERSUN | 1 | BreadcrumbList | 0 |
| /collection/warm-evenings | — | 200 | index | Mbrëmje të ngrohta — TERSUN | 1 | BreadcrumbList | 0 |
| /collection/winter-garden | — | 200 | index | Kopsht dimëror — TERSUN | 1 | BreadcrumbList | 0 |
| /contact | 200 | 200 | index | Kontakt — TERSUN | 1 | BreadcrumbList | 0 |
| /journal | 404 | 200 | index | Këshilla — TERSUN | 1 | BreadcrumbList | 0 |
| /journal/bioclimatic-vs-glass-roof | 404 | 200 | index | Pergolë bioklimatike apo mbulojë xhami? — TERSUN | 1 | Article, BreadcrumbList | 0 |
| /journal/terrace-all-year | 404 | 200 | index | Tarraca gjatë gjithë vitit — TERSUN | 1 | Article, BreadcrumbList | 0 |
| /journal/zip-screen-explained | 404 | 200 | index | Perde Zip: pse zinxhiri ka rëndësi — TERSUN | 1 | Article, BreadcrumbList | 0 |
| /offer/warm-evenings | — | 200 | index | Mbrëmje të ngrohta — WARM15 — TERSUN | 1 | BreadcrumbList | 0 |
| /offer/welcome-welcome10 | — | 200 | index | Mirë se vini — WELCOME10 — TERSUN | 1 | BreadcrumbList | 0 |
| /page/delivery-installation | 404 | 200 | index | Dërgesa &amp; montimi — TERSUN | 1 | BreadcrumbList | 0 |
| /page/privacy | 404 | 200 | index | Privatësia — TERSUN | 1 | BreadcrumbList | 0 |
| /page/returns | 404 | 200 | index | Kthimet — TERSUN | 1 | BreadcrumbList | 0 |
| /page/terms | 404 | 200 | index | Kushtet e blerjes — TERSUN | 1 | BreadcrumbList | 0 |
| /product/bioclimatic-double | 404 | 200 | index | Bioclimatic Dyshe — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/bioclimatic-freestanding | 404 | 200 | index | Bioclimatic Vetëqëndruese — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/bioclimatic-modular | 404 | 200 | index | Bioclimatic Modulare — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/bioclimatic-wall | 404 | 200 | index | Bioclimatic në Mur — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/care-kit | 404 | 200 | index | Set Mirëmbajtjeje Alumin &amp; Xham — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/glass-roof-freestanding | 404 | 200 | index | Mbulojë Xhami Vetëqëndruese — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/glass-roof-l-shape | 404 | 200 | index | Mbulojë Xhami Forma L — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/glass-roof-wall | 404 | 200 | index | Mbulojë Xhami në Mur — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/glass-roof-with-awning | 404 | 200 | index | Set Mbulojë Xhami + Tendë — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/guillotine-premium | 404 | 200 | index | Guillotine Premium — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/infrared-heater | 404 | 200 | index | Ngrohës Infra të Kuqe 2000 W — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/led-light-kit | 404 | 200 | index | Set LED E Bardhë e Ngrohtë — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/over-glass-awning | 404 | 200 | index | Tendë mbi Xham — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/remote-control-5ch | 404 | 200 | index | Telekomandë 5 Kanale — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/slide-premium | 404 | 200 | index | Slide Premium — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/slide-winter-garden | 404 | 200 | index | Kopsht Dimëror Slide — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/smart-home-hub | 404 | 200 | index | Smart Home Hub — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/wind-rain-sensor | 404 | 200 | index | Sensor Ere &amp; Shiu — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/zip-screen | 404 | 200 | index | Perde Zip — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /product/zip-screen-facade | 404 | 200 | index | Perde Zip për Fasadë — TERSUN | 1 | Product, BreadcrumbList | 0 |
| /projects | 200 | 200 | index | Realizimet — TERSUN | 1 | BreadcrumbList | 0 |
| /search | — | 200 | noindex | Kërkimi — TERSUN | 1 | — | 0 |
| /services | 200 | 200 | index | Shërbimet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop | 404 | 200 | index | Të gjitha produktet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/accessories | 404 | 200 | index | Aksesorë · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/awning | 404 | 200 | index | Tendë mbi Xham · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/bioclimatic | 404 | 200 | index | Sistemi Bioklimatik · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/glass-roof | 404 | 200 | index | Mbulojë Xhami · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/guillotine | 404 | 200 | index | Guillotine Premium · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/slide | 404 | 200 | index | Slide Premium · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /shop/zip-screen | 404 | 200 | index | Perde Zip · të gjitha modelet — TERSUN | 1 | BreadcrumbList | 0 |
| /wishlist | 200 | 200 | noindex | Të preferuarat — TERSUN | 1 | — | 0 |