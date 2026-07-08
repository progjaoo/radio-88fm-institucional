import { useEffect } from "react";
import { Analytics } from "./analytics";

function sanitizeMessage(value: unknown) {
  return String(value || "Erro desconhecido").slice(0, 240);
}

const AnalyticsErrorTracker = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      Analytics.track("javascript_error", {
        message: sanitizeMessage(event.message),
        source: sanitizeMessage(event.filename),
        page_path: window.location.pathname,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      Analytics.track("javascript_error", {
        message: sanitizeMessage(event.reason instanceof Error ? event.reason.message : event.reason),
        source: "unhandledrejection",
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
