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

export function FeedProvider({
  children,
  initialIndex = defaultIndex,
  initialPosts = {},
}: PropsWithChildren<{ initialIndex?: FeedIndex; initialPosts?: Record<string, FeedPostDocument> }>) {
  const value = useMemo<FeedContextValue>(() => ({
    index: initialIndex,
    posts: initialPosts,
    getPost: (slug) => initialPosts[slug],
  }), [initialIndex, initialPosts]);

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  return useContext(FeedContext) ?? {
    index: defaultIndex,
    posts: {},
    getPost: () => undefined,
  };
}

export function useFeedPost(slug: string | undefined) {
  const context = useFeed();
  const [document, setDocument] = useState<FeedPostDocument | undefined>(() =>
    slug ? context.getPost(slug) : undefined,
  );
  const [loading, setLoading] = useState(() => Boolean(slug && !context.getPost(slug)));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug || context.getPost(slug)) {
      setDocument(slug ? context.getPost(slug) : undefined);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const release = encodeURIComponent(context.index.releaseId);
    fetch(`/feed/posts/${encodeURIComponent(slug)}.json?release=${release}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Publicacao indisponivel");
        return response.json() as Promise<FeedPostDocument>;
      })
      .then((result) => {
        if (result.schemaVersion !== 1 || result.post.slug !== slug || result.namespace !== context.index.namespace || result.releaseId !== context.index.releaseId) throw new Error("Publicacao invalida");
        setDocument(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [context, slug]);

  return { document, loading, error };
}

export function hasFeedPosts() {
  return defaultIndex.posts.length > 0;
}
