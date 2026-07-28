import { beforeEach, describe, expect, it, vi } from "vitest";

const reactGaMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  send: vi.fn(),
  event: vi.fn(),
  gtag: vi.fn(),
}));

vi.mock("react-ga4", () => ({ default: reactGaMock }));

describe("Analytics", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_GA_ENABLED", "true");
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
  });

  it("does not initialize before analytics consent", async () => {
    const { Analytics } = await import("./analytics");
    expect(Analytics.init()).toBe(false);
    expect(reactGaMock.initialize).not.toHaveBeenCalled();
  });

  it("initializes once after consent and keeps advertising signals denied", async () => {
    const { setAnalyticsConsent } = await import("./consent");
    setAnalyticsConsent("granted");
    const { Analytics } = await import("./analytics");

    expect(Analytics.init()).toBe(true);
    expect(Analytics.init()).toBe(true);
    expect(reactGaMock.initialize).toHaveBeenCalledTimes(1);
    expect(reactGaMock.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("stays disabled when the measurement ID is missing", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
    const { setAnalyticsConsent } = await import("./consent");
    setAnalyticsConsent("granted");
    const { Analytics } = await import("./analytics");
    expect(Analytics.init()).toBe(false);
    expect(reactGaMock.initialize).not.toHaveBeenCalled();
  });
});
