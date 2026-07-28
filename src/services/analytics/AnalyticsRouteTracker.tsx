import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import SeoHead from "@/components/seo/SeoHead";
import { buildCanonicalUrl } from "@/services/seo/url";
import { getRouteSeoConfig, notFoundSeoConfig } from "@/services/seo/seoConfig";
import { Analytics } from "./analytics";
import { ANALYTICS_CONSENT_EVENT } from "./consent";
import { useEngagementTracking } from "./useEngagementTracking";
import { useScrollTracking } from "./useScrollTracking";

const AnalyticsRouteTracker = () => {
  const location = useLocation();
  const lastTrackedPageKeyRef = useRef<string | null>(null);
  const pageKey = `${location.pathname}${location.search}`;
  const config = useMemo(() => getRouteSeoConfig(location.pathname), [location.pathname]);

  useScrollTracking(location.pathname);
  useEngagementTracking(location.pathname);

  const trackCurrentPage = useCallback(() => {
    if (lastTrackedPageKeyRef.current === pageKey) return;
    const sent = Analytics.page({
      page_title: config.title,
      page_location: window.location.href,
      page_path: location.pathname,
      page_name: config.pageName,
    });
    if (!sent) return;

    lastTrackedPageKeyRef.current = pageKey;
    if (config === notFoundSeoConfig) {
      Analytics.track("not_found", {
        page_path: location.pathname,
        canonical_url: buildCanonicalUrl(location.pathname),
      });
    }
  }, [config, location.pathname, pageKey]);

  useEffect(() => {
    trackCurrentPage();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, trackCurrentPage);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, trackCurrentPage);
  }, [trackCurrentPage]);

  return <SeoHead config={config} pathname={location.pathname} />;
};

export default AnalyticsRouteTracker;
