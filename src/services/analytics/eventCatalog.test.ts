import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENT_CATALOG, sanitizeEventParams } from "./eventCatalog";
import type { AnalyticsEventName } from "./analytics.types";

const expectedEvents: AnalyticsEventName[] = [
  "download_app", "video_open", "short_open", "videos_view_more", "podcast_click",
  "podcast_play", "whatsapp_click", "menu_navigation", "hero_banner_click", "radio_play",
  "radio_pause", "radio_listening_time", "scroll_depth", "engagement_time", "javascript_error",
  "web_vital", "not_found", "listener_registration_modal_open", "listener_registration_submit",
  "listener_registration_success", "listener_registration_known_participation_success",
  "listener_registration_error", "listener_registration_dismiss",
];

describe("analytics event catalog", () => {
  it("documents every typed analytics event", () => {
    expect(Object.keys(ANALYTICS_EVENT_CATALOG).sort()).toEqual([...expectedEvents].sort());
  });

  it("keeps only allowlisted non-PII parameters", () => {
    expect(
      sanitizeEventParams("listener_registration_success", {
        campaign_slug: "sorteio-32-anos",
        source: "institutional_modal",
        has_phone: true,
        phone: "(24) 99999-9999",
        nome: "Pessoa",
        unexpected: "discarded",
      }),
    ).toEqual({
      campaign_slug: "sorteio-32-anos",
      source: "institutional_modal",
      has_phone: true,
    });
  });
});
