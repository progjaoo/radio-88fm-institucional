const STORAGE_PREFIX = "radio88.listener-registration.v1";
const DEVICE_STORAGE_KEY = "radio88.listener-registration.v2.device-token";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function keyFor(kind: "completed" | "dismissed" | "submission-token", slug: string) {
  return `${STORAGE_PREFIX}.${kind}.${slug}`;
}

function createSubmissionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function createOpaqueToken() {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${createSubmissionToken()}`;
}

export function getOrCreateDeviceToken() {
  if (!canUseStorage()) return createOpaqueToken();

  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) return existing;

  const token = createOpaqueToken();
  window.localStorage.setItem(DEVICE_STORAGE_KEY, token);
  return token;
}

export function hasCompletedListenerRegistration(slug: string) {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(keyFor("completed", slug)) === "true";
}

export function markListenerRegistrationCompleted(slug: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(keyFor("completed", slug), "true");
  window.localStorage.removeItem(keyFor("dismissed", slug));
  window.localStorage.removeItem(keyFor("submission-token", slug));
}

export function isListenerRegistrationDismissed(slug: string) {
  if (!canUseStorage()) return false;

  const raw = window.localStorage.getItem(keyFor("dismissed", slug));
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as { expiresAt?: string };
    if (!parsed.expiresAt) return false;

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      window.localStorage.removeItem(keyFor("dismissed", slug));
      return false;
    }

    return true;
  } catch {
    window.localStorage.removeItem(keyFor("dismissed", slug));
    return false;
  }
}

export function dismissListenerRegistration(slug: string, days: number) {
  if (!canUseStorage()) return;

  const expiresAt = new Date(Date.now() + Math.max(days, 1) * 24 * 60 * 60 * 1000).toISOString();
  window.localStorage.setItem(keyFor("dismissed", slug), JSON.stringify({ expiresAt }));
}

export function getOrCreateSubmissionToken(slug: string) {
  if (!canUseStorage()) return createSubmissionToken();

  const key = keyFor("submission-token", slug);
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const token = createSubmissionToken();
  window.localStorage.setItem(key, token);
  return token;
}
