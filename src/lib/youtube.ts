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

export async function fetchLatestVideosAndShorts(maxEach: number): Promise<YoutubeContentResult> {
  const response = await fetch("/api/youtube/content?maxEach=" + encodeURIComponent(String(maxEach)));
  if (!response.ok) throw new Error("Vídeos temporariamente indisponíveis.");
  return response.json() as Promise<YoutubeContentResult>;
}
