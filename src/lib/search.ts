import type { Category, Lang, Product } from './types';

const FOLD: Record<string, string> = { č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj', ë: 'e', ç: 'c', ä: 'a', ö: 'o', ü: 'u', ß: 'ss' };

/** Lower-case and strip diacritics so "šipka", "sipka" and "ŠIPKA" (or "Markise"/"MARKISE", "Glasdächer"/"glasdacher") all match. */
export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/[čćšžđëçäöüß]/g, (c) => FOLD[c] ?? c)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');
}

export function searchProducts(products: Product[], categories: Category[], query: string, lang: Lang): Product[] {
  const q = fold(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const cat = categories.find((c) => c.id === p.categoryId);
    const name = fold(`${p.name[lang]} ${p.name.de}`);
    const hay = fold(`${p.name[lang]} ${p.name.de} ${p.name.en} ${p.short[lang]} ${p.sku} ${cat ? `${cat.name[lang]} ${cat.name.de}` : ''}`);
    let score = 0;
    let all = true;
    for (const term of terms) {
      if (name.includes(term)) score += name.startsWith(term) ? 6 : 4;
      else if (hay.includes(term)) score += 1.5;
      else all = false;
    }
    if (all && score > 0) scored.push({ p, score: score + Math.log10(p.sold + 10) * 0.3 });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}
