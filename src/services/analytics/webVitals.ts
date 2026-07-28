import { onCLS, onINP, onLCP, type Metric } from "web-vitals";
import { Analytics } from "./analytics";

type NormalizableMetric = Pick<Metric, "name" | "value" | "rating">;

export function normalizeWebVital(metric: NormalizableMetric) {
  return {
    metric_name: metric.name,
    metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
  };
}

function sampleRate() {
  const configured = Number(import.meta.env.VITE_WEB_VITALS_SAMPLE_RATE ?? "0.2");
  return Number.isFinite(configured) ? Math.min(1, Math.max(0, configured)) : 0.2;
}

export function reportWebVitals() {
  if (typeof window === "undefined" || Math.random() > sampleRate()) return;

  const report = (metric: Metric) => {
    Analytics.track("web_vital", {
      ...normalizeWebVital(metric),
      page_path: window.location.pathname,
    });
  };

  onCLS(report);
  onINP(report);
  onLCP(report);
}
