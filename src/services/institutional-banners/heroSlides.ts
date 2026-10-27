import type { PublicInstitutionalBanner } from "./types";

export type HeroSlide =
  | { type: "static"; id: "hero-static" }
  | ({ type: "banner" } & PublicInstitutionalBanner);

export const bannerImageKey = (banner: PublicInstitutionalBanner) =>
  `${banner.id}:${banner.imageUrl}`;

export function buildHeroSlides(
  banners: PublicInstitutionalBanner[],
  failedImages: ReadonlySet<string> = new Set(),
): HeroSlide[] {
  const seen = new Set<string>();
  const ordered = banners.filter((banner) => {
    if (!banner.imageUrl?.trim() || seen.has(banner.id)) return false;
    seen.add(banner.id);
    return true;
  }).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const candidates = ordered.filter((banner) => banner.isPrimary === true);
  const available = ordered.filter((banner) => !failedImages.has(bannerImageKey(banner)));
  const primary = candidates.length === 1 && available.includes(candidates[0])
    ? candidates[0]
    : undefined;
  const slides = available.map((banner) => ({ ...banner, type: "banner" as const }));
  if (!primary) return [{ type: "static", id: "hero-static" }, ...slides];
  return [
    { ...primary, type: "banner" },
    ...slides.filter((banner) => banner.id !== primary.id),
  ];
}
