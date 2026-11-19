import type { BeforeSendEvent } from "@vercel/analytics/react";
import { canUseAnalyticsWithCurrentConsent } from "./consent";

export function filterVercelAnalytics(event: BeforeSendEvent) {
  return canUseAnalyticsWithCurrentConsent() ? event : null;
}
