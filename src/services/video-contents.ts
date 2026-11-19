import playlists from "@/config/content-playlists.json";

export const allCategories = "todos";
export const contentCategories = playlists;
export const channelPlaylistsUrl = "https://www.youtube.com/@radio88oficial/playlists";
export const contentPath = (category: string) => "/conteudos?categoria=" + encodeURIComponent(category);

export type ContentVideo = {
  id: string;
  title: string;
  number: number | null;
  date: string;
  duration: string | null;
  thumbnailUrl: string;
  viewCount: number | null;
  embeddable: boolean;
  categories: string[];
};

export type CatalogCoverage = "complete" | "limited" | "stale" | "unavailable";
export type ContentCatalog = {
  items: ContentVideo[];
  coverage: Record<string, CatalogCoverage>;
  lastSyncedAt: string;
};

export async function fetchVideoContents(signal?: AbortSignal): Promise<ContentCatalog> {
  const response = await fetch("/api/public/video-contents", { signal });
  if (!response.ok) throw new Error("Catálogo indisponível.");
  const data = await response.json() as ContentCatalog;
  if (!Array.isArray(data?.items) || !data.coverage) throw new Error("Catálogo inválido.");
  return data;
}

const searchText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export const editionNumber = (number: number) => "#" + String(number).padStart(3, "0");
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const viewFormatter = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
export const formatContentDate = (date: string) => dateFormatter.format(new Date(date + "T12:00:00Z"));
export const formatContentViews = (count: number) => viewFormatter.format(count) + (count === 1 ? " visualização" : " visualizações");
export const watchUrl = (id: string) => "https://www.youtube.com/watch?v=" + encodeURIComponent(id);

function intParam(value: string | null, min: number, max: number) {
  const parsed = /^(?:0)?\d{1,4}$/.test(value || "") ? Number(value) : 0;
  return parsed >= min && parsed <= max ? parsed : 0;
}

export function readContentFilters(params: URLSearchParams) {
  const requested = params.get("categoria");
  const category = contentCategories.find(({ id }) => id === requested)?.id ?? allCategories;
  const query = params.get("q")?.slice(0, 120) ?? "";
  const year = intParam(params.get("ano"), 2005, 9999);
  const month = intParam(params.get("mes"), 1, 12);
  const maxDay = year && month ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 0;
  const day = intParam(params.get("dia"), 1, maxDay);
  return { category, query, year, month, day, maxDay };
}

export function legacyDebateQuery(search: string) {
  const { query, year, month, day } = readContentFilters(new URLSearchParams(search));
  const next = new URLSearchParams({ categoria: "debate-88" });
  if (query) next.set("q", query);
  if (year) next.set("ano", String(year));
  if (month) next.set("mes", String(month));
  if (day) next.set("dia", String(day));
  return "?" + next.toString();
}

export function selectContent(items: ContentVideo[], { category, query, year, month, day }: ReturnType<typeof readContentFilters>) {
  const normalized = searchText(query);
  const filtered = items.filter((video) => {
    if (category !== allCategories && !video.categories.includes(category)) return false;
    const [y, m, d] = video.date.split("-").map(Number);
    if ((year && y !== year) || (month && m !== month) || (day && d !== day)) return false;
    const edition = video.number === null ? "" : " " + editionNumber(video.number) + " " + video.number;
    return searchText(video.title + edition).includes(normalized);
  }).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const featured = filtered.reduce<ContentVideo | null>(
    (best, item) => !best || (item.viewCount ?? -1) > (best.viewCount ?? -1) ? item : best,
    null,
  );
  return { featured, remaining: filtered.filter(({ id }) => id !== featured?.id).slice(0, 6), total: filtered.length };
}
