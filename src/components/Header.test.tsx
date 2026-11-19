import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeedProvider } from "@/services/feed/feed-data";
import type { FeedIndex } from "@/services/feed/feed.types";
import Header from "./Header";

const emptyFeedIndex: FeedIndex = {
  schemaVersion: 1,
  namespace: "test/radio-88",
  releaseId: "empty-release",
  generatedAt: "2026-10-27T12:00:00.000Z",
  posts: [],
};

describe("Header", () => {
  it("keeps Feed active inside an article", () => {
    render(<MemoryRouter initialEntries={["/feed/materia"]}><Header /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "FEED" })).toHaveClass("text-primary");
  });
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("closes the mobile menu when the user clicks outside", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Abrir menu"}));
    expect(screen.getAllByRole("link",{name:"ANUNCIE"})).toHaveLength(2);
    fireEvent.pointerDown(document.body);
    expect(screen.getAllByRole("link",{name:"ANUNCIE"})).toHaveLength(1);
  });

  it("closes the mobile menu on Escape", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"Abrir menu"}));
    fireEvent.keyDown(document,{key:"Escape"});
    expect(screen.getAllByRole("link",{name:"ANUNCIE"})).toHaveLength(1);
  });

  it("scrolls to the top when the home logo is clicked", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole("link",{name:"Rádio 88 FM"}));
    expect(window.scrollTo).toHaveBeenCalledWith({top:0,left:0,behavior:"smooth"});
  });

  it("keeps the Feed navigation visible when there are no published articles", () => {
    render(
      <MemoryRouter>
        <FeedProvider initialIndex={emptyFeedIndex}>
          <Header />
        </FeedProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "FEED" })).toHaveAttribute("href", "/feed");
    const desktop = within(screen.getByRole("navigation", { name: "Navegação principal" }));
    expect(desktop.getAllByRole("link").map((link) => link.textContent)).toEqual(["INÍCIO", "NOSSA RÁDIO", "FEED", "EQUIPE"]);
    fireEvent.click(desktop.getByRole("button", { name: "CONTEÚDOS" }));
    expect(desktop.getByRole("link", { name: /Debate 88 Para mais de 1 milhão de amigos/ })).toHaveAttribute("href", "/conteudos?categoria=debate-88");
    expect(screen.getByRole("link", { name: "ANUNCIE" })).toHaveAttribute("href", "/anuncie");
    const watch = screen.getByRole("link", { name: "ASSISTIR" });
    expect(watch.querySelector("svg.lucide-video")).not.toBeNull();
    expect(watch).not.toHaveTextContent("🎥");

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const mobile = screen.getByRole("navigation", { name: "Navegação mobile" });
    expect(within(mobile).getAllByRole("link").slice(0, 4).map((link) => link.textContent)).toEqual(["INÍCIO", "NOSSA RÁDIO", "FEED", "EQUIPE"]);
    fireEvent.click(within(mobile).getByRole("button", { name: "CONTEÚDOS" }));
    expect(within(mobile).getByRole("link", { name: /Cristo em Nós/ })).toHaveAttribute("href", "/conteudos?categoria=cristo-em-nos");
    expect(within(mobile).getByRole("link", { name: "ANUNCIE" })).toHaveAttribute("href", "/anuncie");
    expect(within(mobile).getByRole("link", { name: "Assistir" }).querySelector("svg.lucide-video")).not.toBeNull();
  });
});
