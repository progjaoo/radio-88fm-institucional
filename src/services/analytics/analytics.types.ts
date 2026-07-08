export type AnalyticsEventName =
  | "download_app"
  | "video_open"
  | "short_open"
  | "videos_view_more"
  | "podcast_click"
  | "podcast_play"
  | "whatsapp_click"
  | "menu_navigation"
  | "hero_banner_click"
  | "radio_play"
  | "radio_pause"
  | "radio_listening_time"
  | "scroll_depth"
  | "engagement_time"
  | "javascript_error"
  | "not_found";

export type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsPrimitive>;

export interface AnalyticsPagePayload {
  page_title: string;
  page_location: string;
  page_path: string;
  page_name: string;
}
