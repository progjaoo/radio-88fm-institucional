const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID_CACHE_KEY = "youtube:radio88:channelId";
const UPLOADS_PLAYLIST_CACHE_KEY = "youtube:radio88:uploadsPlaylistId";

export type YoutubeVariant = "video" | "short";

export type YoutubeItem = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationLabel: string;
  viewCount: string;
  viewCountLabel: string;
  relativeTimeLabel: string;
  url: string;
};

export type YoutubeContentResult = {
  videos: YoutubeItem[];
  shorts: YoutubeItem[];
};

type YoutubeChannelResponse = {
  items?: Array<{
    id: string;
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YoutubePlaylistItemsResponse = {
  items?: Array<{
    snippet: {
      title: string;
      publishedAt: string;
      resourceId?: {
        videoId?: string;
      };
      thumbnails?: YoutubeThumbnails;
    };
  }>;
};

type YoutubeVideosResponse = {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      thumbnails?: YoutubeThumbnails;
    };
    contentDetails: {
      duration: string;
    };
    statistics?: {
      viewCount?: string;
    };
  }>;
};

type YoutubeThumbnails = {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
};

let channelIdMemoryCache: string | null = null;
let uploadsPlaylistMemoryCache: string | null = null;

function getApiKey() {
  return import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
}

function getChannelHandle() {
  return (import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE as string | undefined) || "@radio88oficial";
}

function getSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage can be unavailable in restricted browser contexts.
  }
}

function requireApiKey() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Configure VITE_YOUTUBE_API_KEY para carregar vídeos do YouTube.");
  }
  return apiKey;
}

async function youtubeRequest<T>(path: string, params: Record<string, string>) {
  const apiKey = requireApiKey();
  const query = new URLSearchParams({ ...params, key: apiKey });
  const response = await fetch(`${YOUTUBE_API_BASE_URL}/${path}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function deriveShortsPlaylistId(channelId: string) {
  return channelId.replace(/^UC/, "UUSH");
}

export function deriveLongFormPlaylistId(channelId: string) {
  return channelId.replace(/^UC/, "UULF");
}

export function parseIsoDurationToSeconds(duration: string) {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDurationLabel(durationSeconds: number) {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatViewCount(viewCount: string | number | undefined) {
  const count = Number(viewCount || 0);
  const formatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  if (count === 1) return "1 visualização";
  if (count < 1000) return `${formatter.format(count)} visualizações`;
  if (count < 1_000_000) return `${formatter.format(count / 1000)} mil visualizações`;

  return `${formatter.format(count / 1_000_000)} mi visualizações`;
}

export function formatRelativeTime(publishedAt: string) {
  const date = new Date(publishedAt);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absDiff = Math.abs(diffInSeconds);
  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  if (absDiff < 60) return formatter.format(diffInSeconds, "second");
  if (absDiff < 3600) return formatter.format(Math.round(diffInSeconds / 60), "minute");
  if (absDiff < 86400) return formatter.format(Math.round(diffInSeconds / 3600), "hour");
  if (absDiff < 2592000) return formatter.format(Math.round(diffInSeconds / 86400), "day");
  if (absDiff < 31536000) return formatter.format(Math.round(diffInSeconds / 2592000), "month");

  return formatter.format(Math.round(diffInSeconds / 31536000), "year");
}

function getBestThumbnail(thumbnails: YoutubeThumbnails | undefined, videoId: string) {
  return (
    thumbnails?.high?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.maxres?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  );
}

function createYoutubeItem(video: NonNullable<YoutubeVideosResponse["items"]>[number], variant: YoutubeVariant): YoutubeItem {
  const durationSeconds = parseIsoDurationToSeconds(video.contentDetails.duration);
  const viewCount = video.statistics?.viewCount || "0";

  return {
    id: video.id,
    title: video.snippet.title,
    publishedAt: video.snippet.publishedAt,
    thumbnailUrl: getBestThumbnail(video.snippet.thumbnails, video.id),
    durationSeconds,
    durationLabel: formatDurationLabel(durationSeconds),
    viewCount,
    viewCountLabel: formatViewCount(viewCount),
    relativeTimeLabel: formatRelativeTime(video.snippet.publishedAt),
    url: variant === "short"
      ? `https://www.youtube.com/shorts/${video.id}`
      : `https://www.youtube.com/watch?v=${video.id}`,
  };
}

export async function resolveChannelId() {
  if (channelIdMemoryCache) return channelIdMemoryCache;

  const cached = getSessionValue(CHANNEL_ID_CACHE_KEY);
  if (cached) {
    channelIdMemoryCache = cached;
    return cached;
  }

  const data = await youtubeRequest<YoutubeChannelResponse>("channels", {
    part: "id",
    forHandle: getChannelHandle(),
  });

  const channelId = data.items?.[0]?.id;
  if (!channelId) {
    throw new Error("Canal do YouTube não encontrado pelo handle configurado.");
  }

  channelIdMemoryCache = channelId;
  setSessionValue(CHANNEL_ID_CACHE_KEY, channelId);

  return channelId;
}

