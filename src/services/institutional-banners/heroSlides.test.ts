import { describe, expect, it } from "vitest";
import { bannerImageKey, buildHeroSlides } from "./heroSlides";
import type { PublicInstitutionalBanner } from "./types";

const banner = (id: string, order: number, isPrimary?: boolean): PublicInstitutionalBanner => ({
  id, order, isPrimary, title: id, altText: id, imageUrl: `https://media.example/${id}.webp`,
  actionType: "none", destinationUrl: null, openInNewTab: false,
});

describe("composicao editorial do hero", () => {
  it("preserva branco e ordem dos contratos antigos", () => {
    expect(buildHeroSlides([banner("b", 2), banner("a", 1)]).map(s => s.id))
      .toEqual(["hero-static", "a", "b"]);
  });

  it("coloca o principal primeiro, o branco em seguida e os demais na ordem comum", () => {
    const result = buildHeroSlides([banner("a", 1), banner("festa", 3, true), banner("b", 2)]);
    expect(result.map(s => s.id)).toEqual(["festa", "hero-static", "a", "b"]);
    expect(result[0]).toMatchObject({ order: 3, type: "banner" });
  });

  it("restaura branco quando o principal falha sem eleger outro destaque", () => {
    const festa = banner("festa", 2, true);
    expect(buildHeroSlides([banner("a", 1), festa], new Set([bannerImageKey(festa)])).map(s => s.id))
      .toEqual(["hero-static", "a"]);
  });

  it("restaura branco para resposta inconsistente com varios principais", () => {
    expect(buildHeroSlides([banner("b", 2, true), banner("a", 1, true)]).map(s => s.id))
      .toEqual(["hero-static", "a", "b"]);
  });

  it("mantem o branco como segundo slide mesmo quando so existe um principal", () => {
    expect(buildHeroSlides([banner("festa", 1, true)]).map(s => s.id))
      .toEqual(["festa", "hero-static"]);
  });

  it("restaura o branco ao desmarcar o destaque mantendo sua ordem comum", () => {
    expect(buildHeroSlides([banner("a", 1), banner("festa", 2, false)]).map(s => s.id))
      .toEqual(["hero-static", "a", "festa"]);
  });

  it("aceita uma imagem nova para o mesmo banner que havia falhado", () => {
    const old = banner("festa", 1, true);
    const replacement = { ...old, imageUrl: "https://media.example/new.webp" };
    expect(buildHeroSlides([replacement], new Set([bannerImageKey(old)])).map(s => s.id))
      .toEqual(["festa", "hero-static"]);
  });

  it("descarta URLs vazias e IDs duplicados", () => {
    expect(buildHeroSlides([banner("a", 1), banner("a", 1), { ...banner("empty", 2), imageUrl: "" }]).map(s => s.id))
      .toEqual(["hero-static", "a"]);
  });
});
