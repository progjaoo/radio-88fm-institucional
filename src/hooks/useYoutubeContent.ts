import { useEffect, useState } from "react";
import { fetchLatestVideosAndShorts, YoutubeItem } from "@/lib/youtube";

export function useYoutubeContent(maxEach = 6) {
  const [videos, setVideos] = useState<YoutubeItem[]>([]);
  const [shorts, setShorts] = useState<YoutubeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadYoutubeContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchLatestVideosAndShorts(maxEach);
        if (!active) return;

        setVideos(data.videos);
        setShorts(data.shorts);
      } catch (err) {
        if (!active) return;

        setVideos([]);
        setShorts([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar vídeos do YouTube.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadYoutubeContent();

    return () => {
      active = false;
    };
  }, [maxEach]);

  return { videos, shorts, loading, error };
}
