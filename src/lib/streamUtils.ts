export const STATION_NAME = "Rádio 88 FM";
export const STATION_MEDIA_TITLE = "Rádio 88 FM - O Som do Céu!";

export function isStationMetadata(value?: string | null) {
  const normalized = (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!normalized) return true;
  return /^(?:radio\s*(?:fm\s*)?88(?:\s*7)?(?:\s*fm)?)(?:\s+(?:volta redonda(?: rj)?|o som do ceu|ao vivo))?$/.test(normalized)
    || /^(?:vinheta|comercial|intervalo|sem musica|sem informacao|programacao(?: ao vivo)?)$/.test(normalized);
}

export function getDisplayName(musicaAtual?: string | null) {
  return isStationMetadata(musicaAtual) ? STATION_NAME : musicaAtual!.trim();
}

export function getMediaTitle(musicaAtual?: string | null) {
  return isStationMetadata(musicaAtual) ? STATION_MEDIA_TITLE : musicaAtual!.trim();
}
