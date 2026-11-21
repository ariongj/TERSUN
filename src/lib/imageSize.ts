// Intrinsic size of a bundled picture (build-time table from public/images, see vite.config.ts → imageSizes), so
// <img> elements can declare width/height: the browser reserves their space before the file arrives.
import sizes from 'virtual:image-sizes';

const BASE = import.meta.env.BASE_URL || '/';

export function sizeOf(src: string | undefined | null): { width?: number; height?: number } {
  if (!src || /^(data:|blob:|https?:)/.test(src)) return {};
  const key = (src.startsWith(BASE) ? src.slice(BASE.length) : src.replace(/^\/+/, '')).split(/[?#]/)[0];
  const s = sizes[key];
  return s ? { width: s[0], height: s[1] } : {};
}
