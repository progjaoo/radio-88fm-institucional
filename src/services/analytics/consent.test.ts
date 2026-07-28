import { beforeEach, describe, expect, it, vi } from "vitest";
import {
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
    setAnalyticsConsent("granted");
    expect(getAnalyticsConsent()).toBe("granted");
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
