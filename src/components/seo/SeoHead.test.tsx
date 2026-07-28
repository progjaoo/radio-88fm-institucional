import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it } from "vitest";
import { getRouteSeoConfig, notFoundSeoConfig } from "@/services/seo/seoConfig";
import SeoHead from "./SeoHead";

afterEach(() => cleanup());

describe("SeoHead", () => {
  it("publishes canonical and complete social metadata without query strings", async () => {
    render(
      <HelmetProvider>
        <SeoHead config={getRouteSeoConfig("/nossa-radio")} pathname="/nossa-radio?ref=teste#historia" />
      </HelmetProvider>,
    );

    await waitFor(() => expect(document.title).toBe("Nossa História | Rádio 88 FM Volta Redonda"));
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.radio88fm.com/nossa-radio",
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
      "https://www.radio88fm.com/logo-88fm.png",
    );
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute("content")).toBe(
      "Rádio 88 FM",
    );
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe(
      "summary_large_image",
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("index,follow");
  });

  it("marks 404 and privacy-like functional pages as noindex", async () => {
    render(
      <HelmetProvider>
        <SeoHead config={notFoundSeoConfig} pathname="/nao-existe" />
      </HelmetProvider>,
    );
    await waitFor(() =>
      expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
        "noindex,follow",
      ),
    );
  });
});
