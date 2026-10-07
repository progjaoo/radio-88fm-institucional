import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInstitutionalBanners } from "@/hooks/useInstitutionalBanners";
import type { PublicInstitutionalBanner } from "@/services/institutional-banners/types";
import Index from "./Index";

const { heroApi, carouselRef } = vi.hoisted(() => ({
  carouselRef: vi.fn(),
  heroApi: {
    canScrollPrev: vi.fn(() => true),
    canScrollNext: vi.fn(() => true),
    selectedScrollSnap: vi.fn(() => 0),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("embla-carousel-react", () => ({
  default: vi.fn(() => [carouselRef, heroApi]),
}));
vi.mock("@/hooks/useInstitutionalBanners", () => ({
  useInstitutionalBanners: vi.fn(),
}));
vi.mock("@/hooks/useYoutubeContent", () => ({
  useYoutubeContent: () => ({ videos: [], shorts: [], loading: false, error: null }),
}));
vi.mock("@/hooks/useListenerRegistration", () => ({
  useListenerRegistration: () => ({ requestOpen: vi.fn() }),
}));
vi.mock("@/components/LocutorCard", () => ({ default: () => null }));
vi.mock("@/components/YoutubeSection", () => ({ default: () => null }));
vi.mock("@/services/analytics/analytics", () => ({ Analytics: { track: vi.fn() } }));

function banner(order: number): PublicInstitutionalBanner {
  return {
    id: `banner-${order}`,
    title: `Banner ${order}`,
    altText: `Banner publicado ${order}`,
    imageUrl: `https://media.example/banner-${order}.webp`,
    actionType: "none",
    destinationUrl: null,
    openInNewTab: false,
    order,
  };
}

function renderHero(banners: PublicInstitutionalBanner[] = [], failed = false) {
  vi.mocked(useInstitutionalBanners).mockReturnValue({ banners, loading: false, failed });
  render(<MemoryRouter><Index /></MemoryRouter>);
  return screen.getByRole("region", { name: "Carrossel principal da Rádio 88 FM" });
}

describe("Index - banners gerenciados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    heroApi.canScrollNext.mockReturnValue(true);
    vi.useFakeTimers();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("mantem apenas o banner branco centralizado e estatico sem publicacoes", () => {
    const hero = renderHero();
    const slides = within(hero).getAllByRole("group");

    expect(slides).toHaveLength(1);
    expect(slides[0]).toHaveClass("basis-full", "pl-0");
    expect(slides[0]).toHaveTextContent("A RÁDIO QUE TOCA");
    expect(within(hero).queryByRole("button", { name: "Mostrar próximo banner" })).toBeNull();
    expect(vi.mocked(useEmblaCarousel).mock.lastCall?.[0]).toMatchObject({
      loop: false,
      startIndex: 0,
    });

    act(() => vi.advanceTimersByTime(12_000));
    expect(heroApi.scrollNext).not.toHaveBeenCalled();
  });

  it("mantem o branco como primeiro slide e acrescenta banners da gestao", () => {
    const hero = renderHero([banner(1), banner(2)]);
    const slides = within(hero).getAllByRole("group");

    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveTextContent("A RÁDIO QUE TOCA");
    expect(within(slides[1]).getByRole("img", { name: "Banner 1" }))
      .toHaveAttribute("src", "https://media.example/banner-1.webp");
    expect(within(slides[2]).getByRole("img", { name: "Banner 2" }))
      .toHaveAttribute("src", "https://media.example/banner-2.webp");
    expect(vi.mocked(useEmblaCarousel).mock.lastCall?.[0]).toMatchObject({
      containScroll: false,
      loop: true,
      startIndex: 0,
    });
  });

  it("preserva a rotacao automatica existente a cada quatro segundos", () => {
    renderHero([banner(1)]);

    act(() => vi.advanceTimersByTime(3_999));
    expect(heroApi.scrollNext).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(heroApi.scrollNext).toHaveBeenCalledTimes(1);
  });

  it("preserva as setas para navegar pelos banners publicados", () => {
    const hero = renderHero([banner(1)]);

    fireEvent.click(within(hero).getByRole("button", { name: "Mostrar próximo banner" }));
    fireEvent.click(within(hero).getByRole("button", { name: "Mostrar banner anterior" }));

    expect(heroApi.scrollNext).toHaveBeenCalledTimes(1);
    expect(heroApi.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("volta ao branco quando ha poucos slides para o loop nativo", () => {
    heroApi.canScrollNext.mockReturnValue(false);
    renderHero([banner(1)]);
    heroApi.scrollTo.mockClear();

    act(() => vi.advanceTimersByTime(4_000));

    expect(heroApi.scrollNext).not.toHaveBeenCalled();
    expect(heroApi.scrollTo).toHaveBeenCalledWith(0);
  });

  it("nao restaura banners locais antigos quando a API falha", () => {
    const hero = renderHero([], true);

    expect(within(hero).getAllByRole("group")).toHaveLength(1);
    expect(hero).toHaveTextContent("A RÁDIO QUE TOCA");
    expect(within(hero).queryByRole("button", { name: "Mostrar próximo banner" })).toBeNull();
    expect(hero.querySelector('img[src*="banner001"], img[src*="banner002"]')).toBeNull();
  });
});
