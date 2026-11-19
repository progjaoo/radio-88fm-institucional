import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Anuncie from "./Anuncie";
import { ADVERTISING_CONTACT, MEDIA_KIT } from "@/config/advertising";
import { Analytics } from "@/services/analytics/analytics";

vi.mock("@/services/analytics/analytics", () => ({ Analytics: { track: vi.fn() } }));

describe("Anuncie commercial page", () => {
  it("renders one clear heading without the removed highlights or audience figures", () => {
    render(<Anuncie />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sua marca na conversa de quem vive o Sul Fluminense.");
    expect(screen.queryByText("88,7 FM")).not.toBeInTheDocument();
    expect(screen.queryByText("Rádio + digital")).not.toBeInTheDocument();
    expect(screen.queryByText(/34,[46]%|76 milhões|20 mil|33 mil/)).not.toBeInTheDocument();
  });

  it("offers direct, ungated same-origin downloads backed by a real PDF", () => {
    const { container } = render(<Anuncie />);
    const downloads = screen.getAllByRole("link", { name: /baixar mídia kit/i });
    expect(downloads).toHaveLength(3);
    for (const link of downloads) {
      expect(link).toHaveAttribute("href", MEDIA_KIT.path);
      expect(link).toHaveAttribute("download", MEDIA_KIT.filename);
    }
    const file = fs.readFileSync(path.resolve("public", MEDIA_KIT.path.slice(1)));
    expect(file.subarray(0, 5).toString()).toBe("%PDF-");
    expect(file.length).toBeGreaterThan(1_000_000);
    expect(file.length).toBeLessThan(11_000_000);
    expect(container.querySelector("form, iframe")).toBeNull();
  });

  it("uses kit commercial contacts with safe external links and no personal analytics data", () => {
    render(<Anuncie />);
    const contact = screen.getByRole("link", { name: /Quero anunciar na 88/i });
    expect(contact).toHaveAttribute("href", ADVERTISING_CONTACT.whatsappUrl);
    expect(contact).toHaveAttribute("target", "_blank");
    expect(contact).toHaveAttribute("rel", "noopener noreferrer");
    fireEvent.click(contact);
    expect(Analytics.track).toHaveBeenCalledWith("whatsapp_click", { location: "anuncie_hero", current_page: "/anuncie" });
    expect(screen.getByRole("link", { name: ADVERTISING_CONTACT.email })).toHaveAttribute("href", `mailto:${ADVERTISING_CONTACT.email}`);
  });

  it("presents the regional context, four formats and three steps without promising returns", () => {
    render(<Anuncie />);
    expect(screen.getByRole("list", { name: "Cidades mencionadas no mídia kit" }).children).toHaveLength(10);
    for (const title of ["Inserções na programação", "Patrocínio de programas", "Ações digitais", "Projetos especiais"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Formatos, disponibilidade e entregas/)).toBeInTheDocument();
    expect(screen.getByText(/Consulte nossa equipe sobre a praça/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Receba uma proposta." })).toBeInTheDocument();
  });

  it("loads local images with accessible alternatives and reserved dimensions", () => {
    render(<Anuncie />);
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image).toHaveAttribute("alt");
      expect(image.getAttribute("src")).not.toMatch(/^https?:|^file:/);
      expect(image).toHaveAttribute("width");
      expect(image).toHaveAttribute("height");
    }
    expect(images[1]).toHaveAttribute("loading", "lazy");
  });
});
