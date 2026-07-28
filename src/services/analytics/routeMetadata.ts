import { getRouteSeoConfig, notFoundSeoConfig, routeSeoConfigs } from "@/services/seo/seoConfig";

export type RouteMetadata = {
  title: string;
  pageName: string;
  description: string;
};

export const routeMetadata: Record<string, RouteMetadata> = Object.fromEntries(
  routeSeoConfigs.map(({ path, title, pageName, description }) => [
    path,
    { title, pageName, description },
  ]),
);

export const notFoundMetadata: RouteMetadata = {
  title: notFoundSeoConfig.title,
  pageName: notFoundSeoConfig.pageName,
  description: notFoundSeoConfig.description,
};

export function getRouteMetadata(pathname: string) {
  const route = getRouteSeoConfig(pathname);
  return {
    title: route.title,
    pageName: route.pageName,
    description: route.description,
  };
}
