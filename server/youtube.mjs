import contentPlaylists from "../src/config/content-playlists.json" with { type: "json" };

const API_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_MS = 15 * 60 * 1000;
const MAX_DEBATE_UPLOAD_PAGES = 10;
const PAGE_SIZE = 50;
const CONTENT_PLAYLIST_PAGES = 5;
const CONTENT_STALE_MS = 24 * 60 * 60 * 1000;
const CONTENT_RETRY_MS = 60 * 1000;
const timezone = "America/Sao_Paulo";

const normalizeTitle = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function parseDebateNumber(title) {
  const value = normalizeTitle(title);
  const before = value.match(/(?:#\s*)?(\d{1,4})\s*[-–—:|.]?\s*debate\s*88\b/i);
  const after = value.match(/\bdebate\s*88\b\s*[-–—:|.]?\s*(?:#\s*)?(\d{1,4})\b/i);
  const number = before?.[1] || after?.[1];
  return number ? Number(number) : null;
}

function getCivilDate(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const read = (name) => parts.find((part) => part.type === name)?.value || "";
  return read("year") + "-" + read("month") + "-" + read("day");
}

function thumbnailOf(thumbnails, videoId) {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg"
  );
}

function json(res, status, value, cacheControl = "public, s-maxage=900, stale-while-revalidate=3600") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status === 200 ? cacheControl : "no-store");
  res.end(JSON.stringify(value));
}

function createYoutubeClient({ apiKey, fetchImpl, deadline }) {
  const request = async (resource, params) => {
    const query = new URLSearchParams({ ...params, key: apiKey });
    let response;
    try {
      response = await fetchImpl(API_BASE + "/" + resource + "?" + query.toString(), {
        headers: { Accept: "application/json" },
        signal: deadline
          ? AbortSignal.any([deadline, AbortSignal.timeout(10_000)])
          : AbortSignal.timeout(10_000),
      });
    } catch {
      throw new Error("YouTube temporarily unavailable");
    }
    if (!response.ok) throw new Error("YouTube temporarily unavailable");
    return response.json();
  };
  return { request };
}

async function resolveChannel(client, handle) {
  const data = await client.request("channels", {
    part: "id,contentDetails",
    forHandle: handle,
  });
  const channel = data.items?.[0];
  const channelId = channel?.id;
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!channelId || !uploadsPlaylistId) throw new Error("YouTube channel unavailable");
  return { channelId, uploadsPlaylistId };
}

async function playlistIds(client, playlistId, maxPages, maxItems) {
  const ids = [];
  let pageToken = "";
  for (let page = 0; page < maxPages && ids.length < maxItems; page += 1) {
    const result = await client.request("playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: String(PAGE_SIZE),
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of result.items || []) {
      const id = item.snippet?.resourceId?.videoId;
      if (id) ids.push(id);
    }
    pageToken = result.nextPageToken || "";
    if (!pageToken) break;
  }
  return [...new Set(ids)].slice(0, maxItems);
}

async function videosByIds(client, ids, part) {
  const videos = [];
  for (let start = 0; start < ids.length; start += PAGE_SIZE) {
    const result = await client.request("videos", {
      part,
      id: ids.slice(start, start + PAGE_SIZE).join(","),
    });
    videos.push(...(result.items || []));
  }
  return videos;
}

