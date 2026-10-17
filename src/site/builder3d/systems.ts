import type { L10n } from '@/lib/types';
import type { SystemType } from './viewer';

const T = (de: string, sq: string, en: string): L10n => ({ de, sq, en });

export type Choice = { id: string; label: L10n; hex?: string };
export type Field =
  | { key: string; kind: 'choice'; label: L10n; choices: Choice[] }
  | { key: string; kind: 'toggle'; label: L10n };

export interface SystemDef {
  id: SystemType;
  /** catalogue category + the product the quote is filed against */
  categoryId: string;
  productId: string;
  name: L10n;
  image: string;
  dims: { w: [number, number, number]; d?: [number, number, number]; h: [number, number, number] };
  preview: { key: 'angle' | 'open' | 'extension'; label: L10n; min: number; max: number; value: number; unit: string };
  fabric?: boolean;
  fields: Field[];
}

export const FRAME_COLORS: Choice[] = [
  { id: 'RAL 7016', hex: '#383e42', label: T('Anthrazit', 'Antracit', 'Anthracite') },
  { id: 'RAL 9005', hex: '#141416', label: T('Tiefschwarz', 'E zezë', 'Jet black') },
  { id: 'RAL 9016', hex: '#f1f0ea', label: T('Verkehrsweiß', 'E bardhë', 'Traffic white') },
  { id: 'RAL 9007', hex: '#8f8f8c', label: T('Graualuminium', 'Alumin gri', 'Grey aluminium') },
  { id: 'RAL 1036', hex: '#8c6a3a', label: T('Perlgold', 'Ar perle', 'Pearl gold') },
];

export const FABRIC_COLORS: Choice[] = [
  { id: 'charcoal', hex: '#4a4846', label: T('Anthrazit', 'Qymyr', 'Charcoal') },
  { id: 'stone', hex: '#8a8783', label: T('Steingrau', 'Gri guri', 'Stone grey') },
  { id: 'sand', hex: '#cbbfa8', label: T('Sand', 'Rërë', 'Sand') },
  { id: 'pearl', hex: '#e9e6df', label: T('Perlweiß', 'E bardhë perle', 'Pearl white') },
];

const led: Field = { key: 'led', kind: 'toggle', label: T('LED-Beleuchtung', 'Ndriçim LED', 'LED lighting') };

export const SYSTEMS: SystemDef[] = [
  {
    id: 'bioclimatic',
    categoryId: 'cat-bioclimatic',
    productId: 'p-bio-free',
    name: T('Bioklimatische Pergola', 'Sistemi Bioklimatik', 'Bioclimatic System'),
    image: '/images/cat/bioclimatic.webp',
    dims: { w: [200, 1200, 450], d: [200, 800, 350], h: [220, 300, 260] },
    preview: { key: 'angle', label: T('Lamellenwinkel', 'Këndi i lamelave', 'Louvre angle'), min: 0, max: 135, value: 35, unit: '°' },
    fields: [
      { key: 'layout', kind: 'choice', label: T('Ausführung', 'Versioni', 'Version'), choices: [
        { id: 'standard', label: T('Standard', 'Standard', 'Standard') },
        { id: 'double', label: T('Doppel', 'Dyshe', 'Double') },
        { id: 'modular', label: T('Modular', 'Modulare', 'Modular') },
      ] },
      { key: 'mount', kind: 'choice', label: T('Montage', 'Montimi', 'Mounting'), choices: [
        { id: 'free', label: T('Freistehend', 'E pavarur', 'Freestanding') },
        { id: 'wall', label: T('Wand', 'Në mur', 'Wall') },
      ] },
      { key: 'side', kind: 'choice', label: T('Seiten', 'Anësoret', 'Sides'), choices: [
        { id: 'none', label: T('Offen', 'E hapur', 'Open') },
        { id: 'zip', label: T('ZIP', 'Zip', 'ZIP') },
        { id: 'guillotine', label: T('Guillotine', 'Guillotine', 'Guillotine') },
        { id: 'slide', label: T('Slide', 'Slide', 'Slide') },
        { id: 'panel', label: T('Paneele', 'Panele', 'Panels') },
      ] },
      led,
    ],
  },
  {
    id: 'glassroof',
    categoryId: 'cat-glass-roof',
    productId: 'p-glass-wall',
    name: T('Glasdach', 'Mbulojë Xhami', 'Glass Roof'),
    image: '/images/cat/glass-roof.webp',
    dims: { w: [250, 1500, 500], d: [150, 400, 350], h: [200, 300, 240] },
    preview: { key: 'extension', label: T('Markise', 'Tenda', 'Awning'), min: 0, max: 100, value: 0, unit: '%' },
    fields: [
      { key: 'layout', kind: 'choice', label: T('Bauform', 'Forma', 'Configuration'), choices: [
        { id: 'wall', label: T('Wand', 'Në mur', 'Wall') },
        { id: 'free', label: T('Freistehend', 'Vetëqëndruese', 'Freestanding') },
        { id: 'double', label: T('Doppel', 'Dyshe', 'Double') },
        { id: 'l-shape', label: T('L-Form', 'Forma L', 'L-shape') },
      ] },
      led,
    ],
  },
  {
    id: 'awning',
    categoryId: 'cat-awning',
    productId: 'p-awning',
    name: T('Aufdachmarkise', 'Tendë mbi Xham', 'Over-Glass Awning'),
    image: '/images/cat/awning.webp',
    dims: { w: [250, 700, 500], d: [200, 500, 350], h: [200, 300, 240] },
    preview: { key: 'extension', label: T('Ausfahrt', 'Hapja', 'Extension'), min: 0, max: 100, value: 80, unit: '%' },
    fabric: true,
    fields: [led],
  },
  {
    id: 'guillotine',
    categoryId: 'cat-guillotine',
    productId: 'p-guillotine',
    name: T('Guillotine Premium', 'Guillotine Premium', 'Guillotine Premium'),
    image: '/images/cat/guillotine.webp',
    dims: { w: [100, 400, 350], h: [100, 400, 250] },
    preview: { key: 'open', label: T('Öffnung', 'Hapja', 'Opening'), min: 0, max: 100, value: 35, unit: '%' },
    fields: [],
  },
  {
    id: 'slide',
    categoryId: 'cat-slide',
    productId: 'p-slide',
    name: T('Slide Premium', 'Slide Premium', 'Slide Premium'),
    image: '/images/cat/slide.webp',
    dims: { w: [100, 400, 400], h: [100, 300, 240] },
    preview: { key: 'open', label: T('Öffnung', 'Hapja', 'Opening'), min: 0, max: 100, value: 30, unit: '%' },
    fields: [
      { key: 'tracks', kind: 'choice', label: T('Paneele', 'Panele', 'Panels'), choices: ['3', '4', '5', '6'].map((n) => ({ id: n, label: T(n, n, n) })) },
    ],
  },
  {
    id: 'zip',
    categoryId: 'cat-zip',
    productId: 'p-zip',
    name: T('ZIP-Screen', 'Perde Zip', 'ZIP Screen'),
    image: '/images/cat/zip.webp',
    dims: { w: [80, 500, 300], h: [100, 350, 250] },
    preview: { key: 'open', label: T('Hochgefahren', 'E ngritur', 'Raised'), min: 0, max: 100, value: 25, unit: '%' },
    fabric: true,
    fields: [],
  },
];

export const systemById = (id: string | null | undefined) => SYSTEMS.find((s) => s.id === id);
export const systemForCategory = (categoryId: string) => SYSTEMS.find((s) => s.categoryId === categoryId);
