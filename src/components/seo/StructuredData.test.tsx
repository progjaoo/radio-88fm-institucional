import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it } from "vitest";
import { getRouteSeoConfig } from "@/services/seo/seoConfig";
import StructuredData, { buildStructuredDataGraph } from "./StructuredData";

afterEach(() => cleanup());

describe("StructuredData", () => {
  it("builds a verifiable organization, radio and website graph for the home", () => {
    const graph = buildStructuredDataGraph(getRouteSeoConfig("/"), "https://www.radio88fm.com/");
    const serialized = JSON.stringify(graph);

    expect(graph["@graph"].map((node) => node["@type"])).toEqual(
      expect.arrayContaining(["Organization", "RadioStation", "WebSite", "WebPage"]),
    );
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("review");
    expect(serialized).not.toContain("openingHours");
  });

  it("renders parseable JSON-LD", async () => {
    render(
      <HelmetProvider>
        <StructuredData
          route={getRouteSeoConfig("/equipe")}
          canonicalUrl="https://www.radio88fm.com/equipe"
        />
      </HelmetProvider>,
    );
    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script?.textContent).toBeTruthy();
      expect(() => JSON.parse(script?.textContent || "")).not.toThrow();
    });
  });
});
