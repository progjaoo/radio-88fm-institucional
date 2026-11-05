import { useState } from "react";
import logo from "@/assets/logoheadsvgcolor.svg";
import type { FeedIndexPost } from "@/services/feed/feed.types";

export default function FeedCover({ post, sizes, eager = false }: { post: FeedIndexPost; sizes: string; eager?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  if (!post.cover.url || failedUrl === post.cover.url) return <div role="img" aria-label={post.cover.alt || post.title} className="flex h-full w-full items-center justify-center bg-neutral-100"><img src={logo} alt="" className="h-16 w-16 object-contain" /></div>;
  return <img src={post.cover.url} srcSet={post.cover.srcSet} sizes={sizes} alt={post.cover.alt} loading={eager ? "eager" : "lazy"}
    onError={() => setFailedUrl(post.cover.url)}
    onLoad={(event) => { if (event.currentTarget.naturalWidth > 0 && event.currentTarget.naturalWidth <= event.currentTarget.naturalHeight) setPortraitUrl(post.cover.url); }}
    className={`h-full w-full ${portraitUrl === post.cover.url ? "object-cover" : "object-contain"}`}
    style={{ objectPosition: `${post.cover.focusX ?? 50}% ${post.cover.focusY ?? 50}%` }} />;
}
