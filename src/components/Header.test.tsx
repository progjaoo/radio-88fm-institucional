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
  beforeEach(() => { vi.spyOn(window, "scrollTo").mockImplementation(() => undefined); });
  afterEach(() => vi.restoreAllMocks());

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
    expect(within(screen.getByRole("navigation")).getAllByRole("link").map((link) => link.textContent)).toEqual(["INÍCIO", "FEED", "NOSSA RÁDIO", "EQUIPE", "ANUNCIE"]);
    const watch = screen.getByRole("link", { name: "ASSISTIR" });
    expect(watch.querySelector("svg.lucide-video")).not.toBeNull();
    expect(watch).not.toHaveTextContent("🎥");

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const mobile = screen.getAllByRole("navigation")[1];
    expect(within(mobile).getAllByRole("link").slice(0, 5).map((link) => link.textContent)).toEqual(["INÍCIO", "FEED", "NOSSA RÁDIO", "EQUIPE", "ANUNCIE"]);
    expect(within(mobile).getByRole("link", { name: "Assistir" }).querySelector("svg.lucide-video")).not.toBeNull();
  });
});
