import { readFeedBootstrap, serializeFeedBootstrap } from "./feed-bootstrap";
import type { FeedIndex, FeedPostDocument } from "./feed.types";

const index: FeedIndex = { schemaVersion: 1, namespace: "test/radio-88", releaseId: "release", generatedAt: "", posts: [{ id: "1", slug: "materia", title: "Matéria", excerpt: "Teste", cover: { url: "/capa.png", alt: "Capa" }, category: { name: "Eventos", slug: "eventos" }, publishedAt: "2026-11-05" }] };
const document: FeedPostDocument = { schemaVersion: 1, namespace: index.namespace, releaseId: index.releaseId, post: { ...index.posts[0], blocks: [], media: {}, seoTitle: "Matéria", seoDescription: "Teste" } };

describe("Static article hydration", () => {
  it("preserves the public document from the exact release for the first render", () => {
    const posts = { materia: document };
    expect(readFeedBootstrap(serializeFeedBootstrap(posts), index)).toEqual(posts);
  });
  it("escapes HTML closing tags and line separators without changing the data", () => {
    const unsafe = { materia: { ...document, post: { ...document.post, title: "</script><script>alert(1)</script>\u2028\u2029" } } };
    const text = serializeFeedBootstrap(unsafe);
    expect(text).not.toContain("<");
    expect(JSON.parse(text)).toEqual(unsafe);
  });
  it("rejects documents from another namespace, release or unpublished slug", () => {
    for (const changed of [{ namespace: "production/radio-88" }, { releaseId: "old" }, { post: { ...document.post, slug: "removed" } }]) {
      expect(readFeedBootstrap(JSON.stringify({ materia: { ...document, ...changed } }), index)).toEqual({});
    }
    expect(readFeedBootstrap(JSON.stringify({ removed: document }), index)).toEqual({});
  });
  it("safely falls back to the static JSON loader for absent or malformed data", () => {
    for (const text of [null, "", "{", "[]", "null", '{"materia":{}}']) expect(readFeedBootstrap(text, index)).toEqual({});
  });
});
