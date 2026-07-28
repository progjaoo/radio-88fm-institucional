import { describe, expect, it } from "vitest";
import { resolvePublicInstitutionalBannerAction } from "./action";

describe("resolvePublicInstitutionalBannerAction", () => {
  it("preserves the modal action without requiring a URL", () => {
    expect(
      resolvePublicInstitutionalBannerAction({
        actionType: "listener_registration_modal",
        destinationUrl: null,
      }),
    ).toBe("listener_registration_modal");
  });

  it("keeps backward compatibility with banners created before actionType", () => {
    expect(
      resolvePublicInstitutionalBannerAction({
        actionType: undefined,
        destinationUrl: "https://radio88fm.com.br",
      }),
    ).toBe("external_url");
  });
});
