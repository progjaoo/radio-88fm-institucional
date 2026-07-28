import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { routeSeoConfigs } from "../src/services/seo/seoConfig";

type Render = (url: string) => {
  appHtml: string;
  headHtml: string;
  statusCode: 200 | 404;
};

const distDir = path.resolve("dist");
const templatePath = path.join(distDir, "index.html");
const serverEntry = path.join(distDir, "server/entry-server.js");
const template = fs.readFileSync(templatePath, "utf8");
const { render } = (await import(pathToFileURL(serverEntry).href)) as { render: Render };

function createHtml(url: string) {
  const result = render(url);
  return template
    .replace(/<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/, `<!--seo-head-start-->\n${result.headHtml}\n    <!--seo-head-end-->`)
    .replace('<div id="root"></div>', `<div id="root">${result.appHtml}</div>`);
}

for (const route of routeSeoConfigs) {
  const outputPath =
    route.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.path.slice(1), "index.html");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, createHtml(route.path), "utf8");
}

fs.writeFileSync(path.join(distDir, "404.html"), createHtml("/404"), "utf8");
fs.rmSync(path.join(distDir, "server"), { recursive: true, force: true });
console.info(`Pré-render concluído para ${routeSeoConfigs.length} rotas e 404.`);
