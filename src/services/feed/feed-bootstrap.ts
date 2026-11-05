import type { FeedIndex, FeedPostDocument } from "./feed.types";

export const FEED_BOOTSTRAP_ID = "radio88-feed-bootstrap";

export function serializeFeedBootstrap(posts: Record<string, FeedPostDocument>) {
  // JSON lives inside a non-executable script: never allow an HTML closing tag.
  return JSON.stringify(posts).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function readFeedBootstrap(text: string | null | undefined, index: FeedIndex): Record<string, FeedPostDocument> {
  if (!text) return {};
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result: Record<string, FeedPostDocument> = {};
    for (const entry of index.posts) {
      const document = (value as Record<string, FeedPostDocument>)[entry.slug];
      if (document?.schemaVersion === 1 && document.namespace === index.namespace && document.releaseId === index.releaseId && document.post?.slug === entry.slug && Array.isArray(document.post.blocks) && document.post.media && document.post.cover && document.post.category && typeof document.post.title === "string") {
        result[entry.slug] = document;
      }
    }
    return result;
  } catch { return {}; }
}
