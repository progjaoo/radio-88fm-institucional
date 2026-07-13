import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getDisplayName } from "@/lib/streamUtils";

const Ouvir = () => {
  const { isPlaying, isMuted, streamData, togglePlay, toggleMute } = useAudioPlayer();
  const displayName = getDisplayName(streamData?.musica_atual);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-radio-brand-blue">
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
              <span className="font-display text-6xl font-extrabold text-white">88</span>
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 border-4 border-radio-yellow rounded-2xl animate-pulse" />
          )}
        </div>

        {/* Track info */}
        <h2 className="font-display text-xl font-bold text-white mb-10">{displayName}</h2>
        {/* {streamData?.ouvintes_conectados && (
          <p className="text-radio-brand-blue/80 text-sm mb-6">
            {streamData.ouvintes_conectados} ouvintes conectados
          </p>
        )} */}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className="text-white/100 hover:text-white transition-colors"
            aria-label={isMuted ? "Ativar som" : "Mutar"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full radio-gradient-accent flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-lg"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <div className="w-6" /> {/* spacer */}
        </div>

        
      </div>
    </div>
  );
};

export default Ouvir;
