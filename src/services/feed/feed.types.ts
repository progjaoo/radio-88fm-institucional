export interface FeedMedia {
  url: string;
  srcSet?: string;
  posterUrl?: string;
  mimeType?: string;
}

export interface FeedIndexPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: FeedMedia & { alt: string; focusX?: number; focusY?: number };
  category: { name: string; slug: string };
  publishedAt: string;
  eventDate?: string | null;
  updatedAt?: string;
  postKey?: string;
  postSha256?: string;
}

export interface FeedIndex {
  schemaVersion: 1;
  namespace: string;
  releaseId: string;
  generatedAt: string;
  posts: FeedIndexPost[];
}

export interface FeedBlock {
  id: string;
  type: "text" | "image" | "gallery" | "video" | "gif" | "quote" | "divider";
  [key: string]: unknown;
}

export interface FeedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: FeedIndexPost["cover"];
  opening?: FeedIndexPost["cover"];
  blocks: FeedBlock[];
  media: Record<string, FeedMedia>;
  category: { name: string; slug: string };
  seoTitle: string;
  seoDescription: string;
  eventDate?: string | null;
  publicCredits?: string;
  publishedAt: string;
  updatedAt?: string;
}

export interface FeedPostDocument {
  schemaVersion: 1;
  namespace: string;
  releaseId: string;
  post: FeedPost;
}
