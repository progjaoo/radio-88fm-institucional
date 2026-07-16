import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

describe("Header", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders main navigation and CTA links", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /rádio 88 fm/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "INÍCIO" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "NOSSA RÁDIO" })).toHaveAttribute("href", "/nossa-radio");
    expect(screen.getByRole("link", { name: "EQUIPE" })).toHaveAttribute("href", "/equipe");
    expect(screen.getByRole("link", { name: "ANUNCIE" })).toHaveAttribute("href", "/anuncie");
    expect(screen.getByRole("link", { name: /ouvir ao vivo/i })).toHaveAttribute("href", "/ouvir");
    expect(screen.getByRole("link", { name: /assistir/i })).toHaveAttribute("href", "/assistir");
  });

  it("opens the mobile menu when the toggle is clicked", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const linksBeforeToggle = screen.getAllByRole("link", { name: "ANUNCIE" });
    expect(linksBeforeToggle).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /menu/i }));

    const linksAfterToggle = screen.getAllByRole("link", { name: "ANUNCIE" });
    expect(linksAfterToggle).toHaveLength(2);
    expect(screen.getByRole("button", { name: /fechar menu/i })).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the mobile menu when the user clicks outside the header", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));
    expect(screen.getAllByRole("link", { name: "ANUNCIE" })).toHaveLength(2);

    fireEvent.pointerDown(document.body);

    expect(screen.getAllByRole("link", { name: "ANUNCIE" })).toHaveLength(1);
  });

  it("closes the mobile menu when Escape is pressed", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getAllByRole("link", { name: "ANUNCIE" })).toHaveLength(1);
  });

  it("scrolls smoothly to the top when the logo is clicked on the home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("link", { name: /rádio 88 fm/i }));

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
});
