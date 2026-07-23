import type {
  ApiFieldError,
  ListenerCampaign,
  ListenerDeviceStateResult,
  ListenerRegistrationPayload,
  ListenerRegistrationResult,
  ListenerSession,
} from "./types";
import { ListenerRegistrationApiError } from "./types";

const DEFAULT_CAMPAIGN_SLUG = "lancamento-institucional-2026";
const DEFAULT_PLACEMENT = "institutional_modal";

interface ApiErrorBody {
  statusCode?: number;
  code?: string;
  message?: string;
  fields?: ApiFieldError[];
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

export function getListenerRegistrationEventsUrl() {
  const baseUrl = assertConfigured();
  const placement = encodeURIComponent(getListenerRegistrationPlacement());
  return `${baseUrl}/api/public/events?placement=${placement}`;
}

export function isListenerRegistrationEnabled() {
  return import.meta.env.VITE_LISTENER_REGISTRATION_ENABLED === "true";
}

export function getListenerRegistrationCampaignSlug() {
  return (
    (import.meta.env.VITE_LISTENER_REGISTRATION_CAMPAIGN_SLUG as string | undefined) ||
    DEFAULT_CAMPAIGN_SLUG
  );
}

export function getListenerRegistrationPlacement() {
  return (
    (import.meta.env.VITE_LISTENER_REGISTRATION_PLACEMENT as string | undefined) ||
    DEFAULT_PLACEMENT
  );
}

export function getListenerRegistrationPlatform() {
  if (typeof window === "undefined") return "web_desktop";
  if (window.matchMedia("(max-width: 767px)").matches) return "web_mobile";
  if (window.matchMedia("(max-width: 1024px)").matches) return "web_tablet";
  return "web_desktop";
}

export function getListenerRegistrationOpenDelayMs() {
  const value = Number(import.meta.env.VITE_LISTENER_REGISTRATION_OPEN_DELAY_MS ?? 1200);
  return Number.isFinite(value) ? Math.max(value, 0) : 1200;
}

export function getListenerRegistrationDismissDays() {
  const value = Number(import.meta.env.VITE_LISTENER_REGISTRATION_DISMISS_DAYS ?? 7);
  return Number.isFinite(value) ? Math.max(value, 1) : 7;
}

function assertConfigured() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ListenerRegistrationApiError(
      0,
      "API_URL_MISSING",
      "Configure VITE_LISTENER_REGISTRATION_API_URL ou VITE_GESTAO_OUVINTES_API_URL para carregar a campanha.",
    );
  }

  return baseUrl;
}

async function parseApiError(response: Response) {
  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }

  throw new ListenerRegistrationApiError(
    response.status,
    body?.code || "REQUEST_FAILED",
    body?.message || "Nao foi possivel concluir a solicitacao.",
    body?.fields || [],
  );
}

export async function fetchListenerRegistrationCampaign(slug = getListenerRegistrationCampaignSlug()) {
  const baseUrl = assertConfigured();
  const response = await fetch(`${baseUrl}/api/public/campaigns/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as ListenerCampaign;
}

function publicHeaders(deviceToken: string, idempotencyKey?: string) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Device-Token": deviceToken,
    "X-Platform": getListenerRegistrationPlatform(),
  });

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  return headers;
}

export async function resolveListenerRegistrationSession(deviceToken: string) {
  const baseUrl = assertConfigured();
  const response = await fetch(`${baseUrl}/api/public/session/resolve`, {
    method: "POST",
    headers: publicHeaders(deviceToken),
    body: JSON.stringify({
      placement: getListenerRegistrationPlacement(),
      platform: getListenerRegistrationPlatform(),
    }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as ListenerSession;
}

export function createListenerRegistration(
  payload: ListenerRegistrationPayload,
  deviceToken?: string,
) {
  const baseUrl = assertConfigured();
  const submissionToken = payload.submissionToken;
  return fetch(`${baseUrl}/api/public/listeners/register-and-participate`, {
    method: "POST",
    headers: publicHeaders(deviceToken ?? "", submissionToken),
    body: JSON.stringify(payload),
  }).then(async (response) => {
    if (!response.ok) {
      await parseApiError(response);
    }

    return (await response.json()) as ListenerRegistrationResult;
  });
}

export async function participateKnownListener(campaignId: string, deviceToken: string) {
  const baseUrl = assertConfigured();
  const response = await fetch(
    `${baseUrl}/api/public/campaigns/${encodeURIComponent(campaignId)}/participations`,
    {
      method: "POST",
      headers: publicHeaders(deviceToken),
    },
  );

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as ListenerRegistrationResult;
}

export async function dismissCampaignForDevice(input: {
  campaignId: string;
  deviceToken: string;
  dismissedUntil: string;
}) {
  const baseUrl = assertConfigured();
  const response = await fetch(
    `${baseUrl}/api/public/campaigns/${encodeURIComponent(input.campaignId)}/device-state`,
    {
      method: "PUT",
      headers: publicHeaders(input.deviceToken),
      body: JSON.stringify({ dismissedUntil: input.dismissedUntil }),
    },
  );

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as ListenerDeviceStateResult;
}
