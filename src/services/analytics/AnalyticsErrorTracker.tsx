import { useEffect } from "react";
import { Analytics } from "./analytics";

export type AnalyticsErrorType = "window_error" | "unhandled_rejection";

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function normalizeAnalyticsError(value: unknown, errorType: AnalyticsErrorType) {
  const normalized = String(value || "unknown_error")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/\d+/g, "#")
    .slice(0, 160);
  return { error_type: errorType, error_code: stableHash(normalized) } as const;
}

const AnalyticsErrorTracker = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      Analytics.track("javascript_error", {
        ...normalizeAnalyticsError(event.message, "window_error"),
        page_path: window.location.pathname,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : event.reason;
      Analytics.track("javascript_error", {
        ...normalizeAnalyticsError(reason, "unhandled_rejection"),
        page_path: window.location.pathname,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
};

export default AnalyticsErrorTracker;
