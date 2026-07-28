import { describe, expect, it } from "vitest";
import { calculateScrollDepth } from "./useScrollTracking";
import { getReachedEngagementMilestones } from "./useEngagementTracking";
import { normalizeAnalyticsError } from "./AnalyticsErrorTracker";
import { normalizeWebVital } from "./webVitals";

describe("analytics measurement helpers", () => {
  it("does not inflate scroll on a short page before interaction", () => {
    expect(calculateScrollDepth(0, 800, 800, false)).toBeNull();
    expect(calculateScrollDepth(0, 800, 800, true)).toBe(100);
    expect(calculateScrollDepth(400, 1600, 800, true)).toBe(50);
  });

  it("returns engagement milestones only once", () => {
    expect(getReachedEngagementMilestones(125, new Set([30, 60]))).toEqual([120]);
  });

  it("normalizes errors without exposing the original message or URL", () => {
    const result = normalizeAnalyticsError(
      "Falha para https://example.com?telefone=24999999999",
      "window_error",
    );
    expect(result.error_type).toBe("window_error");
    expect(result.error_code).toMatch(/^[a-f0-9]{8}$/);
    expect(JSON.stringify(result)).not.toContain("telefone");
  });

  it("normalizes web vital values for GA4", () => {
    expect(normalizeWebVital({ name: "CLS", value: 0.1234, rating: "needs-improvement" })).toEqual({
      metric_name: "CLS",
      metric_value: 123,
      metric_rating: "needs-improvement",
    });
  });
});