export async function resolveChannelUploadsPlaylistId() {
  if (uploadsPlaylistMemoryCache) return uploadsPlaylistMemoryCache;

  const cached = getSessionValue(UPLOADS_PLAYLIST_CACHE_KEY);
  if (cached) {
    uploadsPlaylistMemoryCache = cached;
    return cached;
  }

  const channelId = await resolveChannelId();
  const data = await youtubeRequest<YoutubeChannelResponse>("channels", {
    part: "contentDetails",
    id: channelId,
  });

  const uploadsPlaylistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error("Playlist de uploads do canal não encontrada.");
  }

  uploadsPlaylistMemoryCache = uploadsPlaylistId;
  setSessionValue(UPLOADS_PLAYLIST_CACHE_KEY, uploadsPlaylistId);

  return uploadsPlaylistId;
}

async function fetchPlaylistVideoIds(playlistId: string, maxResults = 20) {
  const playlistData = await youtubeRequest<YoutubePlaylistItemsResponse>("playlistItems", {
    playlistId,
    part: "snippet",
    maxResults: String(maxResults),
  });

  const ids =
    playlistData.items
      ?.map((item) => item.snippet.resourceId?.videoId)
      .filter((id): id is string => Boolean(id)) || [];

  if (ids.length === 0) {
    throw new Error(`Playlist ${playlistId} sem vídeos disponíveis.`);
  }

  return ids;
}

async function fetchVideosDetails(videoIds: string[]) {
  const uniqueIds = Array.from(new Set(videoIds)).filter(Boolean);
  if (uniqueIds.length === 0) return new Map<string, NonNullable<YoutubeVideosResponse["items"]>[number]>();

  const videosData = await youtubeRequest<YoutubeVideosResponse>("videos", {
    part: "contentDetails,snippet,statistics",
    id: uniqueIds.join(","),
  });

  return new Map((videosData.items || []).map((video) => [video.id, video]));
}

function mapPlaylistItems(ids: string[], detailsMap: Map<string, NonNullable<YoutubeVideosResponse["items"]>[number]>, variant: YoutubeVariant) {
  return ids
    .map((id) => {
      const video = detailsMap.get(id);
      return video ? createYoutubeItem(video, variant) : null;
    })
    .filter((item): item is YoutubeItem => Boolean(item))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

async function fetchFromUploadsByDuration(maxEach: number): Promise<YoutubeContentResult> {
  const uploadsPlaylistId = await resolveChannelUploadsPlaylistId();
  const uploadIds = await fetchPlaylistVideoIds(uploadsPlaylistId, 20);
  const detailsMap = await fetchVideosDetails(uploadIds);

  const items = uploadIds
    .map((id) => detailsMap.get(id))
    .filter((video): video is NonNullable<YoutubeVideosResponse["items"]>[number] => Boolean(video))
    .map((video) => {
      const durationSeconds = parseIsoDurationToSeconds(video.contentDetails.duration);
      return createYoutubeItem(video, durationSeconds <= 60 ? "short" : "video");
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    videos: items.filter((item) => item.durationSeconds > 60).slice(0, maxEach),
    shorts: items.filter((item) => item.durationSeconds <= 60).slice(0, maxEach),
  };
}

export async function fetchLatestVideosAndShorts(maxEach: number): Promise<YoutubeContentResult> {
  const channelId = await resolveChannelId();
  const longFormPlaylistId = deriveLongFormPlaylistId(channelId);
  const shortsPlaylistId = deriveShortsPlaylistId(channelId);

  const [longFormResult, shortsResult] = await Promise.allSettled([
    fetchPlaylistVideoIds(longFormPlaylistId, 20),
    fetchPlaylistVideoIds(shortsPlaylistId, 20),
  ]);

  const longFormIds = longFormResult.status === "fulfilled" ? longFormResult.value : [];
  const shortsIds = shortsResult.status === "fulfilled" ? shortsResult.value : [];
  const needsLongFormFallback = longFormResult.status === "rejected" || longFormIds.length === 0;
  const needsShortsFallback = shortsResult.status === "rejected" || shortsIds.length === 0;
  const fallback = needsLongFormFallback || needsShortsFallback
    ? await fetchFromUploadsByDuration(maxEach)
    : null;

  if (needsLongFormFallback) {
    console.warn("Playlist UULF indisponível. Usando fallback por uploads/duração para vídeos.");
  }

  if (needsShortsFallback) {
    console.warn("Playlist UUSH indisponível. Usando fallback por uploads/duração para Shorts.");
  }

  const detailsMap = await fetchVideosDetails([...longFormIds, ...shortsIds]);
  const videos = needsLongFormFallback
    ? fallback?.videos || []
    : mapPlaylistItems(longFormIds, detailsMap, "video").slice(0, maxEach);
  const shorts = needsShortsFallback
    ? fallback?.shorts || []
    : mapPlaylistItems(shortsIds, detailsMap, "short").slice(0, maxEach);

  return { videos, shorts };
}
