export const getDisplayName = (musicaAtual?: string | null) => {
  if (!musicaAtual) return "Rádio 88 FM";

  const normalizedName = musicaAtual.toLowerCase();
  if (normalizedName.includes("radio fm 88") || normalizedName.includes("radio fm88")) {
    return "Rádio 88 FM";
  }

  return musicaAtual;
};
