import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Privacidade from "./Privacidade";
import Footer from "@/components/Footer";
import { getAnalyticsConsent } from "@/services/analytics/consent";

beforeEach(() => localStorage.clear());

it("identifies the station and scopes the commercial disclosure to the requested sentence", () => {
  const { container } = render(<MemoryRouter><Privacidade /></MemoryRouter>);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Política de Privacidade da Rádio 88 FM");
  expect(screen.getByText("31.232.747/0001-07")).toBeVisible();
  expect(screen.getAllByRole("link", { name: "comercial@grupogtf.com.br" })[0]).toHaveAttribute("href", "mailto:comercial@grupogtf.com.br");
  const commercial = container.querySelector("#publicidade")!;
  expect(commercial.querySelectorAll("p")).toHaveLength(1);
  expect(within(commercial as HTMLElement).getByText("A Rádio 88 FM veicula comerciais de empresas que pagam para anunciar na rádio.")).toBeVisible();
  expect(container.querySelector("#alexa")).toHaveTextContent("apenas reproduz a transmissão ao vivo");
  for (const link of within(screen.getByRole("navigation", { name: "Nesta política" })).getAllByRole("link")) {
    expect(container.querySelector(link.getAttribute("href")!)).not.toBeNull();
  }
});

it("persists refusal rather than clearing consent back to the default", () => {
  render(<MemoryRouter><Privacidade /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Permitir métricas opcionais" }));
  expect(getAnalyticsConsent()).toBe("granted");
  fireEvent.click(screen.getByRole("button", { name: "Recusar métricas opcionais" }));
  expect(getAnalyticsConsent()).toBe("denied");
  expect(screen.getByRole("status")).toHaveTextContent("recusadas");
});

it("provides a discreet footer link with a usable touch target", () => {
  render(<MemoryRouter><Footer /></MemoryRouter>);
  expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
});
