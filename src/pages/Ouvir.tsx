import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const STREAM_URL = "https://stm39.srvstm.com:9776/stream";
const API_URL = "https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS";

interface StreamData {
  musica_atual: string;
  capa_musica: string;
  ouvintes_conectados: string;
  status: string;
}

const Ouvir = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(API_URL)
        .then((r) => r.json())
        .then((data) => setStreamData(data))
        .catch(console.error);
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
    }
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    } else {
      audioRef.current = new Audio(STREAM_URL);
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const displayName = (() => {
    if (!streamData?.musica_atual) return "Rádio 88 FM";
    const m = streamData.musica_atual;
    if (m.toLowerCase().includes("radio fm 88") || m.toLowerCase().includes("radio fm88")) {
      return "Rádio 88 FM";
    }
    return m;
  })();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="container max-w-md text-center">
        {/* Album art */}
        <div className="relative w-64 h-64 mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl">
          {streamData?.capa_musica ? (
            <img
              src={streamData.capa_musica}
              alt="Capa"
              className={`w-full h-full object-cover ${isPlaying ? "animate-pulse" : ""}`}
            />
          ) : (
            <div className="w-full h-full radio-gradient flex items-center justify-center">
              <span className="font-display text-6xl font-extrabold text-primary-foreground">88</span>
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 border-4 border-radio-yellow rounded-2xl animate-pulse" />
          )}
        </div>

        {/* Track info */}
        <h2 className="font-display text-xl font-bold text-primary-foreground mb-1">{displayName}</h2>
        {streamData?.ouvintes_conectados && (
          <p className="text-muted-foreground text-sm mb-6">
            🎧 {streamData.ouvintes_conectados} ouvintes conectados
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            aria-label={isMuted ? "Ativar som" : "Mutar"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full radio-gradient-accent flex items-center justify-center text-accent-foreground hover:opacity-90 transition-opacity shadow-lg"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <div className="w-6" /> {/* spacer */}
        </div>

        <p className="text-muted-foreground text-xs mt-8">
          {streamData?.status === "Ligado" ? "🟢  Ouvindo ao vivo" : "⚪ Verificando conexão..."}
        </p>
      </div>
    </div>
  );
};

export default Ouvir;
