export function validateFeedBuildEnvironment(env: Record<string, string | undefined>): string {
  const namespace = env.FEED_NAMESPACE ?? "development/radio-88";
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production") {
    if (env.FEED_LOCAL_FIXTURE_PATH) throw new Error("Local Feed fixtures cannot be deployed to Vercel");
    if (namespace !== `${env.VERCEL_ENV}/radio-88`) throw new Error("Feed namespace does not match the Vercel environment");
    if (!env.FEED_RELEASE_BASE_URL) throw new Error("Vercel Feed builds require an explicit release source");
  }
  return namespace;
}
