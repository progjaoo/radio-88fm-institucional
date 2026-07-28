export type AnalyticsConsentState = "unknown" | "granted" | "denied";

const STORAGE_KEY = "radio88.analytics-consent.v1";
export const ANALYTICS_CONSENT_EVENT = "radio88:analytics-consent-changed";

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAnalyticsConsent(): AnalyticsConsentState {
  if (!hasStorage()) return "unknown";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : "unknown";
}

function notifyConsentChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT));
  }
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsentState, "unknown">) {
  if (hasStorage()) window.localStorage.setItem(STORAGE_KEY, value);
  notifyConsentChanged();
}

export function clearAnalyticsConsent() {
  if (hasStorage()) window.localStorage.removeItem(STORAGE_KEY);
  notifyConsentChanged();
}
