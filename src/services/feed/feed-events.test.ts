import { formatEventDate, getEventDay, getEventYear, sortByEventDate } from "./feed-events";
import type { FeedIndexPost } from "./feed.types";

const post = (slug: string, eventDate?: string | null): FeedIndexPost => ({
  id:slug, slug, title:slug, excerpt:"Teste", eventDate,
  publishedAt:"2026-10-28T10:00:00Z", cover:{url:"/logo-88fm.png",alt:"Teste"}, category:{name:"Rádio",slug:"radio"},
});

describe("Datas de acontecimentos do Feed", () => {
  it("keeps the calendar day without a timezone shift", () => {
    expect(getEventDay("2025-01-01")).toBe("2025-01-01");
    expect(getEventYear("2025-01-01T00:00:00.000Z")).toBe("2025");
    expect(formatEventDate("2025-01-01")).toBe("1 de janeiro de 2025");
  });

  it("does not replace missing or invalid dates with publication dates", () => {
    for (const value of [undefined, null, "", "2025-02-30", "invalid"]) expect(getEventDay(value)).toBeNull();
  });

  it("orders occurrences newest first and keeps undated posts last", () => {
    expect(sortByEventDate([post("undated"), post("older","2025-03-01"), post("newer","2026-01-01")]).map((item) => item.slug)).toEqual(["newer","older","undated"]);
  });

  it("orders oldest first without moving undated posts to the front", () => {
    expect(sortByEventDate([post("undated"), post("newer","2026-01-01"), post("older","2025-03-01")],true).map((item) => item.slug)).toEqual(["older","newer","undated"]);
  });
});
