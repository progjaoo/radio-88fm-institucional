import type { AnalyticsEventName, AnalyticsParams } from "./analytics.types";

export type AnalyticsEventCategory =
  | "navigation"
  | "content"
  | "radio"
  | "contact"
  | "registration"
  | "engagement"
  | "quality";

interface AnalyticsEventDefinition {
  category: AnalyticsEventCategory;
  allowedParameters: readonly string[];
}

const commonPageParameters = ["page_path"] as const;

export const ANALYTICS_EVENT_CATALOG: Record<AnalyticsEventName, AnalyticsEventDefinition> = {
  download_app: { category: "navigation", allowedParameters: ["platform", "location"] },
  video_open: { category: "content", allowedParameters: ["video_title", "video_id", "section"] },
  short_open: { category: "content", allowedParameters: ["video_title", "video_id", "section"] },
  videos_view_more: { category: "content", allowedParameters: ["section"] },
  podcast_click: { category: "content", allowedParameters: ["location"] },
  podcast_play: { category: "content", allowedParameters: ["location"] },
  whatsapp_click: { category: "contact", allowedParameters: ["location", "current_page"] },
  menu_navigation: { category: "navigation", allowedParameters: ["destination"] },
  hero_banner_click: {
    category: "navigation",
    allowedParameters: ["banner_id", "banner_title", "action", "modal_opened"],
  },
  radio_play: { category: "radio", allowedParameters: [] },
  radio_pause: { category: "radio", allowedParameters: [] },
  radio_listening_time: { category: "radio", allowedParameters: ["seconds"] },
  scroll_depth: {
    category: "engagement",
    allowedParameters: ["percent", ...commonPageParameters],
  },
  engagement_time: {
    category: "engagement",
    allowedParameters: ["seconds", ...commonPageParameters],
  },
  javascript_error: {
    category: "quality",
    allowedParameters: ["error_type", "error_code", ...commonPageParameters],
  },
  web_vital: {
    category: "quality",
    allowedParameters: ["metric_name", "metric_value", "metric_rating", ...commonPageParameters],
  },
  not_found: {
    category: "quality",
    allowedParameters: ["canonical_url", ...commonPageParameters],
  },
  listener_registration_modal_open: {
    category: "registration",
    allowedParameters: ["campaign_slug"],
  },
  listener_registration_submit: {
    category: "registration",
    allowedParameters: ["campaign_slug", "has_phone", "marketing_opt_in"],
  },
  listener_registration_success: {
    category: "registration",
    allowedParameters: ["campaign_slug", "source", "has_phone", "marketing_opt_in"],
  },
  listener_registration_known_participation_success: {
    category: "registration",
    allowedParameters: ["campaign_slug"],
  },
  listener_registration_error: {
    category: "registration",
    allowedParameters: ["campaign_slug", "code"],
  },
  listener_registration_dismiss: {
    category: "registration",
    allowedParameters: ["campaign_slug", "method"],
  },
};

const forbiddenParameterPattern = /(?:^|_)(?:name|nome|phone|telefone|email|bairro|cidade|token|address)(?:_|$)/i;

export function sanitizeEventParams(eventName: AnalyticsEventName, params?: AnalyticsParams) {
  if (!params) return undefined;
  const allowed = new Set(ANALYTICS_EVENT_CATALOG[eventName].allowedParameters);
  const safeEntries = Object.entries(params).filter(
    ([key, value]) =>
      allowed.has(key) &&
      (key === "has_phone" || !forbiddenParameterPattern.test(key)) &&
      value !== undefined &&
      value !== null,
  );
  return safeEntries.length > 0 ? Object.fromEntries(safeEntries) : undefined;
}
