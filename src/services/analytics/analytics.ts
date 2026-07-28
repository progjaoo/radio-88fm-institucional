import ReactGA from "react-ga4";
import type { AnalyticsEventName, AnalyticsPagePayload, AnalyticsParams } from "./analytics.types";
import { getAnalyticsConsent } from "./consent";
import { sanitizeEventParams } from "./eventCatalog";

let initialized = false;
let warnedMissingId = false;

function isConfigured() {
  return import.meta.env.VITE_GA_ENABLED === "true";
}

function isDebug() {
  return import.meta.env.VITE_GA_DEBUG === "true";
}

function getMeasurementId() {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();
}

function debugLog(type: string, payload: unknown) {
  if (isDebug()) console.info(`[analytics:${type}]`, payload);
}

function normalizeParams(params?: AnalyticsParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
  );
}

function canCollect() {
  return (
    typeof window !== "undefined" &&
    isConfigured() &&
    getAnalyticsConsent() === "granted"
  );
}

export const Analytics = {
  init() {
    if (initialized) return true;
    if (!canCollect()) return false;

    const measurementId = getMeasurementId();
    if (!measurementId) {
      if (import.meta.env.DEV && !warnedMissingId) {
        warnedMissingId = true;
        console.warn("VITE_GA_MEASUREMENT_ID não configurado; GA4 permanece desativado.");
      }
      return false;
    }

    ReactGA.initialize(measurementId, {
      gtagOptions: { send_page_view: false },
    });
    ReactGA.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    initialized = true;
    debugLog("init", { measurementId });
    return true;
  },

  page(payload: AnalyticsPagePayload) {
    if (!this.init()) return false;

    ReactGA.send({
      hitType: "pageview",
      page: payload.page_path,
      title: payload.page_title,
      location: payload.page_location,
      page_name: payload.page_name,
    });
    debugLog("page", payload);
    return true;
  },

  track(eventName: AnalyticsEventName, params?: AnalyticsParams) {
    if (!this.init()) return false;

    const payload = sanitizeEventParams(eventName, normalizeParams(params));
    ReactGA.event(eventName, payload);
    debugLog(eventName, payload || {});
    return true;
  },

  setUserProperties(properties: AnalyticsParams) {
    if (!this.init()) return false;

    ReactGA.gtag("set", "user_properties", normalizeParams(properties));
    debugLog("user_properties", properties);
    return true;
  },
};
