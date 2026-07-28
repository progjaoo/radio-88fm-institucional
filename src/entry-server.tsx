import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { AppContent } from "./App";
import { getRouteSeoConfig, notFoundSeoConfig } from "./services/seo/seoConfig";
import { normalizePathname } from "./services/seo/url";

export interface RenderResult {
  appHtml: string;
  headHtml: string;
  statusCode: 200 | 404;
}

type HelmetContext = {
  helmet?: {
    title: { toString(): string };
    priority: { toString(): string };
    meta: { toString(): string };
    link: { toString(): string };
    script: { toString(): string };
  };
};

export function render(url: string): RenderResult {
  const pathname = normalizePathname(url);
  const route = getRouteSeoConfig(pathname);
  const helmetContext: HelmetContext = {};
  const previousCanUseDom = HelmetProvider.canUseDOM;
  HelmetProvider.canUseDOM = false;
  const appHtml = renderToString(
    <StaticRouter location={pathname}>
      <AppContent helmetContext={helmetContext as Record<string, unknown>} />
    </StaticRouter>,
  );
  HelmetProvider.canUseDOM = previousCanUseDom;
  const helmet = helmetContext.helmet;
  const headHtml = helmet
    ? [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script]
        .map((entry) => entry.toString())
        .filter(Boolean)
        .join("\n")
    : "";

  return {
    appHtml,
    headHtml,
    statusCode: route === notFoundSeoConfig ? 404 : 200,
  };
}
