/*
 * The six TERSUN products.
 *
 * Every text field is translated: { en, de, sq }.
 * Specs follow the LONI tenda / TERSUN catalogue 2026. The bioclimatic spec sheet was not
 * part of the material received yet, so its values are still provisional (marked below).
 *
 * Photos: images in src/assets/img/products/<slug>/ (jpg/webp/png).
 * The first file alphabetically becomes the hero image, all of them form the gallery.
 * Without photos the parametric illustration is shown.
 */

const frameColors = [
  { value: 'RAL 7016', hex: '#383e42', label: { en: 'Anthracite grey (standard)', de: 'Anthrazitgrau (Standard)', sq: 'Gri antracit (standard)' } },
  { value: 'RAL 9016', hex: '#f1f0ea', label: { en: 'Traffic white', de: 'Verkehrsweiß', sq: 'E bardhë' } },
  { value: 'RAL 9005', hex: '#141416', label: { en: 'Jet black', de: 'Tiefschwarz', sq: 'E zezë' } },
  { value: 'RAL 9007', hex: '#8f8f8c', label: { en: 'Grey aluminium', de: 'Graualuminium', sq: 'Alumin gri' } },
  { value: 'custom', hex: '#b08d57', label: { en: 'Other RAL colour', de: 'Andere RAL-Farbe', sq: 'Ngjyrë tjetër RAL' } }
];

const fabricColors = [
  { value: 'charcoal', hex: '#4a4846', label: { en: 'Charcoal', de: 'Anthrazit', sq: 'Qymyr' } },
  { value: 'stone', hex: '#8a8783', label: { en: 'Stone grey', de: 'Steingrau', sq: 'Gri guri' } },
  { value: 'sand', hex: '#cbbfa8', label: { en: 'Sand', de: 'Sand', sq: 'Rërë' } },
  { value: 'pearl', hex: '#e9e6df', label: { en: 'Pearl white', de: 'Perlweiß', sq: 'E bardhë perle' } }
];

const motorControl = {
  key: 'control', type: 'choice',
  label: { en: 'Control', de: 'Steuerung', sq: 'Kontrolli' },
  choices: [
    { value: 'remote', label: { en: 'Remote control', de: 'Fernbedienung', sq: 'Telekomandë' } },
    { value: 'smart', label: { en: 'Smart home & app', de: 'Smart Home & App', sq: 'Smart home & aplikacion' } }
  ]
};

const glassChoices = {
  key: 'glass', type: 'choice',
  label: { en: 'Glass', de: 'Glas', sq: 'Xhami' },
  choices: [
    { value: '4+4', label: { en: '4+4 laminated safety glass', de: '4+4 Verbundsicherheitsglas', sq: '4+4 xham sigurie' } },
    { value: '4+14+4', label: { en: '4+14+4 insulated glass', de: '4+14+4 Isolierglas', sq: '4+14+4 xham termopan' } }
  ]
};

const material = { label: { en: 'Construction', de: 'Konstruktion', sq: 'Konstruksioni' },
  value: { en: 'Extruded aluminium, factory powder-coated', de: 'Stranggepresstes Aluminium, werkseitig pulverbeschichtet', sq: 'Alumin i ekstruduar, i ngjyrosur me pluhur në fabrikë' } };
const colour = { label: { en: 'Standard colour', de: 'Standardfarbe', sq: 'Ngjyra standarde' },
  value: { en: 'RAL 7016, other RAL colours on request', de: 'RAL 7016, weitere RAL-Farben auf Anfrage', sq: 'RAL 7016, ngjyra të tjera RAL sipas kërkesës' } };
const warranty2 = { label: { en: 'System warranty', de: 'Systemgarantie', sq: 'Garancioni i sistemit' }, value: { en: '2 years', de: '2 Jahre', sq: '2 vite' } };
const warranty5 = { label: { en: 'Fabric warranty', de: 'Tuchgarantie', sq: 'Garancioni i shtofit' }, value: { en: '5 years (Sattler)', de: '5 Jahre (Sattler)', sq: '5 vite (Sattler)' } };

