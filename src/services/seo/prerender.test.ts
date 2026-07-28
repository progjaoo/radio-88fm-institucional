import { describe, expect, it } from "vitest";
import { render } from "../../entry-server";

describe("server rendering", () => {
  it("renders route content, canonical metadata and one h1", () => {
    const result = render("/nossa-radio");
    expect(result.statusCode).toBe(200);
    expect(result.appHtml).toContain("Nossa história");
    expect(result.appHtml.match(/<h1\b/g)?.length).toBe(1);
    expect(result.headHtml).toContain("https://www.radio88fm.com/nossa-radio");
    expect(result.headHtml).toContain("application/ld+json");
  });

  it("returns noindex metadata and 404 status for unknown routes", () => {
    const result = render("/rota-inexistente");
    expect(result.statusCode).toBe(404);
    expect(result.headHtml).toContain("noindex,follow");
  });
});
