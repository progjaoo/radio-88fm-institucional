import { validateFeedBuildEnvironment } from "../../../scripts/feed-build-environment";

describe("Feed deployment environment", () => {
  it("keeps explicit local bootstrap available", () => {
    expect(validateFeedBuildEnvironment({})).toBe("development/radio-88");
  });
  it("does not deploy local demo data", () => {
    expect(() => validateFeedBuildEnvironment({VERCEL_ENV:"preview",FEED_LOCAL_FIXTURE_PATH:"local-dev/test.json"})).toThrow("Local Feed fixtures");
  });
  it("requires an isolated namespace and release source in Preview", () => {
    expect(() => validateFeedBuildEnvironment({VERCEL_ENV:"preview",FEED_NAMESPACE:"production/radio-88"})).toThrow("namespace");
    expect(() => validateFeedBuildEnvironment({VERCEL_ENV:"preview",FEED_NAMESPACE:"preview/radio-88"})).toThrow("release source");
    expect(validateFeedBuildEnvironment({VERCEL_ENV:"preview",FEED_NAMESPACE:"preview/radio-88",FEED_RELEASE_BASE_URL:"https://preview.example.test"})).toBe("preview/radio-88");
  });
});
