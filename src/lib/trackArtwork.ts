const PROVIDER_DEFAULT_FILENAME = "img-capa-artista-padrao.png";

export const isProviderDefaultArtwork = (source?: string | null) => {
  if (!source?.trim()) return true;

  try {
    const imageUrl = new URL(source.trim(), "https://www.radio88fm.com");
    if (imageUrl.protocol !== "http:" && imageUrl.protocol !== "https:") return true;

    const filename = decodeURIComponent(imageUrl.pathname.split("/").filter(Boolean).pop() ?? "");
    return filename.toLowerCase() === PROVIDER_DEFAULT_FILENAME;
  } catch {
    return true;
  }
};
