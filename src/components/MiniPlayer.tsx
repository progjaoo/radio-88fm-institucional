import { LoaderCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import radioLogo from "@/assets/logoheadsvgcolor.svg";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useProgramming } from "@/services/programming/ProgrammingProvider";
import AppDownloadLinks from "./AppDownloadLinks";
import MicrophoneIcon from "./MicrophoneIcon";
import { getDisplayName } from "@/lib/streamUtils";

const controlClass = "mini-player-play flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-radio-blue transition-opacity hover:opacity-90";

export default function MiniPlayer() {
  const { isPlaying, isLoading, playbackError, isMuted, volume, setVolume, streamData, togglePlay, toggleMute } = useAudioPlayer();
  const { enabled, current, status } = useProgramming();
  const program = enabled && status === "ready" ? current : null;
  const watching = useLocation().pathname === "/assistir";
  const silent = isMuted || volume === 0;
  const playbackStatus = isLoading ? "Conectando…" : isPlaying ? "Ouvindo a 88" : "Áudio pausado";
  const trackName = getDisplayName(streamData?.musica_atual?.trim());
  return (
    <section aria-label="Player da Rádio 88 FM" className="radio-player fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-radio-brand-blue text-white shadow-2xl">
      <div className="radio-player-controls mini-player-layout mx-auto w-full max-w-[1920px]">
        <div className="mini-player-program">
          <div className="mini-player-live" data-on-air={!!program}>
            <span>{program ? "NO AR" : "RÁDIO"}</span>
            <div className="mini-player-mic-disc"><MicrophoneIcon /></div>
          </div>
          <div className="mini-player-identity">
            <Link to="/ouvir" aria-label="Abrir Ouvir ao vivo" className="mini-player-program-link">
              <img src={radioLogo} alt="Logo Rádio 88 FM" className="mini-player-artwork" draggable={false} />
              <div className="min-w-0">
                <p className="mini-player-program-name" title={program?.name || "Rádio 88 FM"}>{program?.name || "Rádio 88 FM"}</p>
                <p className="mini-player-program-time">{program?.time || "O som do céu"}</p>
              </div>
            </Link>
          </div>
        </div>
        <AppDownloadLinks />
        <div className="mini-player-actions">
          <div className="mini-player-status"><strong title={trackName}>{trackName}</strong></div>
          {watching ? <Link to="/ouvir" aria-label="Ouvir rádio" className={controlClass}><Play size={20} /></Link> : (
            <button type="button" onClick={togglePlay} className={controlClass} aria-label={isLoading ? "Cancelar carregamento" : isPlaying ? "Pausar" : "Reproduzir"}>
              {isLoading ? <LoaderCircle size={20} className="motion-safe:animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          )}
          <div className="mini-player-volume">
            <button type="button" onClick={toggleMute} className="mini-player-mute" aria-label={silent ? "Ativar som" : "Mutar"} aria-pressed={silent}>
              {silent ? <VolumeX size={21} aria-hidden="true" /> : <Volume2 size={21} aria-hidden="true" />}
            </button>
            <input className="mini-player-volume-range" type="range" min="0" max="100" step="1" value={silent ? 0 : Math.round(volume * 100)} onChange={event => setVolume(Number(event.target.value) / 100)} aria-label="Volume da rádio" aria-valuetext={`${silent ? 0 : Math.round(volume * 100)}%`} />
          </div>
          <span className="sr-only" role="status">{playbackStatus}</span>
        </div>
      </div>
      {playbackError && <p role="alert" className="absolute bottom-full inset-x-0 border-b border-white/20 bg-radio-blue-dark px-4 py-2 text-center text-sm">{playbackError}</p>}
    </section>
  );
}
