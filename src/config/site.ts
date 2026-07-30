const viteSiteUrl =
  typeof import.meta.env !== "undefined"
    ? (import.meta.env.VITE_SITE_URL as string | undefined)
    : undefined;
const nodeSiteUrl =
  typeof process !== "undefined" ? (process.env.VITE_SITE_URL as string | undefined) : undefined;
const configuredOrigin = (viteSiteUrl || nodeSiteUrl)?.trim();

export const SITE_ORIGIN = (configuredOrigin || "https://www.radio88fm.com").replace(/\/+$/, "");
export const SITE_NAME = "Rádio 88 FM";
export const SITE_LOCALE = "pt_BR";
export const SITE_LANGUAGE = "pt-BR";
export const SITE_DESCRIPTION =
  "Ouça e assista à Rádio 88 FM ao vivo e conheça nossa história, equipe e programação em Volta Redonda e no Sul Fluminense.";
export const SITE_SOCIAL_IMAGE_PATH = "/logo-88fm.png";
export const SITE_SOCIAL_IMAGE_ALT = "Logo oficial da Rádio 88 FM";

export const SITE_CONTACT = {
  telephone: "+55 24 3338-8820",
  email: "comercialvpd@gmail.com",
  streetAddress: "Rua Moacyr de Paula Lobo, 104",
  addressLocality: "Volta Redonda",
  addressRegion: "RJ",
  postalCountry: "BR",
} as const;

export const SITE_SOCIAL_PROFILES = [
  "https://www.facebook.com/radio88oficial/",
  "https://www.instagram.com/radio88fm",
  "https://www.youtube.com/@radio88oficial",
  "https://www.tiktok.com/@radio88fm",
] as const;
