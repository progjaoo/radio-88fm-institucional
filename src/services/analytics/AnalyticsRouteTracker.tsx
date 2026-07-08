import { useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Analytics } from "./analytics";
import { getRouteMetadata, notFoundMetadata } from "./routeMetadata";
import { useEngagementTracking } from "./useEngagementTracking";
import { useScrollTracking } from "./useScrollTracking";

const AnalyticsRouteTracker = () => {
  const location = useLocation();
  const lastPageKeyRef = useRef<string | null>(null);
  const pageKey = `${location.pathname}${location.search}`;
  const metadata = useMemo(() => getRouteMetadata(location.pathname), [location.pathname]);
  const canonicalUrl = typeof window !== "undefined" ? window.location.href : "";

  useScrollTracking(pageKey);
  useEngagementTracking(pageKey);

  useEffect(() => {
    if (lastPageKeyRef.current === pageKey) return;
    lastPageKeyRef.current = pageKey;

    Analytics.page({
      page_title: metadata.title,
      page_location: window.location.href,
      page_path: location.pathname,
      page_name: metadata.pageName,
    });

    if (metadata === notFoundMetadata) {
      Analytics.track("not_found", {
        page_path: location.pathname,
      });
    }
  }, [location.pathname, metadata, pageKey]);

  return (
    <Helmet>
      <html lang="pt-BR" />
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default AnalyticsRouteTracker;
