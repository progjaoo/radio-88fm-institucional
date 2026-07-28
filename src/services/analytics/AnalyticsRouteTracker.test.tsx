import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsRouteTracker from "./AnalyticsRouteTracker";
import { Analytics } from "./analytics";

vi.mock("./analytics", () => ({
  Analytics: {
    page: vi.fn(() => true),
    track: vi.fn(() => true),
  },
}));
vi.mock("./useScrollTracking", () => ({ useScrollTracking: vi.fn() }));
vi.mock("./useEngagementTracking", () => ({ useEngagementTracking: vi.fn() }));

const renderTracker = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <HelmetProvider>
        <AnalyticsRouteTracker />
        <Routes>
          <Route path="/" element={<Link to="/equipe">Equipe</Link>} />
          <Route path="/equipe" element={<p>Equipe carregada</p>} />
        </Routes>
      </HelmetProvider>
    </MemoryRouter>,
  );

describe("AnalyticsRouteTracker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends one page view per real route change", async () => {
    renderTracker();

    await waitFor(() => expect(Analytics.page).toHaveBeenCalledTimes(1));
    expect(Analytics.page).toHaveBeenLastCalledWith(
      expect.objectContaining({ page_path: "/", page_name: "home" }),
    );

    fireEvent.click(screen.getByRole("link", { name: "Equipe" }));
    await screen.findByText("Equipe carregada");
    await waitFor(() => expect(Analytics.page).toHaveBeenCalledTimes(2));
    expect(Analytics.page).toHaveBeenLastCalledWith(
      expect.objectContaining({ page_path: "/equipe", page_name: "equipe" }),
    );
  });
});