async function buildPlaylistCatalog(client, playlist, channelId) {
  const ids = new Set();
  let pageToken;
  for (let page = 0; page < CONTENT_PLAYLIST_PAGES; page += 1) {
    const result = await client.request("playlistItems", {
      part: "contentDetails",
      playlistId: playlist,
      maxResults: String(PAGE_SIZE),
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of result.items || []) {
      const id = item.contentDetails?.videoId;
      if (/^[\w-]{11}$/.test(id || "")) ids.add(id);
    }
    pageToken = result.nextPageToken;
    if (!pageToken) break;
  }
  const videos = await videosByIds(client, [...ids], "contentDetails,snippet,statistics,status,liveStreamingDetails");
  const items = videos.flatMap((video) => {
    const snippet = video.snippet;
    if (
      !ids.has(video.id) || snippet?.channelId !== channelId || !snippet.title ||
      video.status?.privacyStatus !== "public" ||
      ["live", "upcoming"].includes(snippet.liveBroadcastContent) ||
      (video.liveStreamingDetails?.actualStartTime && !video.liveStreamingDetails.actualEndTime)
    ) return [];
    const timestamp = video.liveStreamingDetails?.actualStartTime || snippet.publishedAt;
    if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return [];
    const seconds = durationSeconds(video.contentDetails?.duration);
    const views = Number(video.statistics?.viewCount ?? NaN);
    return [{
      id: video.id,
      title: snippet.title,
      number: parseDebateNumber(snippet.title),
      date: getCivilDate(timestamp),
      duration: seconds ? durationLabel(seconds) : null,
      thumbnailUrl: thumbnailOf(snippet.thumbnails, video.id),
      viewCount: Number.isFinite(views) && views >= 0 ? views : null,
      embeddable: video.status.embeddable !== false,
    }];
  });
  return { items, coverage: pageToken ? "limited" : "complete" };
}

function debateRecord(video, channelId) {
  const title = video.snippet?.title || "";
  const number = parseDebateNumber(title);
  const excludedTitle = /\b(corte|cortes|chamada|teaser|shorts?)\b/i.test(normalizeTitle(title));
  const snippet = video.snippet || {};
  const status = video.status || {};
  const liveState = snippet.liveBroadcastContent;
  if (
    !number ||
    excludedTitle ||
    snippet.channelId !== channelId ||
    status.privacyStatus !== "public" ||
    liveState === "live" ||
    liveState === "upcoming"
  ) return null;

  const timestamp = video.liveStreamingDetails?.actualStartTime || snippet.publishedAt;
  if (!timestamp || Number.isNaN(new Date(timestamp).getTime())) return null;
  const date = getCivilDate(timestamp);
  const viewCount = Number.parseInt(video.statistics?.viewCount || "0", 10) || 0;

  return {
    id: video.id,
    title,
    number,
    date,
    timestamp,
    dateSource: video.liveStreamingDetails?.actualStartTime ? "live" : "published",
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
    thumbnailUrl: thumbnailOf(snippet.thumbnails, video.id),
    viewCount,
    embeddable: status.embeddable !== false,
    videoUrl: "https://www.youtube.com/watch?v=" + encodeURIComponent(video.id),
  };
}

async function buildDebateCatalog(client, handle) {
  const { channelId, uploadsPlaylistId } = await resolveChannel(client, handle);
  const ids = await playlistIds(client, uploadsPlaylistId, MAX_DEBATE_UPLOAD_PAGES, PAGE_SIZE * MAX_DEBATE_UPLOAD_PAGES);
  const videos = await videosByIds(client, ids, "snippet,statistics,status,liveStreamingDetails");
  const items = videos
    .map((video) => debateRecord(video, channelId))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const featured = [...items].sort((a, b) =>
    b.viewCount - a.viewCount || b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
  )[0] || null;
  return {
    items,
    years: [...new Set(items.map((item) => item.year))].sort((a, b) => b - a),
    featuredId: featured?.id || null,
    generatedAt: new Date().toISOString(),
    scannedUploads: ids.length,
  };
}

function durationSeconds(value) {
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function durationLabel(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours) return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
  return minutes + ":" + String(remainder).padStart(2, "0");
}

function formatViewCount(value) {
  const count = Number(value || 0);
  const formatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
  if (count === 1) return "1 visualização";
  if (count < 1000) return formatter.format(count) + " visualizações";
  if (count < 1_000_000) return formatter.format(count / 1000) + " mil visualizações";
  return formatter.format(count / 1_000_000) + " mi visualizações";
}

function relativeTime(value) {
  const date = new Date(value);
  const diff = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  if (abs < 60) return formatter.format(diff, "second");
  if (abs < 3600) return formatter.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return formatter.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return formatter.format(Math.round(diff / 86400), "day");
  if (abs < 31536000) return formatter.format(Math.round(diff / 2592000), "month");
  return formatter.format(Math.round(diff / 31536000), "year");
}

async function fetchPlaylist(client, playlistId, maxResults) {
  const result = await client.request("playlistItems", {
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
  });
  return (result.items || [])
    .map((item) => item.snippet?.resourceId?.videoId)
    .filter(Boolean);
}

async function buildHomepageContent(client, handle, maxEach) {
  const { channelId, uploadsPlaylistId } = await resolveChannel(client, handle);
  const longFormId = channelId.replace(/^UC/, "UULF");
  const shortsId = channelId.replace(/^UC/, "UUSH");
  const [longForm, shorts] = await Promise.allSettled([
    fetchPlaylist(client, longFormId, 20),
    fetchPlaylist(client, shortsId, 20),
  ]);
  let videoIds = longForm.status === "fulfilled" ? longForm.value : [];
  let shortIds = shorts.status === "fulfilled" ? shorts.value : [];
  if (!videoIds.length || !shortIds.length) {
    const uploads = await fetchPlaylist(client, uploadsPlaylistId, 50);
    const uploadVideos = await videosByIds(client, uploads, "contentDetails,snippet,statistics");
    const sorted = uploadVideos.sort((a, b) =>
      new Date(b.snippet?.publishedAt || 0).getTime() - new Date(a.snippet?.publishedAt || 0).getTime()
    );
    if (!videoIds.length) videoIds = sorted.filter((item) => durationSeconds(item.contentDetails?.duration) > 60).slice(0, maxEach).map((item) => item.id);
    if (!shortIds.length) shortIds = sorted.filter((item) => durationSeconds(item.contentDetails?.duration) <= 60).slice(0, maxEach).map((item) => item.id);
  }
  const ids = [...new Set([...videoIds, ...shortIds])];
  const details = await videosByIds(client, ids, "contentDetails,snippet,statistics");
  const byId = new Map(details.map((item) => [item.id, item]));
  const mapItems = (orderedIds, variant) => orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((video) => {
      const seconds = durationSeconds(video.contentDetails?.duration);
      const count = video.statistics?.viewCount || "0";
      const publishedAt = video.snippet?.publishedAt || "";
      return {
        id: video.id,
        title: video.snippet?.title || "",
        publishedAt,
        thumbnailUrl: thumbnailOf(video.snippet?.thumbnails, video.id),
        durationSeconds: seconds,
        durationLabel: durationLabel(seconds),
        viewCount: count,
        viewCountLabel: formatViewCount(count),
        relativeTimeLabel: relativeTime(publishedAt),
        url: variant === "short"
          ? "https://www.youtube.com/shorts/" + video.id
          : "https://www.youtube.com/watch?v=" + video.id,
      };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, maxEach);
  return {
    videos: mapItems(videoIds, "video"),
    shorts: mapItems(shortIds, "short"),
  };
}

export function createYoutubeHandlers({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
} = {}) {
  const apiKey = env.YOUTUBE_DATA_API_KEY || env.VITE_YOUTUBE_API_KEY || "";
  const handle = env.YOUTUBE_CHANNEL_HANDLE || env.VITE_YOUTUBE_CHANNEL_HANDLE || "@radio88oficial";
  const client = createYoutubeClient({ apiKey, fetchImpl });
  let debateCache = null;
  let debateCacheAt = 0;
  let debatePromise = null;
  const contentCache = new Map();
  const contentPromises = new Map();
  const playlistCache = new Map();
  const playlistAttempts = new Map();
  let archivePromise = null;

  const readArchive = async () => {
    const at = now();
    const requested = contentPlaylists.filter(({ id }) =>
      at - (playlistCache.get(id)?.at ?? -Infinity) >= CACHE_MS &&
      at - (playlistAttempts.get(id) ?? -Infinity) >= CONTENT_RETRY_MS);
    if (requested.length) {
      for (const { id } of requested) playlistAttempts.set(id, at);
      try {
        const boundedClient = createYoutubeClient({ apiKey, fetchImpl, deadline: AbortSignal.timeout(14_000) });
        const { channelId } = await resolveChannel(boundedClient, handle);
        const data = await boundedClient.request("playlists", {
          part: "snippet",
          id: requested.map(({ playlist }) => playlist).join(","),
        });
        const owned = new Set((data.items || [])
          .filter((item) => item.snippet?.channelId === channelId)
          .map((item) => item.id));
        await Promise.allSettled(requested.map(async ({ id, playlist }) => {
          if (!owned.has(playlist)) return;
          const catalog = await buildPlaylistCatalog(boundedClient, playlist, channelId);
          playlistCache.set(id, { ...catalog, at: now() });
        }));
      } catch {
        // Keep previously verified results during a temporary upstream failure.
      }
    }
    const combined = new Map();
    const coverage = {};
    let lastSyncedAt = null;
    for (const { id } of contentPlaylists) {
      const entry = playlistCache.get(id);
      if (!entry || now() - entry.at >= CONTENT_STALE_MS) {
        coverage[id] = "unavailable";
        continue;
      }
      coverage[id] = now() - entry.at >= CACHE_MS ? "stale" : entry.coverage;
      lastSyncedAt = Math.max(lastSyncedAt ?? 0, entry.at);
      for (const item of entry.items) {
        const existing = combined.get(item.id);
        if (existing) existing.categories.push(id);
        else combined.set(item.id, { ...item, categories: [id] });
      }
    }
    if (lastSyncedAt === null) return null;
    return { items: [...combined.values()], coverage, lastSyncedAt: new Date(lastSyncedAt).toISOString() };
  };

  const archive = async (req, res) => {
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    const unavailable = { error: "O catálogo de conteúdos está temporariamente indisponível." };
    if (!apiKey) return json(res, 503, unavailable);
    if (!archivePromise) archivePromise = readArchive().finally(() => { archivePromise = null; });
    const result = await archivePromise;
    if (!result) return json(res, 503, unavailable);
    const degraded = Object.values(result.coverage).some((state) => state === "stale" || state === "unavailable");
    json(res, 200, result, degraded ? "public, s-maxage=60" : undefined);
  };

  const debates = async (req, res) => {
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    if (!apiKey) return json(res, 503, { error: "Catálogo de debates temporariamente indisponível." });
    if (debateCache && now() - debateCacheAt < CACHE_MS) return json(res, 200, debateCache);
    if (!debatePromise) debatePromise = buildDebateCatalog(client, handle);
    try {
      const catalog = await debatePromise;
      debateCache = catalog;
      debateCacheAt = now();
      return json(res, 200, catalog);
    } catch {
      return json(res, 503, { error: "Não foi possível carregar os debates agora." });
    } finally {
      debatePromise = null;
    }
  };

  const content = async (req, res) => {
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
    if (!apiKey) return json(res, 503, { error: "Vídeos temporariamente indisponíveis." });
    const url = new URL(req.url || "/", "http://localhost");
    const maxEach = Math.min(12, Math.max(1, Number.parseInt(url.searchParams.get("maxEach") || "6", 10) || 6));
    if (contentCache.has(maxEach) && now() - contentCache.get(maxEach).at < CACHE_MS) {
      return json(res, 200, contentCache.get(maxEach).value);
    }
    if (!contentPromises.has(maxEach)) contentPromises.set(maxEach, buildHomepageContent(client, handle, maxEach));
    try {
      const result = await contentPromises.get(maxEach);
      contentCache.set(maxEach, { value: result, at: now() });
      return json(res, 200, result);
    } catch {
      return json(res, 503, { error: "Vídeos temporariamente indisponíveis." });
    } finally {
      contentPromises.delete(maxEach);
    }
  };

  return { debates, content, archive };
}

const handlers = createYoutubeHandlers();
export const debatesHandler = handlers.debates;
export const youtubeContentHandler = handlers.content;
export const videoContentsHandler = handlers.archive;