module.exports = [
  {
    id: 'bioclimatic',
    slug: 'bioclimatic-system',
    illustration: 'bioclimatic',
    video: { src: 'video/bioclimatic.mp4', poster: 'video/bioclimatic-poster.jpg' },
    name: { en: 'Bioclimatic System', de: 'Bioklimatisches System', sq: 'Sistemi Bioklimatik' },
    tagline: {
      en: 'Rotating aluminium louvres for sun, shade and rain protection at the touch of a button.',
      de: 'Drehbare Aluminiumlamellen für Sonne, Schatten und Regenschutz – auf Knopfdruck.',
      sq: 'Lamela alumini rrotulluese për diell, hije dhe mbrojtje nga shiu – me një prekje butoni.'
    },
    intro: {
      en: [
        'The TERSUN Bioclimatic System is a pergola with motorised aluminium louvres – freestanding or wall-mounted, as a single unit, a double unit or a modular system for large areas. Open the louvres to let in light and air, angle them to control sun and heat, or close them completely to create a watertight roof.',
        'Rainwater is led away through gutters hidden in the frame and down through the posts. Integrated LED lighting and side closures – ZIP screens, Guillotine or Slide glazing, or aluminium panels – turn the terrace into a true outdoor room that you can use all year round.'
      ],
      de: [
        'Das TERSUN Bioklimatische System ist eine Pergola mit motorisch drehbaren Aluminiumlamellen – freistehend oder wandmontiert, als Einzel-, Doppel- oder Modulsystem für große Flächen. Geöffnet lassen die Lamellen Licht und Luft herein, angewinkelt regulieren sie Sonne und Wärme, geschlossen bilden sie ein wasserdichtes Dach.',
        'Regenwasser wird über im Rahmen verborgene Rinnen und durch die Pfosten abgeleitet. Integrierte LED-Beleuchtung und seitliche Abschlüsse – ZIP-Screens, Guillotine- oder Schiebeverglasung oder Aluminiumpaneele – machen die Terrasse zu einem echten Außenraum, das ganze Jahr über.'
      ],
      sq: [
        'Sistemi Bioklimatik TERSUN është një pergolë me lamela alumini që rrotullohen me motor – e pavarur ose e montuar në mur, si njësi e vetme, dyshe ose sistem modular për sipërfaqe të mëdha. Të hapura, lamelat lejojnë dritën dhe ajrin; të pjerrëta kontrollojnë diellin dhe nxehtësinë; të mbyllura krijojnë një çati plotësisht të papërshkueshme nga uji.',
        'Uji i shiut largohet përmes ulluqeve të fshehura në profil dhe poshtë nëpër shtylla. Ndriçimi LED i integruar dhe mbylljet anësore – perde Zip, xhama Guillotine ose Slide, apo fletë alumini – e kthejnë tarracën në një hapësirë të vërtetë jetese në natyrë, gjatë gjithë vitit.'
      ]
    },
    features: [
      { icon: 'louvre', title: { en: 'Rotating louvres', de: 'Drehbare Lamellen', sq: 'Lamela rrotulluese' },
        text: { en: 'Precise control of light, shade and ventilation.', de: 'Präzise Steuerung von Licht, Schatten und Belüftung.', sq: 'Kontroll i saktë i dritës, hijes dhe ajrosjes.' } },
      { icon: 'drop', title: { en: 'Watertight when closed', de: 'Geschlossen wasserdicht', sq: 'E papërshkueshme kur mbyllet' },
        text: { en: 'Integrated gutters drain the water through the posts.', de: 'Integrierte Rinnen leiten das Wasser durch die Pfosten ab.', sq: 'Ulluqet e integruara e largojnë ujin përmes shtyllave.' } },
      { icon: 'light', title: { en: 'Integrated LED', de: 'Integrierte LED', sq: 'LED e integruar' },
        text: { en: 'Light lines in the frame and posts for the evening.', de: 'Lichtlinien in Rahmen und Pfosten für den Abend.', sq: 'Linja drite në profil dhe shtylla për mbrëmjet.' } },
      { icon: 'app', title: { en: 'Motorised control', de: 'Motorische Steuerung', sq: 'Kontroll me motor' },
        text: { en: 'Operated by remote control or smart home.', de: 'Bedienung per Fernbedienung oder Smart Home.', sq: 'Komandohet me telekomandë ose smart home.' } },
      { icon: 'ruler', title: { en: 'Single, double or modular', de: 'Einzeln, doppelt oder modular', sq: 'Standard, dyshe ose modulare' },
        text: { en: 'Freestanding or wall-mounted, for any terrace size.', de: 'Freistehend oder wandmontiert, für jede Terrassengröße.', sq: 'E pavarur ose e varur në mur, për çdo madhësi tarrace.' } },
      { icon: 'layers', title: { en: 'Side closures', de: 'Seitliche Abschlüsse', sq: 'Mbyllje anësore' },
        text: { en: 'ZIP screens, Guillotine or Slide glazing, aluminium panels.', de: 'ZIP-Screens, Guillotine- oder Schiebeverglasung, Aluminiumpaneele.', sq: 'Perde Zip, xhama Guillotine ose Slide, fletë alumini.' } }
    ],
    // TODO: confirm against the bioclimatic spec sheet (catalogue page 7).
    specs: [
      material,
      { label: { en: 'Roof', de: 'Dach', sq: 'Çatia' }, value: { en: 'Motorised rotating aluminium louvres', de: 'Motorisch drehbare Aluminiumlamellen', sq: 'Lamela alumini rrotulluese me motor' } },
      { label: { en: 'Versions', de: 'Ausführungen', sq: 'Versionet' }, value: { en: 'Standard, double, modular', de: 'Standard, Doppel, Modular', sq: 'Standard, dyshe, modulare' } },
      { label: { en: 'Mounting', de: 'Montage', sq: 'Montimi' }, value: { en: 'Freestanding or wall-mounted', de: 'Freistehend oder wandmontiert', sq: 'E pavarur ose e varur në mur' } },
      { label: { en: 'Drainage', de: 'Entwässerung', sq: 'Kullimi' }, value: { en: 'Integrated gutters, through the posts', de: 'Integrierte Rinnen, durch die Pfosten', sq: 'Ulluqe të integruara, përmes shtyllave' } },
      colour
    ],
    config: {
      dims: { w: [200, 1200, 450], d: [200, 800, 350], h: [220, 300, 260] },
      preview: { key: 'angle', min: 0, max: 135, value: 35, label: { en: 'Louvre angle', de: 'Lamellenwinkel', sq: 'Këndi i lamelave' }, unit: '°' },
      fields: [
        { key: 'layout', type: 'choice',
          label: { en: 'Version', de: 'Ausführung', sq: 'Versioni' },
          choices: [
            { value: 'standard', label: { en: 'Standard', de: 'Standard', sq: 'Standard' } },
            { value: 'double', label: { en: 'Double', de: 'Doppel', sq: 'Dyshe' } },
            { value: 'modular', label: { en: 'Modular', de: 'Modular', sq: 'Modulare' } }
          ] },
        { key: 'mount', type: 'choice',
          label: { en: 'Mounting', de: 'Montage', sq: 'Montimi' },
          choices: [
            { value: 'free', label: { en: 'Freestanding', de: 'Freistehend', sq: 'E pavarur' } },
            { value: 'wall', label: { en: 'Wall-mounted', de: 'Wandmontiert', sq: 'E varur në mur' } }
          ] },
        { key: 'color', type: 'color', label: { en: 'Frame colour', de: 'Rahmenfarbe', sq: 'Ngjyra e profilit' }, choices: frameColors },
        { key: 'side', type: 'choice',
          label: { en: 'Side closure', de: 'Seitlicher Abschluss', sq: 'Mbyllja anësore' },
          choices: [
            { value: 'none', label: { en: 'Open', de: 'Offen', sq: 'E hapur' } },
            { value: 'zip', label: { en: 'ZIP screens', de: 'ZIP-Screens', sq: 'Perde Zip' } },
            { value: 'guillotine', label: { en: 'Guillotine glazing', de: 'Guillotine-Verglasung', sq: 'Xhama Guillotine' } },
            { value: 'slide', label: { en: 'Slide glazing', de: 'Schiebeverglasung', sq: 'Xhama Slide' } },
            { value: 'panel', label: { en: 'Aluminium panels', de: 'Aluminiumpaneele', sq: 'Fletë alumini' } }
          ] },
        motorControl,
        { key: 'extras', type: 'multi',
          label: { en: 'Extras', de: 'Extras', sq: 'Shtesa' },
          choices: [
            { value: 'led', label: { en: 'LED lighting', de: 'LED-Beleuchtung', sq: 'Ndriçim LED' } },
            { value: 'rain-sensor', label: { en: 'Rain sensor', de: 'Regensensor', sq: 'Sensor shiu' } },
            { value: 'wind-sensor', label: { en: 'Wind sensor', de: 'Windsensor', sq: 'Sensor ere' } },
            { value: 'heater', label: { en: 'Heater', de: 'Heizstrahler', sq: 'Ngrohës' } }
          ] }
      ]
    }
  },

  {
    id: 'glassroof',
    slug: 'glass-roof',
    illustration: 'glassroof',
    name: { en: 'Glass Roof', de: 'Glasdach', sq: 'Mbulojë Xhami' },
    tagline: {
      en: 'An elegant aluminium structure with safety glass – natural light and weather protection in every season.',
      de: 'Eine elegante Aluminiumkonstruktion mit Sicherheitsglas – Tageslicht und Wetterschutz zu jeder Jahreszeit.',
      sq: 'Një strukturë elegante alumini me xham sigurie – dritë natyrale dhe mbrojtje nga moti në çdo stinë.'
    },
    intro: {
      en: [
        'The TERSUN Glass Roof is an elegant structure for every season: first-class aluminium construction and laminated safety glass protect against the weather while letting daylight in all year.',
        'The drainage is integrated and concealed, quality gaskets seal against air and water, and Samsung LED lighting creates a warm atmosphere in the evening. Wall-mounted, freestanding, as a double roof with a middle construction or in an L shape.'
      ],
      de: [
        'Das TERSUN Glasdach ist eine elegante Konstruktion für jede Jahreszeit: erstklassiges Aluminium und Verbundsicherheitsglas schützen vor dem Wetter und lassen das ganze Jahr Tageslicht herein.',
        'Die Entwässerung ist integriert und verdeckt, hochwertige Dichtungen dichten gegen Luft und Wasser, und LED-Beleuchtung von Samsung sorgt abends für warme Atmosphäre. Wandmontiert, freistehend, als Doppeldach mit Mittelkonstruktion oder in L-Form.'
      ],
      sq: [
        'Mbuloja e Xhamit TERSUN është një strukturë elegante dhe e përshtatshme për çdo stinë, me konstruksion alumini të klasit të parë dhe xham sigurie që ofrojnë mbrojtje nga kushtet atmosferike dhe dritë natyrale gjatë gjithë vitit.',
        'Sistemi i drenazhimit është i integruar dhe i fshehur, gominat cilësore izolojnë plotësisht nga ajri dhe uji, ndërsa ndriçimi LED nga Samsung krijon një atmosferë të ngrohtë në mbrëmje. E montuar në mur, vetëqëndruese, dyshe me konstruksion në mes ose në formë "L".'
      ]
    },
    features: [
      { icon: 'glass', title: { en: 'Laminated safety glass', de: 'Verbundsicherheitsglas', sq: 'Xham sigurie i laminuar' },
        text: { en: '4+4 or 5+5 – strong, safe and well insulated.', de: '4+4 oder 5+5 – stark, sicher und gut isolierend.', sq: '4+4 ose 5+5 – forcë e lartë, izolim i mirë dhe siguri.' } },
      { icon: 'drop', title: { en: 'Concealed drainage', de: 'Verdeckte Entwässerung', sq: 'Drenazhë e fshehur' },
        text: { en: 'Perfect water run-off, minimal maintenance.', de: 'Perfekter Wasserablauf, minimaler Wartungsaufwand.', sq: 'Rrjedhje e përsosur e ujit, mirëmbajtje minimale.' } },
      { icon: 'light', title: { en: 'Samsung LED', de: 'Samsung LED', sq: 'LED Samsung' },
        text: { en: 'Modern, generous lighting and a warm atmosphere.', de: 'Moderne, großzügige Beleuchtung und warme Atmosphäre.', sq: 'Ndriçim modern e i bollshëm, atmosferë e ngrohtë.' } },
      { icon: 'shield', title: { en: 'Multi-seal system', de: 'Mehrfach-Dichtsystem', sq: 'Sistem multi-izolues' },
        text: { en: 'Quality gaskets seal against air and water.', de: 'Hochwertige Dichtungen gegen Luft und Wasser.', sq: 'Gomina cilësore për izolim nga ajri dhe uji.' } },
      { icon: 'layers', title: { en: 'Five configurations', de: 'Fünf Bauformen', sq: 'Pesë forma' },
        text: { en: 'Wall-mounted, freestanding, double or L-shaped.', de: 'Wandmontiert, freistehend, doppelt oder in L-Form.', sq: 'Në mur, vetëqëndruese, dyshe ose në formë "L".' } }
    ],
    specs: [
      material,
      { label: { en: 'Glazing', de: 'Verglasung', sq: 'Xhami' }, value: { en: 'Laminated safety glass 4+4 or 5+5', de: 'Verbundsicherheitsglas 4+4 oder 5+5', sq: 'Xham sigurie i laminuar 4+4 ose 5+5' } },
      { label: { en: 'Max. width', de: 'Max. Breite', sq: 'Gjerësia maks.' }, value: { en: 'Unlimited (coupled)', de: 'Unbegrenzt (gekoppelt)', sq: 'Pa limit (e bashkuar)' } },
      { label: { en: 'Max. projection', de: 'Max. Tiefe', sq: 'Shtrirja maks.' }, value: { en: '400 cm', de: '400 cm', sq: '400 cm' } },
      { label: { en: 'Drainage', de: 'Entwässerung', sq: 'Drenazha' }, value: { en: 'Integrated, concealed', de: 'Integriert, verdeckt', sq: 'E integruar, e fshehur' } },
      { label: { en: 'Option', de: 'Option', sq: 'Opsionale' }, value: { en: 'LED lighting (Samsung)', de: 'LED-Beleuchtung (Samsung)', sq: 'Ndriçim LED (Samsung)' } },
      colour,
      warranty2
    ],
    config: {
      dims: { w: [250, 1500, 500], d: [150, 400, 350], h: [200, 300, 240] },
      fields: [
        { key: 'layout', type: 'choice',
          label: { en: 'Configuration', de: 'Bauform', sq: 'Forma' },
          choices: [
            { value: 'wall', label: { en: 'Wall-mounted', de: 'Wandmontiert', sq: 'Në mur' } },
            { value: 'free', label: { en: 'Freestanding', de: 'Freistehend', sq: 'Vetëqëndruese' } },
            { value: 'double', label: { en: 'Double with middle construction', de: 'Doppelt mit Mittelkonstruktion', sq: 'Dyshe me konstruksion në mes' } },
            { value: 'l-shape', label: { en: 'L-shape', de: 'L-Form', sq: 'Forma "L"' } }
          ] },
        { key: 'color', type: 'color', label: { en: 'Frame colour', de: 'Rahmenfarbe', sq: 'Ngjyra e profilit' }, choices: frameColors },
        { key: 'glass', type: 'choice',
          label: { en: 'Glass', de: 'Glas', sq: 'Xhami' },
          choices: [
            { value: '4+4', label: { en: '4+4 laminated', de: '4+4 VSG', sq: '4+4 i laminuar' } },
            { value: '5+5', label: { en: '5+5 laminated', de: '5+5 VSG', sq: '5+5 i laminuar' } }
          ] },
        { key: 'extras', type: 'multi',
          label: { en: 'Extras', de: 'Extras', sq: 'Shtesa' },
          choices: [
            { value: 'led', label: { en: 'Samsung LED lighting', de: 'Samsung LED-Beleuchtung', sq: 'Ndriçim LED Samsung' } },
            { value: 'awning', label: { en: 'Over-glass awning', de: 'Aufdachmarkise', sq: 'Tendë mbi xham' } },
            { value: 'side-glass', label: { en: 'Glass side walls', de: 'Glas-Seitenwände', sq: 'Mure anësore xhami' } },
            { value: 'zip', label: { en: 'ZIP screens', de: 'ZIP-Screens', sq: 'Perde Zip' } }
          ] }
      ]
    }
  },

  {
    id: 'awning',
    slug: 'over-glass-awning',
    illustration: 'awning',
    name: { en: 'Over-Glass Awning', de: 'Aufdachmarkise', sq: 'Tendë mbi Xham' },
    tagline: {
      en: 'Modern shading for glass roofs and open ceilings – with premium Sattler fabric.',
      de: 'Moderne Beschattung für Glasdächer und offene Decken – mit Premium-Tuch von Sattler.',
      sq: 'Hijezim modern për çati xhami dhe tavane të hapura – me pëlhurë premium Sattler.'
    },
    intro: {
      en: [
        'The TERSUN Over-Glass Awning is the ideal choice wherever modern shading is needed – on glass roofs or open ceilings. It can be mounted above or below the glass and is easily operated by remote control.',
        'Fabrics by the German manufacturer Sattler, a durable aluminium construction and minimal maintenance give it a long service life – and add aesthetic value to every space.'
      ],
      de: [
        'Die TERSUN Aufdachmarkise ist die ideale Wahl überall dort, wo moderne Beschattung gefragt ist – auf Glasdächern oder offenen Decken. Sie wird oberhalb oder unterhalb des Glases montiert und lässt sich bequem per Fernbedienung steuern.',
        'Tücher des deutschen Herstellers Sattler, eine langlebige Aluminiumkonstruktion und minimaler Wartungsaufwand sorgen für eine lange Lebensdauer – und für einen ästhetischen Mehrwert in jedem Ambiente.'
      ],
      sq: [
        'Tenda mbi Xham TERSUN është zgjedhja ideale për çdo hapësirë që kërkon hijezim modern, qoftë në çati prej xhami apo tavane të hapura. Montohet sipër ose nën xham dhe kontrollohet lehtësisht përmes telekomandës.',
        'Pëlhurat e prodhuesit gjerman Sattler, konstruksioni i qëndrueshëm i aluminit dhe mirëmbajtja minimale i japin jetëgjatësi të lartë – dhe shtojnë vlerë estetike në çdo ambient.'
      ]
    },
    features: [
      { icon: 'fabric', title: { en: 'Sattler fabric', de: 'Sattler-Tuch', sq: 'Shtof Sattler' },
        text: { en: 'Premium German fabric with 5-year warranty.', de: 'Premium-Tuch aus Deutschland mit 5 Jahren Garantie.', sq: 'Pëlhurë premium gjermane me 5 vite garancion.' } },
      { icon: 'layers', title: { en: 'Above or below the glass', de: 'Über oder unter dem Glas', sq: 'Sipër ose nën xham' },
        text: { en: 'Two mounting types for every roof.', de: 'Zwei Montagearten für jedes Dach.', sq: 'Dy mënyra montimi për çdo çati.' } },
      { icon: 'motor', title: { en: 'Manual or motorised', de: 'Manuell oder motorisch', sq: 'Manuale ose me motor' },
        text: { en: 'Easy operation by remote control.', de: 'Einfache Bedienung per Fernbedienung.', sq: 'Kontroll i lehtë me telekomandë.' } },
      { icon: 'wind', title: { en: 'Wind sensor', de: 'Windsensor', sq: 'Sensor ere' },
        text: { en: 'Optional automatic retraction in strong wind.', de: 'Optional automatisches Einfahren bei starkem Wind.', sq: 'Opsionalisht mbyllje automatike në erë të fortë.' } }
    ],
    specs: [
      material,
      { label: { en: 'Fabric', de: 'Tuch', sq: 'Shtofi' }, value: { en: 'Sattler', de: 'Sattler', sq: 'Sattler' } },
      { label: { en: 'Mounting', de: 'Montage', sq: 'Montimi' }, value: { en: 'Above or below the glass', de: 'Über oder unter dem Glas', sq: 'Sipër ose nën xham' } },
      { label: { en: 'Operation', de: 'Bedienung', sq: 'Operimi' }, value: { en: 'Manual / automatic', de: 'Manuell / automatisch', sq: 'Manual / automatik' } },
      { label: { en: 'Options', de: 'Optionen', sq: 'Opsionale' }, value: { en: 'Motor, wind sensor', de: 'Motor, Windsensor', sq: 'Motori, sensori i erës' } },
      colour,
      warranty2,
      warranty5
    ],
    config: {
      dims: { w: [250, 700, 500], d: [200, 500, 350], h: [200, 300, 240] },
      preview: { key: 'extension', min: 0, max: 100, value: 80, label: { en: 'Extension', de: 'Ausfahrt', sq: 'Hapja' }, unit: '%' },
      fields: [
        { key: 'position', type: 'choice',
          label: { en: 'Mounting', de: 'Montage', sq: 'Montimi' },
          choices: [
            { value: 'above', label: { en: 'Above the glass', de: 'Über dem Glas', sq: 'Montuar sipër' } },
            { value: 'below', label: { en: 'Below the glass', de: 'Unter dem Glas', sq: 'Montuar nën' } }
          ] },
        { key: 'color', type: 'color', label: { en: 'Frame colour', de: 'Rahmenfarbe', sq: 'Ngjyra e profilit' }, choices: frameColors },
        { key: 'fabric', type: 'color', label: { en: 'Fabric colour', de: 'Tuchfarbe', sq: 'Ngjyra e pëlhurës' }, choices: fabricColors },
        { key: 'existing', type: 'choice',
          label: { en: 'Glass roof', de: 'Glasdach', sq: 'Çatia e xhamit' },
          choices: [
            { value: 'new', label: { en: 'New TERSUN glass roof', de: 'Neues TERSUN Glasdach', sq: 'Mbulojë e re xhami TERSUN' } },
            { value: 'existing', label: { en: 'Existing glass roof', de: 'Bestehendes Glasdach', sq: 'Çati ekzistuese xhami' } }
          ] },
        { key: 'control', type: 'choice',
          label: { en: 'Operation', de: 'Bedienung', sq: 'Operimi' },
          choices: [
            { value: 'motor', label: { en: 'Motor + remote control', de: 'Motor + Fernbedienung', sq: 'Motor + telekomandë' } },
            { value: 'manual', label: { en: 'Manual', de: 'Manuell', sq: 'Manual' } }
          ] },
        { key: 'extras', type: 'multi',
          label: { en: 'Extras', de: 'Extras', sq: 'Shtesa' },
          choices: [
            { value: 'wind-sensor', label: { en: 'Wind sensor', de: 'Windsensor', sq: 'Sensor ere' } }
          ] }
      ]
    }
  },

  {
    id: 'guillotine',
    slug: 'guillotine-premium',
    illustration: 'guillotine',
    name: { en: 'Guillotine Premium', de: 'Guillotine Premium', sq: 'Guillotine Premium' },
    tagline: {
      en: 'Motorised vertical glass in a full aluminium body – with a German Becker motor.',
      de: 'Motorisch vertikal fahrendes Glas im Vollaluminium-Rahmen – mit deutschem Becker-Motor.',
      sq: 'Xham vertikal me motor në trup tërësisht prej alumini – me motor gjerman Becker.'
    },
    intro: {
      en: [
        'Guillotine Premium is built entirely from aluminium with heavy-duty profiles for stability and high resistance to the weather. The glass panels move vertically at the touch of a button, so a terrace can be fully open, partly open as a balustrade or completely closed.',
        'A Becker motor made in Germany drives the system, operated by remote control. Choose laminated safety glass 4+4 or insulated glass 4+14+4 – insulation with a modern design, elegant lines and a premium finish.'
      ],
      de: [
        'Guillotine Premium ist vollständig aus Aluminium mit kräftigen Profilen gefertigt – für Stabilität und hohe Wetterbeständigkeit. Die Glaspaneele fahren auf Knopfdruck vertikal, sodass die Terrasse ganz offen, halb offen als Brüstung oder vollständig geschlossen sein kann.',
        'Angetrieben wird das System von einem Becker-Motor „Made in Germany“, bedient per Fernbedienung. Wählen Sie Verbundsicherheitsglas 4+4 oder Isolierglas 4+14+4 – Isolierung mit modernem Design, eleganten Linien und hochwertigem Finish.'
      ],
      sq: [
        'Guillotine Premium është sistem i ndërtuar plotësisht nga alumini me profile të trasha për qëndrueshmëri dhe rezistencë të lartë ndaj kushteve atmosferike. Panelet e xhamit lëvizin vertikalisht me një prekje butoni, kështu tarraca mund të jetë plotësisht e hapur, pjesërisht e hapur si parmak ose plotësisht e mbyllur.',
        'Sistemi lëviz me motor Becker të prodhuar në Gjermani dhe kontrollohet me telekomandë. Zgjidhni xham sigurie 4+4 ose xham termopan 4+14+4 – izolim me dizajn modern, linja elegante dhe përfundim premium.'
      ]
    },
    features: [
      { icon: 'shield', title: { en: 'Full aluminium body', de: 'Vollaluminium-Rahmen', sq: 'Trup tërësisht alumini' },
        text: { en: 'Heavy-duty profiles, highly weather-resistant.', de: 'Kräftige Profile, hoch wetterbeständig.', sq: 'Profile të trasha, rezistencë e lartë ndaj motit.' } },
      { icon: 'motor', title: { en: 'Becker motor', de: 'Becker-Motor', sq: 'Motor Becker' },
        text: { en: 'Made in Germany, with remote control.', de: 'Made in Germany, mit Fernbedienung.', sq: 'Prodhim gjerman, me telekomandë.' } },
      { icon: 'glass', title: { en: 'Safety or insulated glass', de: 'Sicherheits- oder Isolierglas', sq: 'Xham sigurie ose termopan' },
        text: { en: '4+4 laminated or 4+14+4 insulated.', de: '4+4 VSG oder 4+14+4 Isolierglas.', sq: '4+4 sigurie ose 4+14+4 termopan.' } },
      { icon: 'ruler', title: { en: 'Up to 4 × 4 m', de: 'Bis 4 × 4 m', sq: 'Deri në 4 × 4 m' },
        text: { en: 'Max. width 400 cm, max. height 400 cm.', de: 'Max. Breite 400 cm, max. Höhe 400 cm.', sq: 'Gjerësi maks. 400 cm, lartësi maks. 400 cm.' } }
    ],
    specs: [
      material,
      { label: { en: 'Operation', de: 'Bedienung', sq: 'Operimi' }, value: { en: 'Automatic, remote control', de: 'Automatisch, Fernbedienung', sq: 'Automatik, me telekomandë' } },
      { label: { en: 'Motor', de: 'Motor', sq: 'Motori' }, value: { en: 'Becker, made in Germany', de: 'Becker, Made in Germany', sq: 'Becker, prodhim gjerman' } },
      { label: { en: 'Glass', de: 'Glas', sq: 'Xhami' }, value: { en: '4+4 safety glass / 4+14+4 insulated glass', de: '4+4 Sicherheitsglas / 4+14+4 Isolierglas', sq: '4+4 xham sigurie / 4+14+4 xham termopan' } },
      { label: { en: 'Max. width', de: 'Max. Breite', sq: 'Gjerësia maks.' }, value: { en: '400 cm', de: '400 cm', sq: '400 cm' } },
      { label: { en: 'Max. height', de: 'Max. Höhe', sq: 'Lartësia maks.' }, value: { en: '400 cm', de: '400 cm', sq: '400 cm' } },
      colour
    ],
    config: {
      dims: { w: [100, 400, 350], h: [100, 400, 250] },
      preview: { key: 'open', min: 0, max: 100, value: 35, label: { en: 'Opening', de: 'Öffnung', sq: 'Hapja' }, unit: '%' },
      fields: [
        { key: 'color', type: 'color', label: { en: 'Frame colour', de: 'Rahmenfarbe', sq: 'Ngjyra e profilit' }, choices: frameColors },
        glassChoices,
        { key: 'units', type: 'number', min: 1, max: 20, value: 1,
          label: { en: 'Number of units', de: 'Anzahl Elemente', sq: 'Numri i njësive' } },
        motorControl
      ]
    }
  },

  {
    id: 'slide',
    slug: 'slide-premium',
    illustration: 'slide',
    name: { en: 'Slide Premium', de: 'Slide Premium', sq: 'Slide Premium' },
    tagline: {
      en: 'Sliding glass walls with multi-chamber profiles, lockable handles and quiet aluminium rollers.',
      de: 'Schiebeglaswände mit Mehrkammerprofilen, abschließbaren Griffen und leisen Aluminiumrollen.',
      sq: 'Mure xhami rrëshqitës me profile të shumëfishta, doreza me çelës dhe rrota alumini të qeta.'
    },
    intro: {
      en: [
        'The Slide Premium sliding glass system insulates thanks to its multi-chamber profiles and the choice of 4+4 mm safety glass or 22 mm insulated glass. The premium aluminium construction guarantees durability and resistance to the weather.',
        'Elegant handles with key locks provide maximum security and comfort, while the quiet movement on aluminium rollers makes the system ideal for modern homes, restaurants and high-end terraces.'
      ],
      de: [
        'Das Schiebeglassystem Slide Premium isoliert dank Mehrkammerprofilen und der Wahl zwischen 4+4 mm Sicherheitsglas oder 22 mm Isolierglas. Die hochwertige Aluminiumkonstruktion garantiert Langlebigkeit und Wetterbeständigkeit.',
        'Elegante, abschließbare Griffe sorgen für maximale Sicherheit und Komfort, der leise Lauf auf Aluminiumrollen macht das System ideal für moderne Wohnräume, Restaurants und anspruchsvolle Terrassen.'
      ],
      sq: [
        'Sistemi i xhamave rrëshqitës Slide Premium ofron izolim falë profileve të shumëfishta dhe mundësisë së përdorimit të xhamit sigurie 4+4 mm ose xhamit termopan 22 mm. Konstruksioni premium i aluminit garanton qëndrueshmëri dhe rezistencë ndaj kushteve atmosferike.',
        'Dorezat elegante me kyçje me çelës sigurojnë siguri maksimale dhe komoditet në përdorim, ndërsa lëvizja e qetë mbi rrota alumini e bën sistemin ideal për ambiente moderne banimi, restorante dhe terasa me standard të lartë.'
      ]
    },
    features: [
      { icon: 'glass', title: { en: 'Safety or insulated glass', de: 'Sicherheits- oder Isolierglas', sq: 'Xham sigurie ose termopan' },
        text: { en: '4+4 mm laminated or 22 mm insulated.', de: '4+4 mm VSG oder 22 mm Isolierglas.', sq: '4+4 mm sigurie ose 22 mm termopan.' } },
      { icon: 'slide', title: { en: 'Multi-chamber profiles', de: 'Mehrkammerprofile', sq: 'Profile të shumëfishta' },
        text: { en: 'Insulation and stability in a slim frame.', de: 'Isolierung und Stabilität im schlanken Rahmen.', sq: 'Izolim dhe qëndrueshmëri në profil të hollë.' } },
      { icon: 'lock', title: { en: 'Lockable handles', de: 'Abschließbare Griffe', sq: 'Doreza me çelës' },
        text: { en: 'Elegant handles with key lock.', de: 'Elegante Griffe mit Schlüsselschloss.', sq: 'Doreza elegante me kyçje me çelës.' } },
      { icon: 'threshold', title: { en: 'Aluminium rollers', de: 'Aluminiumrollen', sq: 'Rrota alumini' },
        text: { en: 'Quiet, smooth sliding.', de: 'Leiser, sanfter Lauf.', sq: 'Lëvizje e qetë dhe e butë.' } }
    ],
    specs: [
      material,
      { label: { en: 'Glass', de: 'Glas', sq: 'Xhami' }, value: { en: '4+4 safety glass / 4+14+4 insulated glass', de: '4+4 Sicherheitsglas / 4+14+4 Isolierglas', sq: '4+4 xham sigurie / 4+14+4 xham termopan' } },
      { label: { en: 'Locking', de: 'Verriegelung', sq: 'Kyçja' }, value: { en: 'Handles with key lock', de: 'Griffe mit Schlüsselschloss', sq: 'Doreza me çelës' } },
      { label: { en: 'Max. width', de: 'Max. Breite', sq: 'Gjerësia maks.' }, value: { en: '400 cm', de: '400 cm', sq: '400 cm' } },
      { label: { en: 'Max. height', de: 'Max. Höhe', sq: 'Lartësia maks.' }, value: { en: '300 cm', de: '300 cm', sq: '300 cm' } },
      colour
    ],
    config: {
      dims: { w: [100, 400, 400], h: [100, 300, 240] },
      preview: { key: 'open', min: 0, max: 100, value: 30, label: { en: 'Opening', de: 'Öffnung', sq: 'Hapja' }, unit: '%' },
      fields: [
        { key: 'color', type: 'color', label: { en: 'Frame colour', de: 'Rahmenfarbe', sq: 'Ngjyra e profilit' }, choices: frameColors },
        { key: 'tracks', type: 'number', min: 2, max: 6, value: 4,
          label: { en: 'Number of panels', de: 'Anzahl Paneele', sq: 'Numri i paneleve' } },
        glassChoices,
        { key: 'units', type: 'number', min: 1, max: 20, value: 1,
          label: { en: 'Number of units', de: 'Anzahl Elemente', sq: 'Numri i njësive' } }
      ]
    }
  },

  {
    id: 'zip',
    slug: 'zip-screen',
    illustration: 'zip',
    name: { en: 'ZIP Screen', de: 'ZIP-Screen', sq: 'Sistemi i Perdes Zip' },
    tagline: {
      en: 'Automatic protection from sun, wind and insects – with Sattler fabric in zip-guided side rails.',
      de: 'Automatischer Schutz vor Sonne, Wind und Insekten – mit Sattler-Tuch in Reißverschluss-Seitenführungen.',
      sq: 'Mbrojtje automatike nga dielli, era dhe insektet – me pëlhurë Sattler në profile anësore me zinxhir.'
    },
    intro: {
      en: [
        'The TERSUN ZIP Screen is an automatic solution for protection from sun and wind, distinguished by its modern, elegant look. The fabric moves vertically in the side profiles, operated by remote control with smooth, quiet movement.',
        'It protects from insects, sun and wind and gives privacy – on pergolas, glass roofs, windows and open façades. Fabrics by Sattler carry a 5-year warranty.'
      ],
      de: [
        'Der TERSUN ZIP-Screen ist eine automatische Lösung für Sonnen- und Windschutz mit moderner, eleganter Optik. Das Tuch läuft senkrecht in den Seitenprofilen, bedient per Fernbedienung – leise und komfortabel.',
        'Er schützt vor Insekten, Sonne und Wind und sorgt für Privatsphäre – an Pergolen, Glasdächern, Fenstern und offenen Fassaden. Die Tücher von Sattler haben 5 Jahre Garantie.'
      ],
      sq: [
        'Perdja Zip TERSUN është një zgjidhje automatike për mbrojtje nga dielli dhe era, që dallohet për pamjen e saj moderne dhe elegante. Rrjeta lëviz në mënyrë vertikale nëpër profilet anësore, funksionon me telekomandë dhe ka lëvizje praktike e të qetë.',
        'Mbron nga insektet, dielli dhe era dhe ofron privatësi – në pergola, mbuloja xhami, dritare dhe fasada të hapura. Pëlhurat Sattler kanë 5 vite garancion.'
      ]
    },
    features: [
      { icon: 'insect', title: { en: 'Insect protection', de: 'Insektenschutz', sq: 'Mbrojtje nga insektet' },
        text: { en: 'No side gaps when closed.', de: 'Keine seitlichen Spalten im geschlossenen Zustand.', sq: 'Pa hapësira anësore kur mbyllet.' } },
      { icon: 'sun', title: { en: 'Sun protection', de: 'Sonnenschutz', sq: 'Mbrojtje nga dielli' },
        text: { en: 'Shade and glare control.', de: 'Schatten und Blendschutz.', sq: 'Hije dhe mbrojtje nga verbimi.' } },
      { icon: 'wind', title: { en: 'Wind protection', de: 'Windschutz', sq: 'Mbrojtje nga era' },
        text: { en: 'Zip-guided edges keep the fabric taut.', de: 'Reißverschluss-Führung hält das Tuch straff.', sq: 'Skajet me zinxhir e mbajnë pëlhurën të tendosur.' } },
      { icon: 'shield', title: { en: 'Privacy', de: 'Privatsphäre', sq: 'Privatësi' },
        text: { en: 'Protection from view on terraces and façades.', de: 'Sichtschutz für Terrassen und Fassaden.', sq: 'Mbrojtje nga shikimet në tarraca dhe fasada.' } },
      { icon: 'fabric', title: { en: 'Sattler fabric', de: 'Sattler-Tuch', sq: 'Shtof Sattler' },
        text: { en: 'Premium German fabric, 5-year warranty.', de: 'Premium-Tuch aus Deutschland, 5 Jahre Garantie.', sq: 'Pëlhurë premium gjermane, 5 vite garancion.' } },
      { icon: 'motor', title: { en: 'Automatic', de: 'Automatisch', sq: 'Automatike' },
        text: { en: 'Motorised with remote control, optional wind sensor.', de: 'Motorisch mit Fernbedienung, optional Windsensor.', sq: 'Me motor dhe telekomandë, opsionalisht sensor ere.' } }
    ],
    specs: [
      material,
      { label: { en: 'Fabric', de: 'Tuch', sq: 'Shtofi' }, value: { en: 'Sattler, in zip-guided side profiles', de: 'Sattler, in Reißverschluss-Seitenprofilen', sq: 'Sattler, në profile anësore me zinxhir' } },
      { label: { en: 'Operation', de: 'Bedienung', sq: 'Operimi' }, value: { en: 'Automatic, remote control', de: 'Automatisch, Fernbedienung', sq: 'Automatik, me telekomandë' } },
      { label: { en: 'Option', de: 'Option', sq: 'Opsionale' }, value: { en: 'Wind sensor', de: 'Windsensor', sq: 'Sensori i erës' } },
      { label: { en: 'Max. width', de: 'Max. Breite', sq: 'Gjerësia maks.' }, value: { en: '500 cm', de: '500 cm', sq: '500 cm' } },
      { label: { en: 'Max. height', de: 'Max. Höhe', sq: 'Lartësia maks.' }, value: { en: '350 cm', de: '350 cm', sq: '350 cm' } },
      colour,
      warranty2,
      warranty5
    ],
    config: {
      dims: { w: [80, 500, 300], h: [100, 350, 250] },
      preview: { key: 'open', min: 0, max: 100, value: 25, label: { en: 'Raised', de: 'Hochgefahren', sq: 'E ngritur' }, unit: '%' },
      fields: [
        { key: 'color', type: 'color', label: { en: 'Cassette colour', de: 'Kassettenfarbe', sq: 'Ngjyra e kasetës' }, choices: frameColors },
        { key: 'fabric', type: 'color', label: { en: 'Fabric colour', de: 'Tuchfarbe', sq: 'Ngjyra e pëlhurës' }, choices: fabricColors },
        { key: 'units', type: 'number', min: 1, max: 20, value: 1,
          label: { en: 'Number of screens', de: 'Anzahl Screens', sq: 'Numri i perdeve' } },
        motorControl,
        { key: 'extras', type: 'multi',
          label: { en: 'Extras', de: 'Extras', sq: 'Shtesa' },
          choices: [
            { value: 'wind-sensor', label: { en: 'Wind sensor', de: 'Windsensor', sq: 'Sensor ere' } }
          ] }
      ]
    }
  }
];
