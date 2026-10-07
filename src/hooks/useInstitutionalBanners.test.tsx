import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchInstitutionalBanners } from "@/services/institutional-banners/api";
import type { PublicInstitutionalBanner } from "@/services/institutional-banners/types";
import { useInstitutionalBanners } from "./useInstitutionalBanners";

vi.mock("@/services/institutional-banners/api", () => ({
  fetchInstitutionalBanners: vi.fn(),
}));

const banner: PublicInstitutionalBanner = {
  id: "banner-1",
  title: "Banner publicado",
  altText: "Imagem publicada pela gestao",
  imageUrl: "https://media.example/banner.webp",
  actionType: "none",
  destinationUrl: null,
  openInNewTab: false,
  order: 1,
};

describe("useInstitutionalBanners", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_INSTITUTIONAL_BANNERS_ENABLED", undefined);
    vi.mocked(fetchInstitutionalBanners).mockReset();
    vi.mocked(fetchInstitutionalBanners).mockResolvedValue({
      version: 1,
      items: [banner],
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("carrega banners publicados por padrao sem exigir uma flag no deploy", async () => {
    const hook = renderHook(() => useInstitutionalBanners());

    await waitFor(() => expect(hook.result.current.banners).toEqual([banner]));

    expect(hook.result.current.loading).toBe(false);
    expect(hook.result.current.failed).toBe(false);
    expect(fetchInstitutionalBanners).toHaveBeenCalledTimes(1);
  });

  it("carrega banners quando explicitamente habilitado", async () => {
    vi.stubEnv("VITE_INSTITUTIONAL_BANNERS_ENABLED", "true");
    const hook = renderHook(() => useInstitutionalBanners());

    await waitFor(() => expect(hook.result.current.banners).toEqual([banner]));
  });

  it("permite pausar explicitamente a integracao sem consultar a API", () => {
    vi.stubEnv("VITE_INSTITUTIONAL_BANNERS_ENABLED", "false");
    const hook = renderHook(() => useInstitutionalBanners());

    expect(hook.result.current).toEqual({ banners: [], loading: false, failed: false });
    expect(fetchInstitutionalBanners).not.toHaveBeenCalled();
  });

  it("mantem a lista vazia quando nao ha banners publicados", async () => {
    vi.mocked(fetchInstitutionalBanners).mockResolvedValue({ version: 0, items: [] });
    const hook = renderHook(() => useInstitutionalBanners());

    await waitFor(() => expect(hook.result.current.loading).toBe(false));

    expect(hook.result.current.banners).toEqual([]);
    expect(hook.result.current.failed).toBe(false);
  });

  it("falha sem introduzir banners estaticos quando a API esta indisponivel", async () => {
    vi.mocked(fetchInstitutionalBanners).mockRejectedValue(new Error("API indisponivel"));
    const hook = renderHook(() => useInstitutionalBanners());

    await waitFor(() => expect(hook.result.current.failed).toBe(true));

    expect(hook.result.current.banners).toEqual([]);
    expect(hook.result.current.loading).toBe(false);
  });

  it("nao faz polling nem repete consultas em novas renderizacoes", async () => {
    const hook = renderHook(() => useInstitutionalBanners());
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    vi.useFakeTimers();

    act(() => {
      hook.rerender();
      vi.advanceTimersByTime(120_000);
    });

    expect(fetchInstitutionalBanners).toHaveBeenCalledTimes(1);
  });

  it("cancela a consulta ao sair da pagina", () => {
    vi.mocked(fetchInstitutionalBanners).mockReturnValue(new Promise(() => {}));
    const hook = renderHook(() => useInstitutionalBanners());
    const signal = vi.mocked(fetchInstitutionalBanners).mock.calls[0]?.[0];

    hook.unmount();

    expect(signal?.aborted).toBe(true);
  });
});
