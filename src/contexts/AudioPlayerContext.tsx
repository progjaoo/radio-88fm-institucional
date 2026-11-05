import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { StreamData } from "@/types/stream";
import { Analytics } from "@/services/analytics/analytics";
import logoHeaderColor from "@/assets/logoheadsvgcolor.svg";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";

const STREAM_URL = "https://stm39.srvstm.com:9776/stream";
const API_URL = "https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS";
const LISTENING_MILESTONES = [30, 60, 300, 600];

interface AudioPlayerContextValue {
  isPlaying: boolean;
  isLoading: boolean;
  playbackError: string | null;
  isMuted: boolean;
  streamData: StreamData | null;
  togglePlay: () => void;
  toggleMute: () => void;
  pause: () => void;
}
const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const attemptRef = useRef(0);
  const secondsRef = useRef(0);
  const milestonesRef = useRef(new Set<number>());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
      audioRef.current.src = STREAM_URL;
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    const audio = getAudio();
    let timer: number | undefined;
    const stopTimer = () => { window.clearInterval(timer); timer = undefined; };
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setPlaybackError(null);
      if (!playingRef.current) Analytics.track("radio_play");
      playingRef.current = true;
      if (timer !== undefined) return;
      timer = window.setInterval(() => {
        secondsRef.current += 1;
        for (const seconds of LISTENING_MILESTONES) {
          if (secondsRef.current >= seconds && !milestonesRef.current.has(seconds)) {
            milestonesRef.current.add(seconds);
            Analytics.track("radio_listening_time", { seconds });
          }
        }
      }, 1000);
    };
    const handlePause = () => {
      if (playingRef.current) Analytics.track("radio_pause");
      playingRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      stopTimer();
    };
    const handleWaiting = () => { setIsLoading(true); stopTimer(); };
    const handleError = () => {
      attemptRef.current += 1;
      handlePause();
      setPlaybackError("Não foi possível reproduzir. Tente novamente.");
    };
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("error", handleError);
    return () => {
      attemptRef.current += 1;
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("error", handleError);
      audio.pause();
      playingRef.current = false;
      stopTimer();
    };
  }, [getAudio]);

  useEffect(() => {
    if (!isPlaying) return;
    let controller: AbortController | undefined;
    const fetchData = () => {
      if (document.hidden) return;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      fetch(API_URL, { signal: request.signal })
        .then((response) => { if (response.ok === false) throw new Error("Metadata unavailable"); return response.json(); })
        .then((data: StreamData) => { if (!request.signal.aborted) setStreamData(data); })
        .catch(() => { /* Keep the last artwork/title; metadata failure must not stop audio. */ });
    };
    fetchData();
    const interval = window.setInterval(fetchData, 15000);
    document.addEventListener("visibilitychange", fetchData);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", fetchData);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    const pageTitle = "Rádio 88 FM | O Som do Céu";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: streamData?.musica_atual?.trim() || pageTitle,
      artist: "Rádio 88 FM",
      album: pageTitle,
      artwork: [
        { src: logoHeaderColor, type: "image/svg+xml" },
        { src: `${window.location.origin}/logo-88fm.png`, sizes: "108x108", type: "image/png" },
      ],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [streamData, isPlaying]);

  const pause = useCallback(() => {
    attemptRef.current += 1;
    audioRef.current?.pause();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying || isLoading) { pause(); return; }
    const audio = getAudio();
    const attempt = ++attemptRef.current;
    setPlaybackError(null);
    setIsLoading(true);
    // Registered editorial players stop synchronously before the radio starts.
    window.dispatchEvent(new Event(RADIO_PLAY_REQUEST));
    audio.play().catch(() => {
      if (attempt !== attemptRef.current) return;
      setIsLoading(false);
      setIsPlaying(false);
      setPlaybackError("Não foi possível reproduzir. Tente novamente.");
    });
  }, [getAudio, isPlaying, isLoading, pause]);

  const toggleMute = useCallback(() => {
    const audio = getAudio();
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, [getAudio]);

  const value = useMemo(() => ({ isPlaying, isLoading, playbackError, isMuted, streamData, togglePlay, toggleMute, pause }),
    [isPlaying, isLoading, playbackError, isMuted, streamData, togglePlay, toggleMute, pause]);
  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  return context;
};
