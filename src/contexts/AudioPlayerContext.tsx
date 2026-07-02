import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { StreamData } from "@/types/stream";

const STREAM_URL = "https://stm39.srvstm.com:9776/stream";
const API_URL = "https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS";

interface AudioPlayerContextValue {
  isPlaying: boolean;
  isMuted: boolean;
  streamData: StreamData | null;
  togglePlay: () => void;
  toggleMute: () => void;
  pause: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider = ({ children }: AudioPlayerProviderProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
      audioRef.current.preload = "none";
    }

    return audioRef.current;
  }, []);

  useEffect(() => {
    const audio = getAudio();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, [getAudio]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
      fetch(API_URL)
        .then((response) => response.json())
        .then((data: StreamData) => {
          if (isMounted) setStreamData(data);
        })
        .catch(console.error);
    };

    fetchData();
    const interval = window.setInterval(fetchData, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const pause = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setIsPlaying(false);
  }, [getAudio]);

  const togglePlay = useCallback(() => {
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  }, [getAudio, isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = getAudio();
    const nextMuted = !isMuted;

    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [getAudio, isMuted]);

  const value = useMemo(
    () => ({
      isPlaying,
      isMuted,
      streamData,
      togglePlay,
      toggleMute,
      pause,
    }),
    [isPlaying, isMuted, streamData, togglePlay, toggleMute, pause]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }

  return context;
};
