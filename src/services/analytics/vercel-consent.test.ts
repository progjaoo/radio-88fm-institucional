import { beforeEach, expect, it, vi } from "vitest";
import { setAnalyticsConsent } from "./consent";
import { filterVercelAnalytics } from "./vercel-consent";

beforeEach(() => { localStorage.clear(); vi.stubEnv("VITE_GA_REQUIRE_CONSENT", "false"); });

it("filters Vercel measurements after refusal and permits them after a new choice", () => {
  const event = { type: "pageview" as const, url: "https://www.radio88fm.com/" };
  expect(filterVercelAnalytics(event)).toBe(event);
  setAnalyticsConsent("denied");
  expect(filterVercelAnalytics(event)).toBeNull();
  setAnalyticsConsent("granted");
  expect(filterVercelAnalytics(event)).toBe(event);
});

it("also respects the optional opt-in configuration", () => {
  vi.stubEnv("VITE_GA_REQUIRE_CONSENT", "true");
  expect(filterVercelAnalytics({ type: "pageview", url: "https://www.radio88fm.com/" })).toBeNull();
});
