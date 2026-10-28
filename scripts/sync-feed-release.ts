import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { FeedIndex, FeedPostDocument } from "../src/services/feed/feed.types";
import { validateFeedBuildEnvironment } from "./feed-build-environment";

const root = path.resolve();
const sourceIndexPath = path.join(root, "src/data/feed-index.json");
const publicFeedPath = path.join(root, "public/feed");
const namespace = validateFeedBuildEnvironment(process.env);

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(url: string, expectedHash?: string) {
  const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Feed release download failed: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (expectedHash && sha256(bytes) !== expectedHash) throw new Error("Feed release checksum mismatch");
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

function validateNamespace(value: unknown): asserts value is string {
  if (value !== namespace || !/^(development|test|preview|production)\/radio-88$/.test(namespace)) {
    throw new Error("Feed namespace does not match the configured build environment");
  }
}

async function loadRelease(): Promise<{ index: FeedIndex; docs: FeedPostDocument[]; manifestSha256: string }> {
  const fixturePath = process.env.FEED_LOCAL_FIXTURE_PATH;
  if (fixturePath) {
    const fixture = JSON.parse(fs.readFileSync(path.resolve(fixturePath), "utf8")) as Record<string, unknown>;
    validateNamespace(fixture.namespace);
    const posts = Array.isArray(fixture.posts) ? fixture.posts as Array<Record<string, unknown>> : [];
    const docs = posts.map((entry) => entry.document as FeedPostDocument).filter(Boolean);
    const indexPosts = posts.map(({ document: _document, ...entry }) => entry) as FeedIndex["posts"];
    const index: FeedIndex = { schemaVersion: 1, namespace, releaseId: String(fixture.releaseId ?? "local-fixture"), generatedAt: String(fixture.generatedAt ?? new Date().toISOString()), posts: indexPosts };
    return { index, docs, manifestSha256: sha256(new TextEncoder().encode(JSON.stringify(index))) };
  }

  const baseUrl = process.env.FEED_RELEASE_BASE_URL;
  if (!baseUrl) {
    const index: FeedIndex = { schemaVersion: 1, namespace, releaseId: "empty", generatedAt: "", posts: [] };
    return { index, docs: [], manifestSha256: sha256(new TextEncoder().encode(JSON.stringify(index))) };
  }

  const base = new URL(`${baseUrl.replace(/\/+$/, "")}/`);
  if (base.protocol !== "https:" && !(process.env.NODE_ENV === "development" && base.hostname === "127.0.0.1")) {
    throw new Error("Feed release base must use HTTPS outside local development");
  }
  const candidate = await readJson(new URL(`feed/${namespace}/candidate.json`, base).toString());
  validateNamespace(candidate.namespace);
  if (candidate.schemaVersion !== 1 || typeof candidate.releaseId !== "string" || typeof candidate.manifestKey !== "string" || typeof candidate.manifestSha256 !== "string") {
    throw new Error("Feed candidate has an unsupported or incomplete contract");
  }
  const expectedManifestKey = `feed/${namespace}/releases/${candidate.releaseId}/manifest.json`;
  if (candidate.manifestKey !== expectedManifestKey) throw new Error("Feed candidate points outside its immutable release namespace");

  const manifest = await readJson(new URL(expectedManifestKey, base).toString(), candidate.manifestSha256);
  validateNamespace(manifest.namespace);
  if (manifest.schemaVersion !== 1 || manifest.releaseId !== candidate.releaseId || !Array.isArray(manifest.posts)) {
    throw new Error("Feed manifest does not match the candidate release");
  }

  const docs: FeedPostDocument[] = [];
  const indexPosts = [];
  for (const rawEntry of manifest.posts as Array<Record<string, unknown>>) {
    const slug = String(rawEntry.slug ?? "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Feed release contains an invalid slug");
    const postKey = String(rawEntry.postKey ?? "");
    const expectedPostKey = `feed/${namespace}/releases/${candidate.releaseId}/posts/${slug}.json`;
    if (postKey !== expectedPostKey) throw new Error("Feed post points outside its immutable release namespace");
    const document = await readJson(new URL(expectedPostKey, base).toString(), String(rawEntry.postSha256 ?? "")) as unknown as FeedPostDocument;
    if (document.schemaVersion !== 1 || document.namespace !== namespace || document.releaseId !== candidate.releaseId || document.post.slug !== slug) {
      throw new Error(`Feed post contract mismatch for ${slug}`);
    }
    docs.push(document);
    indexPosts.push(rawEntry);
  }

  return {
    index: { schemaVersion: 1, namespace, releaseId: String(candidate.releaseId), generatedAt: String(manifest.generatedAt ?? ""), posts: indexPosts as FeedIndex["posts"] },
    docs,
    manifestSha256: String(candidate.manifestSha256),
  };
}

const { index, docs, manifestSha256 } = await loadRelease();
fs.mkdirSync(publicFeedPath, { recursive: true });
fs.rmSync(path.join(publicFeedPath, "posts"), { recursive: true, force: true });
fs.mkdirSync(path.join(publicFeedPath, "posts"), { recursive: true });
fs.writeFileSync(sourceIndexPath, `${JSON.stringify(index, null, 2)}\n`);
fs.writeFileSync(path.join(publicFeedPath, "index.json"), `${JSON.stringify(index)}\n`);
const candidateMarker = {
  schemaVersion: 1,
  namespace: index.namespace,
  releaseId: index.releaseId,
  manifestSha256,
};
fs.writeFileSync(path.join(publicFeedPath, "release.json"), `${JSON.stringify(candidateMarker)}\n`);
for (const doc of docs) {
  fs.writeFileSync(path.join(publicFeedPath, "posts", `${doc.post.slug}.json`), `${JSON.stringify(doc)}\n`);
}
console.info(`Feed release prepared: ${index.posts.length} posts (${index.releaseId})`);
