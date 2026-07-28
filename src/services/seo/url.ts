import { SITE_ORIGIN } from "@/config/site";

export function normalizePathname(value: string) {
  const pathname = value.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/+$/, "");
}

export function buildCanonicalUrl(value: string) {
  return `${SITE_ORIGIN}${normalizePathname(value)}`;
}

export function buildAbsoluteAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
