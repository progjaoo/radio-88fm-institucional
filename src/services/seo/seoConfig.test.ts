import { describe, expect, it } from "vitest";
import feedIndexData from "@/data/feed-index.json";
import { INDEXABLE_ROUTE_PATHS, routeSeoConfigs } from "./seoConfig";
import type { FeedIndex } from "@/services/feed/feed.types";

const feedIndex = feedIndexData as FeedIndex;

describe("route SEO configuration", () => {
  it("covers every public route with unique titles and descriptions", () => {
    const paths = routeSeoConfigs.map((route) => route.path);
    const titles = routeSeoConfigs.map((route) => route.title);
    const descriptions = routeSeoConfigs.map((route) => route.description);

    const corePaths = [
      "/",
      "/nossa-radio",
      "/equipe",
      "/programacao",
      "/conteudos",
      "/anuncie",
      "/ouvir",
      "/assistir",
      "/privacidade",
      "/feed",
    ];
    expect(paths).toEqual([
      ...corePaths,
      ...feedIndex.posts.map((post) => `/feed/${post.slug}`),
    ]);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("uses the station logo on institutional pages and the article cover on posts", () => {
    const posts = new Map(feedIndex.posts.map(post => [`/feed/${post.slug}`, post.cover.url]));
    for (const route of routeSeoConfigs) {
      expect(route.imagePath).toBe(posts.get(route.path) ?? "/logo-88fm-color.png");
    }
  });

  it("includes the public privacy policy in the sitemap", () => {
    expect(INDEXABLE_ROUTE_PATHS).toContain("/privacidade");
    expect(INDEXABLE_ROUTE_PATHS).toContain("/nossa-radio");
    expect(INDEXABLE_ROUTE_PATHS.includes("/feed")).toBe(feedIndex.posts.length > 0);
    for (const post of feedIndex.posts) {
      expect(INDEXABLE_ROUTE_PATHS).toContain(`/feed/${post.slug}`);
    }
  });
});
