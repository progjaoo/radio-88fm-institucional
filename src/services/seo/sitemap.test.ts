import { describe, expect, it } from "vitest";
import { routeSeoConfigs } from "./seoConfig";
import { generateSitemap } from "../../../scripts/generate-sitemap";

describe("generateSitemap", () => {
  it("emits only indexable canonical URLs", () => {
    const xml = generateSitemap(routeSeoConfigs, "https://www.radio88fm.com");

    expect(xml).toContain("<loc>https://www.radio88fm.com/</loc>");
    expect(xml).toContain("<loc>https://www.radio88fm.com/nossa-radio</loc>");
    expect(xml).not.toContain("/privacidade</loc>");
    expect(xml).not.toContain("vercel.app");
    expect(xml).not.toContain("<lastmod>");
  });
});
