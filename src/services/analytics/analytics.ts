import ReactGA from "react-ga4";
import type { AnalyticsEventName, AnalyticsPagePayload, AnalyticsParams } from "./analytics.types";

const DEFAULT_MEASUREMENT_ID = "G-44LQH4EW9P";

let initialized = false;

function isEnabled() {
  return import.meta.env.VITE_GA_ENABLED !== "false";
}

function isDebug() {
  return import.meta.env.VITE_GA_DEBUG === "true";
}

function getMeasurementId() {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || DEFAULT_MEASUREMENT_ID;
}

function debugLog(type: string, payload: unknown) {
  if (isDebug()) {
    console.info(`[analytics:${type}]`, payload);
  }
}

function normalizeParams(params?: AnalyticsParams) {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
}

export const Analytics = {
  init() {
    if (initialized || !isEnabled() || typeof window === "undefined") return;

    const measurementId = getMeasurementId();
    ReactGA.initialize(measurementId, {
      gtagOptions: {
        send_page_view: false,
      },
    });
    initialized = true;
    debugLog("init", { measurementId });
  },

  page(payload: AnalyticsPagePayload) {
    if (!isEnabled() || typeof window === "undefined") return;

    this.init();
    ReactGA.send({
      hitType: "pageview",
      page: payload.page_path,
      title: payload.page_title,
      location: payload.page_location,
      page_name: payload.page_name,
    });
    debugLog("page", payload);
  },

  track(eventName: AnalyticsEventName, params?: AnalyticsParams) {
    if (!isEnabled() || typeof window === "undefined") return;

    this.init();
    const payload = normalizeParams(params);
    ReactGA.event(eventName, payload);
    debugLog(eventName, payload || {});
  },

  setUserProperties(properties: AnalyticsParams) {
    if (!isEnabled() || typeof window === "undefined") return;

    this.init();
    ReactGA.gtag("set", "user_properties", normalizeParams(properties));
    debugLog("user_properties", properties);
  },
};
