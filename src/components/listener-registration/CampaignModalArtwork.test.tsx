import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignModalArtwork } from "./CampaignModalArtwork";

describe("CampaignModalArtwork", () => {
  it("renders the campaign content over the decorative artwork", () => {
    const { container } = render(
      <CampaignModalArtwork
        title="Concorra a camisa dos 32 anos"
        description="Cadastre-se para participar do sorteio."
      />,
    );

    expect(screen.getByTestId("campaign-modal-artwork")).toHaveClass("aspect-[668/333]");
    expect(screen.getByText("Concorra a camisa dos 32 anos")).toBeInTheDocument();
    expect(screen.getByText("Cadastre-se para participar do sorteio.")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("keeps full text in the DOM while applying visual line clamps", () => {
    const title = "Titulo publico longo usado para validar o limite visual de tres linhas";
    const description =
      "Descricao publica completa que permanece no DOM mesmo quando a apresentacao visual usa reticencias.";

    render(<CampaignModalArtwork title={title} description={description} />);

    expect(screen.getByText(title)).toHaveClass("line-clamp-3");
    expect(screen.getByText(description)).toHaveClass("line-clamp-3");
  });

  it("formats the anniversary campaign in three complete lines with partial emphasis", () => {
    render(
      <CampaignModalArtwork
        title="Concorra a camisa dos 32 anos da Rádio 88 Fm."
        description="Ao preencher as informacoes, voce participa do sorteio."
      />,
    );

    const firstLine = screen.getByTestId("campaign-title-line-1");
    const secondLine = screen.getByTestId("campaign-title-line-2");
    const thirdLine = screen.getByTestId("campaign-title-line-3");

    expect(firstLine).toHaveTextContent("Concorra a camisa");
    expect(secondLine).toHaveTextContent("dos 32 anos da");
    expect(within(secondLine).getByText("32 anos da")).toHaveClass("font-extrabold");
    expect(thirdLine).toHaveTextContent("Rádio 88 Fm");
    expect(thirdLine).toHaveClass("font-extrabold");
  });

  it("centers the public description inside its artwork area", () => {
    render(
      <CampaignModalArtwork
        title="Campanha"
        description="Descricao publica centralizada."
      />,
    );

    expect(screen.getByTestId("campaign-artwork-description")).toHaveClass("text-center");
  });
});
