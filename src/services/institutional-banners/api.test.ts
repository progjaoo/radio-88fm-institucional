import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchInstitutionalBanners } from "./api";

describe("fetchInstitutionalBanners", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("retorna os banners publicados pela Gestao de Ouvintes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 1,
        items: [{
          id: "banner-1",
          title: "Aniversario",
          altText: "Banner de aniversario",
          imageUrl: "https://media.example/banner.webp",
          destinationUrl: null,
          openInNewTab: false,
          order: 1,
        }],
      }),
    }));

    const result = await fetchInstitutionalBanners();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].imageUrl).toContain("banner.webp");
  });

  it("falha de forma controlada quando a API nao responde com sucesso", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchInstitutionalBanners()).rejects.toThrow(
      "Falha ao carregar banners institucionais.",
    );
  });

  it("normaliza a ordem dos banners antes de entrega-los ao Hero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 3,
        items: [3, 1, 2].map((order) => ({
          id: `banner-${order}`,
          title: `Banner ${order}`,
          altText: `Banner na ordem ${order}`,
          imageUrl: `https://media.example/banner-${order}.webp`,
          destinationUrl: null,
          openInNewTab: false,
          order,
        })),
      }),
    }));

    const result = await fetchInstitutionalBanners();

    expect(result.items.map((item) => item.order)).toEqual([1, 2, 3]);
  });

  it("descarta banners sem URL de imagem para evitar slides vazios", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 4,
        items: [
          {
            id: "banner-valido",
            title: "Valido",
            altText: "Banner valido",
            imageUrl: "https://media.example/banner-valido.webp",
            destinationUrl: null,
            openInNewTab: false,
            order: 2,
          },
          {
            id: "banner-vazio",
            title: "Vazio",
            altText: "Banner sem imagem",
            imageUrl: "",
            destinationUrl: null,
            openInNewTab: false,
            order: 1,
          },
        ],
      }),
    }));

    const result = await fetchInstitutionalBanners();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("banner-valido");
  });
});
