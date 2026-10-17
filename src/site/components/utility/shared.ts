import type { Lang } from '@/lib/types';

/** Popular searches per storefront language — every term returns results in the seeded catalogue. */
export const POPULAR_SEARCHES: Record<Lang, string[]> = {
  de: ['Pergola', 'Glasdach', 'Markise', 'Guillotine', 'Slide', 'ZIP', 'LED', 'Heizstrahler'],
  sq: ['pergolë', 'xham', 'tendë', 'guillotine', 'slide', 'Zip', 'LED', 'ngrohës'],
  en: ['pergola', 'glass roof', 'awning', 'guillotine', 'sliding', 'ZIP', 'LED', 'heater'],
};

/**
 * Plural category for counted nouns. German, Albanian and English use the singular
 * only for exactly 1: "1 Produkt", "21 Produkte".
 */
export function pluralOne(n: number, lang: Lang) {
  if (lang === 'de') return n === 1;
  return n === 1;
}

/** Best sellers with variety: the top seller of each category first, then the rest by sales. */
export function diverseBestsellers<P extends { id: string; categoryId: string; sold: number }>(products: P[], n: number): P[] {
  const sorted = [...products].sort((a, b) => b.sold - a.sold);
  const seen = new Set<string>();
  const firstPass = sorted.filter((p) => (seen.has(p.categoryId) ? false : (seen.add(p.categoryId), true)));
  const rest = sorted.filter((p) => !firstPass.includes(p));
  return [...firstPass, ...rest].slice(0, n);
}
