import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { StreamData } from "@/types/stream";
import { Analytics } from "@/services/analytics/analytics";
import { getMediaTitle, STATION_NAME, STATION_MEDIA_TITLE } from "@/lib/streamUtils";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";

const STREAM_URL = "https://stm39.srvstm.com:9776/stream";
const API_URL = "https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS";
const MEDIA_SESSION_ARTWORK_URL = "https://www.radio88fm.com/logo-88fm-color.png?media-session=v2";
const LISTENING_MILESTONES = [30, 60, 300, 600];

interface AudioPlayerContextValue {
  isPlaying: boolean;
  isLoading: boolean;
  playbackError: string | null;
  isMuted: boolean;
  volume: number;
  setVolume: (volume: number) => void;
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
  const [volume, setVolumeState] = useState(1);
  const lastAudibleVolumeRef = useRef(1);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const streamDataRef = useRef(streamData);
  streamDataRef.current = streamData;

  const publishMediaSession = useCallback((playbackState: "playing" | "paused" = playingRef.current ? "playing" : "paused") => {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: getMediaTitle(streamDataRef.current?.musica_atual),
        artist: STATION_NAME,
        album: STATION_MEDIA_TITLE,
        // A single secure, versioned PNG avoids stale/local artwork in iOS Now Playing.
        artwork: [{ src: MEDIA_SESSION_ARTWORK_URL, sizes: "512x512", type: "image/png" }],
      });
      navigator.mediaSession.playbackState = playbackState;
    } catch { /* Optional OS controls must never interrupt streaming. */ }
  }, []);

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
      publishMediaSession("playing");
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
      publishMediaSession("paused");
      setIsPlaying(false);
      setIsLoading(false);
      stopTimer();
    };
    const handleWaiting = () => { setIsLoading(true); stopTimer(); };
    const handleVolumeChange = () => {
      setVolumeState(audio.volume);
      setIsMuted(audio.muted);
      if (audio.volume > 0) lastAudibleVolumeRef.current = audio.volume;
    };
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
    audio.addEventListener("volumechange", handleVolumeChange);
    return () => {
      attemptRef.current += 1;
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.pause();
      playingRef.current = false;
      stopTimer();
    };
  }, [getAudio, publishMediaSession]);

  useEffect(() => {
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
    // Public stream metadata is independent of listening; never poll a hidden tab.
    const visibility = () => { if (document.hidden) controller?.abort(); else fetchData(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    const update = (state?: "playing" | "paused") => publishMediaSession(state);
    const visible = () => { if (!document.hidden) update(); };
    const onPlay = () => update("playing");
    const onPlaying = () => update("playing");
    const onPause = () => update("paused");
    const onLoaded = () => update();
    const onPageShow = () => update();
    const audio = getAudio();
    update();
    audio.addEventListener("play", onPlay);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("loadeddata", onLoaded);
    audio.addEventListener("canplay", onLoaded);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("loadeddata", onLoaded);
      audio.removeEventListener("canplay", onLoaded);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [getAudio, publishMediaSession]);

  useEffect(() => {
    publishMediaSession();
  }, [streamData, publishMediaSession]);

  const pause = useCallback(() => {
    attemptRef.current += 1;
    audioRef.current?.pause();
    publishMediaSession("paused");
    setIsPlaying(false);
    setIsLoading(false);
  }, [publishMediaSession]);

  const play = useCallback(() => {
    if (playingRef.current) return;
    const audio = getAudio();
    const attempt = ++attemptRef.current;
    setPlaybackError(null);
    setIsLoading(true);
    // Registered editorial players stop synchronously before the radio starts.
    window.dispatchEvent(new Event(RADIO_PLAY_REQUEST));
    // Publish Now Playing in the same user gesture before Safari backgrounds the page.
    publishMediaSession("playing");
    audio.play().catch(() => {
      if (attempt !== attemptRef.current) return;
      publishMediaSession("paused");
      setIsLoading(false);
      setIsPlaying(false);
      setPlaybackError("Não foi possível reproduzir. Tente novamente.");
    });
  }, [getAudio, publishMediaSession]);

  const togglePlay = useCallback(() => {
    if (isPlaying || isLoading) pause();
    else play();
  }, [isPlaying, isLoading, pause, play]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || typeof navigator.mediaSession.setActionHandler !== "function") return;
    const handlers = { play, pause, stop: pause };
    for (const [action, handler] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler); }
      catch { /* Supported actions vary across browsers. */ }
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, null); }
        catch { /* Unsupported actions need no cleanup. */ }
      }
    };
  }, [play, pause]);

  const toggleMute = useCallback(() => {
    const audio = getAudio();
    if (audio.volume === 0) {
      audio.volume = lastAudibleVolumeRef.current;
      setVolumeState(audio.volume);
      audio.muted = false;
    } else {
      audio.muted = !audio.muted;
    }
    setIsMuted(audio.muted);
  }, [getAudio]);

  const setVolume = useCallback((next: number) => {
    if (!Number.isFinite(next)) return;
    const audio = getAudio();
    audio.volume = Math.max(0, Math.min(1, next));
    if (audio.volume > 0) {
      lastAudibleVolumeRef.current = audio.volume;
      audio.muted = false;
    }
    setVolumeState(audio.volume);
    setIsMuted(audio.muted);
  }, [getAudio]);

  const value = useMemo(() => ({ isPlaying, isLoading, playbackError, isMuted, volume, setVolume, streamData, togglePlay, toggleMute, pause }),
    [isPlaying, isLoading, playbackError, isMuted, volume, setVolume, streamData, togglePlay, toggleMute, pause]);
  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  return context;
};
