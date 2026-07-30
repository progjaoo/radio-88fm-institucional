import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canUseAnalyticsWithCurrentConsent,
  clearAnalyticsConsent,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "./consent";

describe("analytics consent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unknown and persists an explicit choice", () => {
    expect(getAnalyticsConsent()).toBe("unknown");
    expect(canUseAnalyticsWithCurrentConsent()).toBe(true);

    setAnalyticsConsent("granted");
    expect(getAnalyticsConsent()).toBe("granted");
    expect(canUseAnalyticsWithCurrentConsent()).toBe(true);
  });

  it("keeps explicit denial blocking analytics", () => {
    setAnalyticsConsent("denied");
    expect(canUseAnalyticsWithCurrentConsent()).toBe(false);
  });

  it("dispatches a change event and supports revocation", () => {
    const listener = vi.fn();
    window.addEventListener("radio88:analytics-consent-changed", listener);
    setAnalyticsConsent("denied");
    clearAnalyticsConsent();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getAnalyticsConsent()).toBe("unknown");
    window.removeEventListener("radio88:analytics-consent-changed", listener);
  });
});
