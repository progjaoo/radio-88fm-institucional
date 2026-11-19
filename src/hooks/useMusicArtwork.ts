import { useEffect, useState } from "react";

// The browser and the server can briefly observe different VOX snapshots.
const RETRY_DELAYS_MS = [5_000, 15_000, 15_000];

export const musicKey = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

export interface MusicArtwork {
  source: "itunes";
  imageUrl: string;
  fallbackImageUrl: string;
  trackName: string;
  artistName: string;
  albumName: string;
}

export function isAppleArtworkUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^is\d+-ssl\.mzstatic\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

interface ArtworkState {
  key: string;
  artwork: MusicArtwork;
}

function isMusicArtwork(value: unknown): value is MusicArtwork {
  if (!value || typeof value !== "object") return false;
  const artwork = value as Partial<MusicArtwork>;
  return artwork.source === "itunes"
    && isAppleArtworkUrl(artwork.imageUrl)
    && isAppleArtworkUrl(artwork.fallbackImageUrl)
    && typeof artwork.trackName === "string"
    && typeof artwork.artistName === "string"
    && typeof artwork.albumName === "string";
}

export function useMusicArtwork(track?: string | null) {
  const key = musicKey(track || "");
  const [result, setResult] = useState<ArtworkState | null>(null);

  useEffect(() => {
    if (!track || !/\s+-\s+/.test(track)) {
      return;
    }

    const controller = new AbortController();
    let timer: number | undefined;

    async function load(attempt: number) {
      try {
        const response = await fetch("/api/music/artwork", { signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (controller.signal.aborted || data?.status === "disabled") return;
        if (data?.trackKey === key) {
          if (data.status === "not_found") return;
          if (data.status === "matched") {
            if (isMusicArtwork(data.artwork)) setResult({ key, artwork: data.artwork });
            return;
          }
        }
      } catch {
        // Artwork failure must not interrupt audio.
      }
      const delay = RETRY_DELAYS_MS[attempt];
      if (!controller.signal.aborted && delay !== undefined) {
        timer = window.setTimeout(() => void load(attempt + 1), delay);
      }
    }

    void load(0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [key, track]);

  return result?.key === key ? result.artwork : null;
}
