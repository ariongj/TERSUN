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

/** Common Albanian / English / German endings (definite, plural, case forms). */
const ENDINGS = '(?:ing|ave|eve|as|es|is|at|et|it|in|en|ve|s|a|e|i|n)';

/**
 * Crude stem of a folded word: drops one ending so the indefinite, definite and plural forms meet —
 * "pergolë", "pergola", "pergolat", "pergolas", "Pergolen" → "pergol"; "tendë"/"tenda" → "tend"; "xhami" → "xham";
 * "sliding" → "slid". Short words are left alone.
 */
function stem(w: string) {
  if (w.length < 5) return w;
  const s = w.replace(new RegExp(`${ENDINGS}$`), '');
  return s.length >= 4 ? s : w;
}

/**
 * A word ending in `st` plus at most one of the endings: "pergol" → pergola, pergolë, Pergolen; "markis" → Markise and
 * the German compound Aufdachmarkise; but "ngroh" (ngrohës, heater) does not reach "ngrohtë" (warm).
 */
const stemRe = (st: string) => new RegExp(`${st.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${ENDINGS}?(?![a-z0-9])`);

/** Products matching every term of `query`, in any of the three languages (names and category names), best first. */
export function searchProducts(products: Product[], categories: Category[], query: string, lang: Lang): Product[] {
  const q = fold(query.trim());
  if (!q) return [];
  const terms = q
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => {
      const st = stem(term);
      return { term, re: st !== term ? stemRe(st) : null };
    });
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const cat = categories.find((c) => c.id === p.categoryId);
    const name = fold(`${p.name[lang]} ${p.name.de} ${p.name.sq} ${p.name.en}`);
    const hay = fold(`${name} ${p.short[lang]} ${p.sku} ${cat ? `${cat.name.de} ${cat.name.sq} ${cat.name.en}` : ''}`);
    let score = 0;
    let all = true;
    for (const { term, re } of terms) {
      if (name.includes(term)) score += name.startsWith(term) ? 6 : 4;
      else if (re?.test(name)) score += 3;
      else if (hay.includes(term)) score += 1.5;
      else if (re?.test(hay)) score += 1;
      else all = false;
    }
    if (all && score > 0) scored.push({ p, score: score + Math.log10(p.sold + 10) * 0.3 });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}
