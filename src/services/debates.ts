export type DebateVideo = {
  id: string;
  title: string;
  number: number;
  date: string;
  timestamp: string;
  dateSource: "live" | "published";
  year: number;
  month: number;
  thumbnailUrl: string;
  viewCount: number;
  embeddable: boolean;
  videoUrl: string;
};

export type DebateCatalog = {
  items: DebateVideo[];
  years: number[];
  featuredId: string | null;
  generatedAt: string;
  scannedUploads: number;
};

export async function fetchDebateCatalog(signal?: AbortSignal): Promise<DebateCatalog> {
  const response = await fetch("/api/debates", { signal });
  if (!response.ok) throw new Error("Não foi possível carregar os debates agora.");
  const payload = await response.json() as DebateCatalog;
  if (!Array.isArray(payload.items) || !Array.isArray(payload.years)) {
    throw new Error("A resposta do catálogo de debates está inválida.");
  }
  return payload;
}

export function normalizeDebateSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDebateDate(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12)));
}

export function formatDebateViews(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
