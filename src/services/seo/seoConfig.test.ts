import { describe, expect, it } from "vitest";
import { INDEXABLE_ROUTE_PATHS, routeSeoConfigs } from "./seoConfig";

describe("route SEO configuration", () => {
  it("covers every public route with unique titles and descriptions", () => {
    const paths = routeSeoConfigs.map((route) => route.path);
    const titles = routeSeoConfigs.map((route) => route.title);
    const descriptions = routeSeoConfigs.map((route) => route.description);

    expect(paths).toEqual([
      "/",
      "/nossa-radio",
      "/equipe",
      "/programacao",
      "/anuncie",
      "/ouvir",
      "/assistir",
      "/privacidade",
    ]);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("uses the requested Radio 88 FM logo for every social preview", () => {
    expect(routeSeoConfigs.every((route) => route.imagePath === "/logo-88fm.png")).toBe(true);
  });

  it("excludes functional privacy content from the sitemap", () => {
    expect(INDEXABLE_ROUTE_PATHS).not.toContain("/privacidade");
    expect(INDEXABLE_ROUTE_PATHS).toContain("/nossa-radio");
  });
});
