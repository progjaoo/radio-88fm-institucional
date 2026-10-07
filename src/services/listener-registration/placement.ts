import { getListenerRegistrationPlacement } from "./api";
import {
  ListenerRegistrationApiError,
  type ApiFieldError,
  type ListenerCampaignActive,
} from "./types";

export interface ListenerRegistrationPlacement {
  placement: string;
  version: number;
  campaign: ListenerCampaignActive | null;
}

function getApiBaseUrl() {
  const value = (
    import.meta.env.VITE_LISTENER_REGISTRATION_API_URL ||
    import.meta.env.VITE_GESTAO_OUVINTES_API_URL
  ) as string | undefined;
  const configuredUrl = value?.replace(/\/$/, "") ?? "";

  if (
    import.meta.env.DEV &&
    configuredUrl &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    try {
      const url = new URL(configuredUrl);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        url.hostname = window.location.hostname;
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      return configuredUrl;
    }
  }

  return configuredUrl;
}

export async function fetchListenerRegistrationPlacement(
  placement = getListenerRegistrationPlacement(),
): Promise<ListenerRegistrationPlacement> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ListenerRegistrationApiError(
      0,
      "API_URL_MISSING",
      "Configure VITE_LISTENER_REGISTRATION_API_URL ou VITE_GESTAO_OUVINTES_API_URL para carregar a campanha.",
      [],
    );
  }
  const response = await fetch(
    `${baseUrl}/api/public/placements/${encodeURIComponent(placement)}/campaign`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    let body: {
      code?: string;
      message?: string;
      fields?: ApiFieldError[];
    } | null = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    throw new ListenerRegistrationApiError(
      response.status,
      body?.code || "REQUEST_FAILED",
      body?.message || "Falha ao consultar a disponibilidade da campanha.",
      body?.fields || [],
    );
  }

  return (await response.json()) as ListenerRegistrationPlacement;
}
