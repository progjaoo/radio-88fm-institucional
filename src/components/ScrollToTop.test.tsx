import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scrolls smoothly to the top after a route change", async () => {
    render(
      <MemoryRouter initialEntries={["/inicio"]}>
        <ScrollToTop />
        <Link to="/equipe">Ir para equipe</Link>
        <Routes>
          <Route path="/inicio" element={<div>Início</div>} />
          <Route path="/equipe" element={<div>Equipe</div>} />
        </Routes>
      </MemoryRouter>
    );

    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByRole("link", { name: "Ir para equipe" }));

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });
  });
});
