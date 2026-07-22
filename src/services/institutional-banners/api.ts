import type { PublicInstitutionalBannersResponse } from "./types";

const API_URL = (
  import.meta.env.VITE_GESTAO_OUVINTES_API_URL ??
  import.meta.env.VITE_LISTENER_REGISTRATION_API_URL ??
  "http://127.0.0.1:3010"
).replace(/\/+$/, "");

export async function fetchInstitutionalBanners(
  signal?: AbortSignal,
): Promise<PublicInstitutionalBannersResponse> {
  const response = await fetch(
    API_URL + "/api/public/institutional-banners?placement=home_hero",
    {
      signal,
      headers: { Accept: "application/json" },
      cache: "no-cache",
    },
  );

  if (!response.ok) {
    throw new Error("Falha ao carregar banners institucionais.");
  }

  const data = (await response.json()) as PublicInstitutionalBannersResponse;
  return {
    ...data,
    items: [...data.items].sort((first, second) => first.order - second.order),
  };
}
