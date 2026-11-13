import { useMemo } from 'react';
import { useDb } from '@/store/db';
import type { Post } from '@/lib/types';
import { slugify } from '@/lib/utils';

/** Language-independent key for a post's tag (used in ?tag= filters). */
export const tagKey = (p: Post) => slugify(p.tag.de);

export const postHref = (p: Post) => `/journal/${p.slug}`;

/* Visibility as set in the CMS: draft (published: false), hidden (direct link only), published — and a publish
   date in the future means scheduled (not public yet). */
type Pub = { published: boolean; hidden?: boolean; publishedAt?: string };
const dateReached = (iso?: string) => !iso || !(new Date(iso).getTime() > Date.now());
/** Can be opened by its address: published (or hidden) and its publish date has come. */
export const isReachable = (r: Pub) => r.published && dateReached(r.publishedAt);
/** Shown in lists, menus and the footer: reachable and not hidden. */
export const isListed = (r: Pub) => isReachable(r) && !r.hidden;

/** Posts listed on the site (published, not hidden, publish date reached), newest first. */
export function usePublishedPosts() {
  const posts = useDb((s) => s.posts);
  return useMemo(() => posts.filter((p) => isListed(p as Pub)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), [posts]);
}

/** A post by its address — hidden posts too (direct link), never drafts or scheduled ones. */
export function useReachablePost(slug: string | undefined) {
  const posts = useDb((s) => s.posts);
  return useMemo(() => posts.find((p) => p.slug === slug && isReachable(p as Pub)), [posts, slug]);
}

/** `## Heading` lines of a markdown body — used for the article table of contents. */
export function headingsOf(md: string) {
  return md
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).replace(/\*\*?|\[|\]\([^)]*\)/g, '').trim());
}

/** "tel:" href from a human-formatted phone number. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Copy text to the clipboard with a fallback for older / non-secure contexts. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
