import { getRouteSeoConfig, notFoundSeoConfig, routeSeoConfigs } from "@/services/seo/seoConfig";

export type RouteMetadata = {
  title: string;
  analyticsTitle: string;
  pageName: string;
  description: string;
};

export const routeMetadata: Record<string, RouteMetadata> = Object.fromEntries(
  routeSeoConfigs.map(({ path, title, analyticsTitle, pageName, description }) => [
    path,
    { title, analyticsTitle, pageName, description },
  ]),
);

export const notFoundMetadata: RouteMetadata = {
  title: notFoundSeoConfig.title,
  analyticsTitle: notFoundSeoConfig.analyticsTitle,
  pageName: notFoundSeoConfig.pageName,
  description: notFoundSeoConfig.description,
};

export function getRouteMetadata(pathname: string) {
  const route = getRouteSeoConfig(pathname);
  return {
    title: route.title,
    analyticsTitle: route.analyticsTitle,
    pageName: route.pageName,
    description: route.description,
  };
}
