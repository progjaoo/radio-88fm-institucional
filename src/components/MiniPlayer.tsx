import { LoaderCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TrackArtwork from "@/components/TrackArtwork";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getDisplayName } from "@/lib/streamUtils";

const controlClass = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-radio-blue transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function MiniPlayer() {
  const { isPlaying, isLoading, playbackError, isMuted, streamData, togglePlay, toggleMute } = useAudioPlayer();
  const watching = useLocation().pathname === "/assistir";
  const displayName = getDisplayName(streamData?.musica_atual);
  return (
    <section aria-label="Player da Rádio 88 FM" className="radio-player fixed inset-x-0 bottom-0 z-40 border-t border-white/20 radio-gradient text-white shadow-2xl">
      <div className="radio-player-controls mx-auto flex w-full max-w-[1920px] items-center gap-3 px-3 sm:px-5">
        <Link to="/ouvir" aria-label="Abrir Ouvir ao vivo" className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 md:h-14 md:w-14">
            <TrackArtwork src={streamData?.capa_musica} imageClassName="object-cover" fallbackClassName="object-contain p-2" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold md:text-base">{displayName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">{isLoading ? "Conectando…" : isPlaying ? "Rádio 88 FM ao vivo" : "Rádio 88 FM · pausada"}</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {watching ? <Link to="/ouvir" aria-label="Ouvir rádio" className={controlClass}><Play size={20} /></Link> : (
            <button type="button" onClick={togglePlay} className={controlClass} aria-label={isLoading ? "Cancelar carregamento" : isPlaying ? "Pausar" : "Reproduzir"}>
              {isLoading ? <LoaderCircle size={20} className="motion-safe:animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          )}
          <button type="button" onClick={toggleMute} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label={isMuted ? "Ativar som" : "Mutar"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
      {playbackError && <p role="alert" className="absolute bottom-full inset-x-0 border-b border-white/20 bg-radio-blue-dark px-4 py-2 text-center text-sm">{playbackError}</p>}
    </section>
  );
}
