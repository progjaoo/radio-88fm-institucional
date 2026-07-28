import fs from "node:fs";
import path from "node:path";
import { SITE_ORIGIN } from "../src/config/site";
import { routeSeoConfigs } from "../src/services/seo/seoConfig";
import type { RouteSeoConfig } from "../src/services/seo/seo.types";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateSitemap(routes: RouteSeoConfig[], origin: string) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const urls = routes
    .filter((route) => route.indexable)
    .map((route) => `${normalizedOrigin}${route.path === "/" ? "/" : route.path}`)
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function writeSitemap() {
  const outputPath = path.resolve("public/sitemap.xml");
  fs.writeFileSync(outputPath, generateSitemap(routeSeoConfigs, SITE_ORIGIN), "utf8");
  return outputPath;
}

if (process.argv[1]?.includes("generate-sitemap")) {
  const outputPath = writeSitemap();
  console.info(`Sitemap gerado em ${outputPath}`);
}
