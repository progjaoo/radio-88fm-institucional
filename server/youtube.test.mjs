import { test } from "node:test";
import assert from "node:assert/strict";
import { createYoutubeHandlers, parseDebateNumber } from "./youtube.mjs";
import playlists from "../src/config/content-playlists.json" with { type: "json" };

function mockResponse() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = JSON.parse(body); },
  };
}

test("recognizes numbered debates regardless of accents and dash style", () => {
  assert.equal(parseDebateNumber("#094 - DEBATE 88"), 94);
  assert.equal(parseDebateNumber("Debate 88 — 105"), 105);
  assert.equal(parseDebateNumber("Debate especial da rádio"), null);
});

test("serves only public numbered debate videos, selects most viewed, and caches", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    calls.push(parsed.pathname + parsed.searchParams.get("pageToken"));
    if (parsed.pathname.endsWith("/channels")) {
      return { ok: true, json: async () => ({ items: [{ id: "UC88", contentDetails: { relatedPlaylists: { uploads: "UU88" } } }] }) };
    }
    if (parsed.pathname.endsWith("/playlistItems")) {
      return { ok: true, json: async () => ({ items: [{ snippet: { resourceId: { videoId: "video-a" } } }, { snippet: { resourceId: { videoId: "video-b" } } }] }) };
    }
    return {
      ok: true,
      json: async () => ({
        items: [
          {
            id: "video-a",
            snippet: { channelId: "UC88", title: "#094 - DEBATE 88", publishedAt: "2026-11-17T02:00:00Z", thumbnails: { high: { url: "https://img.test/a.jpg" } }, liveBroadcastContent: "none" },
            status: { privacyStatus: "public", embeddable: true },
            statistics: { viewCount: "105" },
          },
          {
            id: "video-b",
            snippet: { channelId: "UC88", title: "#095 - DEBATE 88", publishedAt: "2026-11-21T13:00:00Z", thumbnails: {}, liveBroadcastContent: "none" },
            status: { privacyStatus: "public", embeddable: true },
            statistics: { viewCount: "900" },
          },
        ],
      }),
    };
  };
  const handlers = createYoutubeHandlers({ env: { YOUTUBE_DATA_API_KEY: "server-only" }, fetchImpl, now: () => 1000 });
  const first = mockResponse();
  await handlers.debates({ method: "GET", url: "/api/debates" }, first);
  assert.equal(first.statusCode, 200);
  assert.equal(first.body.items.length, 2);
  assert.equal(first.body.items[0].date, "2026-11-21");
  assert.equal(first.body.items.find((item) => item.id === "video-a").date, "2026-11-16");
  assert.equal(first.body.featuredId, "video-b");
  assert.equal(first.headers["Cache-Control"], "public, s-maxage=900, stale-while-revalidate=3600");
  const callCount = calls.length;
  const second = mockResponse();
  await handlers.debates({ method: "GET", url: "/api/debates" }, second);
  assert.equal(calls.length, callCount);
});

test("does not contact YouTube without a server credential", async () => {
  const handlers = createYoutubeHandlers({ env: {}, fetchImpl: async () => { throw new Error("must not run"); } });
  const response = mockResponse();
  await handlers.debates({ method: "GET", url: "/api/debates" }, response);
  assert.equal(response.statusCode, 503);
  assert.match(response.body.error, /temporariamente indisponível/i);
  await handlers.archive({ method: "GET" }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("archive matches the approved playlists, validates ownership, paginates, and deduplicates public videos", async () => {
  const shared = "abcdefghijk";
  const live = "abcdefghijl";
  const internal = "abcdefghijm";
  const replay = "abcdefghijn";
  const [debate, altar, closure, cristo] = playlists;
  const item = (videoId) => ({ contentDetails: { videoId } });
  const video = (id, title, overrides = {}) => ({
    id, snippet: { title, channelId: "UC88", publishedAt: "2026-11-17T12:00:00Z" },
    status: { privacyStatus: "public", embeddable: false }, contentDetails: { duration: "PT1H2M3S" },
    ...overrides,
  });
  let time = 1000;
  let failing = false;
  const seen = [];
  const fetchImpl = async (url) => {
    const request = new URL(url);
    const method = request.pathname.split("/").pop();
    const list = request.searchParams.get("playlistId");
    seen.push({ method, list });
    if (failing) return { ok: false };
    let data;
    if (method === "channels") data = { items: [{ id: "UC88", contentDetails: { relatedPlaylists: { uploads: "UU88" } } }] };
    if (method === "playlists") data = { items: playlists.map(({ playlist }) => ({ id: playlist, snippet: { channelId: playlist === cristo.playlist ? "UC99" : "UC88" } })) };
    if (method === "playlistItems") {
      if (list === debate.playlist && !request.searchParams.get("pageToken")) data = { items: [item(shared)], nextPageToken: "2" };
      else if (list === debate.playlist) data = { items: [item(replay)] };
      else if (list === altar.playlist) data = { items: [item(shared), item(live), item(internal)] };
      else data = { items: [] };
    }
    if (method === "videos") {
      const videos = [
        video(shared, "Tema sem prefixo"),
        video(replay, "#094 - DEBATE 88", { liveStreamingDetails: { actualStartTime: "2026-11-17T02:00:00Z", actualEndTime: "2026-11-17T02:50:00Z" }, statistics: { viewCount: "111" } }),
        video(live, "Ao vivo agora", { liveStreamingDetails: { actualStartTime: "2026-11-17T12:00:00Z" } }),
        video(internal, "Privado", { status: { privacyStatus: "private" } }),
      ];
      data = { items: videos.filter(({ id }) => request.searchParams.get("id").split(",").includes(id)) };
    }
    return { ok: true, json: async () => data };
  };
  const { archive } = createYoutubeHandlers({ env: { YOUTUBE_DATA_API_KEY: "test" }, fetchImpl, now: () => time });
  const response = mockResponse();
  const concurrent = mockResponse();
  await Promise.all([archive({ method: "GET" }, response), archive({ method: "GET" }, concurrent)]);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, concurrent.body);
  assert.equal(seen.filter(({ method }) => method === "channels").length, 1);
  assert.equal(seen.filter(({ list }) => list === debate.playlist).length, 2);
  assert.equal(seen.some(({ list }) => list === cristo.playlist), false);
  assert.deepEqual(response.body.coverage, { [debate.id]: "complete", [altar.id]: "complete", [closure.id]: "complete", [cristo.id]: "unavailable" });
  assert.equal(response.body.items.length, 2);
  const sharedItem = response.body.items.find(({ id }) => id === shared);
  assert.deepEqual(sharedItem.categories, [debate.id, altar.id]);
  assert.equal(sharedItem.embeddable, false);
  assert.equal(sharedItem.number, null);
  assert.equal(sharedItem.duration, "1:02:03");
  assert.equal(sharedItem.viewCount, null);
  const replayItem = response.body.items.find(({ id }) => id === replay);
  assert.equal(replayItem.date, "2026-11-16");
  assert.equal(replayItem.number, 94);

  const count = seen.length;
  await archive({ method: "GET" }, response);
  assert.equal(seen.length, count);
  failing = true;
  time += 16 * 60 * 1000;
  await archive({ method: "GET" }, response);
  assert.equal(response.body.coverage[altar.id], "stale");
  assert.equal(response.body.items.length, 2);
  time += 24 * 60 * 60 * 1000;
  await archive({ method: "GET" }, response);
  assert.equal(response.statusCode, 503);
});
