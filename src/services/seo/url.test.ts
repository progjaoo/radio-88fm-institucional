import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, normalizePathname } from "./url";

describe("SEO URL helpers", () => {
  it("remove query, hash and trailing slash from canonical URLs", () => {
    expect(buildCanonicalUrl("/nossa-radio?utm_source=instagram#historia")).toBe(
      "https://www.radio88fm.com/nossa-radio",
    );
    expect(buildCanonicalUrl("/equipe/")).toBe("https://www.radio88fm.com/equipe");
  });

  it("preserves the root pathname", () => {
    expect(normalizePathname("/")).toBe("/");
    expect(buildCanonicalUrl("/")).toBe("https://www.radio88fm.com/");
  });
});
