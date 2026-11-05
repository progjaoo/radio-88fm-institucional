import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import generatedIndex from "@/data/feed-index.json";
import type { FeedIndex, FeedPostDocument } from "./feed.types";

interface FeedContextValue {
  index: FeedIndex;
  posts: Record<string, FeedPostDocument>;
  getPost: (slug: string) => FeedPostDocument | undefined;
}
const FeedContext = createContext<FeedContextValue | null>(null);
const defaultIndex = generatedIndex as FeedIndex;
const emptyPosts: Record<string, FeedPostDocument> = {};
const fallback: FeedContextValue = { index: defaultIndex, posts: emptyPosts, getPost: () => undefined };

export function FeedProvider({ children, initialIndex = defaultIndex, initialPosts = emptyPosts }: PropsWithChildren<{ initialIndex?: FeedIndex; initialPosts?: Record<string, FeedPostDocument> }>) {
  const value = useMemo<FeedContextValue>(() => ({ index: initialIndex, posts: initialPosts, getPost: (slug) => initialPosts[slug] }), [initialIndex, initialPosts]);
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
export function useFeed() { return useContext(FeedContext) ?? fallback; }

type PostError = "not_found" | "unavailable" | "release_mismatch" | null;
interface PostState { key: string; document?: FeedPostDocument; loading: boolean; error: PostError }

export function useFeedPost(slug: string | undefined) {
  const context = useFeed();
  const key = `${context.index.releaseId}:${slug ?? ""}`;
  const seed = slug ? context.getPost(slug) : undefined;
  const known = Boolean(seed || context.index.posts.some((post) => post.slug === slug));
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PostState>({ key, document: seed, loading: known && !seed, error: known ? null : "not_found" });

  useEffect(() => {
    if (!slug || !known) { setState({ key, loading: false, error: "not_found" }); return; }
    if (seed) { setState({ key, document: seed, loading: false, error: null }); return; }
    const controller = new AbortController();
    setState({ key, loading: true, error: null });
    const release = encodeURIComponent(context.index.releaseId);
    fetch(`/feed/posts/${encodeURIComponent(slug)}.json?release=${release}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const result = await response.json() as FeedPostDocument;
        if (result.schemaVersion !== 1 || result.post?.slug !== slug || result.namespace !== context.index.namespace || result.releaseId !== context.index.releaseId) throw new Error("release_mismatch");
        if (!controller.signal.aborted) setState({ key, document: result, loading: false, error: null });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setState({ key, loading: false, error: cause instanceof Error && cause.message === "release_mismatch" ? "release_mismatch" : "unavailable" });
      });
    return () => controller.abort();
  }, [context, slug, known, seed, key, attempt]);

  // Never render the previous slug for a frame while the next request starts.
  const current = state.key === key ? state : { key, document: seed, loading: known && !seed, error: known ? null : "not_found" as PostError };
  return { ...current, retry: () => setAttempt((value) => value + 1) };
}
export function hasFeedPosts() { return defaultIndex.posts.length > 0; }
