import type { FeedIndexPost } from "./feed.types";

export function getEventDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === day ? day : null;
}

export function getEventYear(value: string | null | undefined): string | null {
  return getEventDay(value)?.slice(0, 4) ?? null;
}

export function sortByEventDate(posts: FeedIndexPost[], oldestFirst = false) {
  return [...posts].sort((left, right) => {
    const leftDay = getEventDay(left.eventDate);
    const rightDay = getEventDay(right.eventDate);
    if (!leftDay && rightDay) return 1;
    if (leftDay && !rightDay) return -1;
    const order = (rightDay ?? "").localeCompare(leftDay ?? "");
    return (oldestFirst ? -order : order) || left.slug.localeCompare(right.slug);
  });
}

export function formatEventDate(value: string | null | undefined): string | null {
  const day = getEventDay(value);
  return day ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)) : null;
}
