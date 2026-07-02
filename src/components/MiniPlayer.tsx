import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getDisplayName } from "@/lib/streamUtils";

const MiniPlayer = () => {
  const { isPlaying, isMuted, streamData, togglePlay, toggleMute } = useAudioPlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const isVisible = isPlaying && location.pathname !== "/ouvir" && location.pathname !== "/assistir";
  const displayName = getDisplayName(streamData?.musica_atual);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 radio-gradient text-white shadow-2xl transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      onClick={() => navigate("/ouvir")}
      aria-hidden={!isVisible}
    >
      <div className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10">
          {streamData?.capa_musica ? (
            <img src={streamData.capa_musica} alt="Capa" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10">
              <span className="font-display text-xl font-extrabold text-white">88</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold md:text-base">{displayName}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Rádio 88 FM ao vivo</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              togglePlay();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-radio-blue transition-opacity hover:opacity-90"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleMute();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={isMuted ? "Ativar som" : "Mutar"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
