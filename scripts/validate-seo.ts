import fs from "node:fs";
import path from "node:path";
import { SITE_ORIGIN } from "../src/config/site";
import { INDEXABLE_ROUTE_PATHS } from "../src/services/seo/seoConfig";

const SITE_URL = SITE_ORIGIN;

function requireFile(relativePath: string) {
  const absolutePath = path.resolve(relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Arquivo SEO ausente: ${relativePath}`);
  return fs.readFileSync(absolutePath, "utf8");
}

function routeOutputPath(route: string) {
  return route === "/" ? "dist/index.html" : `dist${route}/index.html`;
}

function hasTagWithAttributes(html: string, tag: "link" | "meta", attributes: string[]) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
  return tags.some((candidate) => attributes.every((attribute) => candidate.includes(attribute)));
}

function validateIndexableRoute(route: string) {
  const html = requireFile(routeOutputPath(route));
  const canonical = `${SITE_URL}${route === "/" ? "/" : route}`;

  if (!hasTagWithAttributes(html, "link", ['rel="canonical"', `href="${canonical}"`])) {
    throw new Error(`Canonical ausente ou incorreta em ${route}: ${canonical}`);
  }
  if (!hasTagWithAttributes(html, "meta", ['name="description"', 'content="'])) {
    throw new Error(`Meta description ausente em ${route}`);
  }
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) {
    throw new Error(`Heading principal h1 ausente em ${route}`);
  }
  if (hasTagWithAttributes(html, "meta", ['name="robots"', 'noindex'])) {
    throw new Error(`Rota indexável marcada como noindex: ${route}`);
  }
}

const indexHtml = requireFile("dist/index.html");
const sitemap = requireFile("dist/sitemap.xml");
const robots = requireFile("dist/robots.txt");
requireFile("dist/logo-88fm.png");

for (const route of INDEXABLE_ROUTE_PATHS) {
  validateIndexableRoute(route);
  const canonical = `${SITE_URL}${route === "/" ? "/" : route}`;
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    throw new Error(`Rota indexável ausente no sitemap: ${route}`);
  }
}

for (const attributeSet of [
  ['property="og:image"', `content="${SITE_URL}/logo-88fm.png"`],
  ['name="twitter:image"', `content="${SITE_URL}/logo-88fm.png"`],
]) {
  if (!hasTagWithAttributes(indexHtml, "meta", attributeSet)) {
    throw new Error(`Metadado social ausente: ${attributeSet.join(" + ")}`);
  }
}

for (const noindexFile of ["dist/privacidade/index.html", "dist/404.html"]) {
  const html = requireFile(noindexFile);
  if (!hasTagWithAttributes(html, "meta", ['name="robots"', 'noindex'])) {
    throw new Error(`Página que não deve ser indexada está sem noindex: ${noindexFile}`);
  }
}

if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  throw new Error("robots.txt não referencia o sitemap canônico");
}

console.info("Validação SEO concluída com sucesso.");
