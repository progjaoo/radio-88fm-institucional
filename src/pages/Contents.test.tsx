import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useLocation } from "react-router-dom";
import { contentCategories, type ContentVideo } from "@/services/video-contents";
import Contents from "./Contents";

const { pauseRadio } = vi.hoisted(() => ({ pauseRadio: vi.fn() }));
vi.mock("@/contexts/AudioPlayerContext", () => ({ useAudioPlayer: () => ({ pause: pauseRadio }) }));

const catalog = {
  coverage: Object.fromEntries(contentCategories.map(({ id }) => [id, "complete"])),
  items: contentCategories.flatMap(({ id, name }, i) =>
    Array.from({ length: 9 }, (_, j): ContentVideo => ({
      id: "aBcde0_" + String(i * 9 + j).padStart(4, "0"),
      title: name + " " + (j === 0 ? "Fé em família" : "Vídeo " + j),
      date: "2026-11-" + String(10 + j),
      number: j === 0 ? 104 : null,
      thumbnailUrl: "https://i.ytimg.com/placeholder.jpg",
      viewCount: j === 0 ? 9000 : j,
      duration: "49:00",
      embeddable: true,
      categories: [id],
    }))),
};

function LocationProbe() {
  return <output data-testid="search">{useLocation().search}</output>;
}
function renderPage(url: string) {
  const client = new QueryClient();
  render(
    <MemoryRouter initialEntries={[url]}>
      <QueryClientProvider client={client}>
        <HelmetProvider>
          <LocationProbe />
          <Contents />
        </HelmetProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  pauseRadio.mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => catalog }));
});
afterEach(() => vi.unstubAllGlobals());

for (const { id, name, playlist } of contentCategories) {
  it("highlights one video and caps the recent list at six for " + name, async () => {
    renderPage("/conteudos?categoria=" + id);
    const featured = await screen.findByRole("region", { name: "Mais assistido na seleção" });
    expect(within(featured).getByRole("heading", { name: name + " Fé em família" })).toBeVisible();
    const recent = within(screen.getByRole("region", { name: "Mais de " + name }));
    expect(recent.getAllByRole("article")).toHaveLength(6);
    expect(recent.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([8, 7, 6, 5, 4, 3].map((n) => name + " Vídeo " + n));
    expect(screen.getByRole("link", { name: /Ver mais no YouTube/ })).toHaveAttribute("href", "https://www.youtube.com/playlist?list=" + playlist);
  });
}

it("combines accent-insensitive search and civil date filters, preserves them across tabs and clears just filters", async () => {
  renderPage("/conteudos?ano=2026&mes=11&dia=10");
  await screen.findByRole("region", { name: "Mais assistido na seleção" });
  const search = screen.getByRole("searchbox", { name: "Buscar conteúdo" });
  fireEvent.change(search, { target: { value: "FE em familia" } });
  const altar = screen.getByRole("tab", { name: "Altar 88" });
  fireEvent.mouseDown(altar, { button: 0 });
  expect(screen.getByTestId("search")).toHaveTextContent("?ano=2026&mes=11&dia=10&q=FE+em+familia&categoria=altar-88");
  expect(screen.getByRole("heading", { name: "Altar 88 Fé em família" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Altar 88 Vídeo 8" })).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(screen.getByTestId("search")).toHaveTextContent("?categoria=altar-88");
  expect(screen.getByRole("combobox", { name: "Filtrar por dia" })).toBeDisabled();
});

it("only pauses the station when asked to play and removes the single iframe on close", async () => {
  renderPage("/conteudos?categoria=debate-88");
  const play = await screen.findByRole("button", { name: "Assistir conteúdo" });
  expect(pauseRadio).not.toHaveBeenCalled();
  expect(screen.queryByTitle(/^Reprodução/)).not.toBeInTheDocument();
  fireEvent.click(play);
  expect(pauseRadio).toHaveBeenCalledTimes(1);
  expect(screen.getByTitle(/^Reprodução/)).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/aBcde0_0000?autoplay=1&rel=0");
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByTitle(/^Reprodução/)).not.toBeInTheDocument();
});

it("keeps the mobile program chooser in sync with the category URL and existing filters", async () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  try {
    renderPage("/conteudos?categoria=debate-88&q=FE&ano=2026");
    await screen.findByRole("heading", { name: "Debate 88 Fé em família" });
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Programa" }), { key: "ArrowDown" });
    const option = await screen.findByRole("option", { name: "Cristo em Nós" });
    fireEvent.click(option);
    expect(screen.getByTestId("search")).toHaveTextContent("?categoria=cristo-em-nos&q=FE&ano=2026");
    expect(await screen.findByRole("heading", { name: "Cristo em Nós Fé em família" })).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(1);
  } finally {
    if (original) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", original);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

it("shows an error and links to the official playlist when YouTube is unavailable", async () => {
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  renderPage("/conteudos?categoria=debate-88");
  expect(await screen.findByRole("alert")).toHaveTextContent("O catálogo está temporariamente indisponível");
  expect(screen.getByRole("link", { name: /Ver mais no YouTube/ })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(await screen.findByRole("region", { name: "Mais assistido na seleção" })).toBeVisible();
});
