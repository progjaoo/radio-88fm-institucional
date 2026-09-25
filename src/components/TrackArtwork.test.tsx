import { fireEvent, render, screen } from "@testing-library/react";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { isProviderDefaultArtwork } from "@/lib/trackArtwork";
import TrackArtwork from "./TrackArtwork";

describe("isProviderDefaultArtwork", () => {
  it.each([
    "https://player.srvstm.com/img/img-capa-artista-padrao.png",
    "https://player.srvstm.com/img/IMG-CAPA-ARTISTA-PADRAO.PNG?cache=1#cover",
    "/img/img-capa-artista-padrao.png?version=2",
  ])("recognizes the provider fallback in %s", (source) => {
    expect(isProviderDefaultArtwork(source)).toBe(true);
  });

  it.each([undefined, null, "", "   ", "http://["])(
    "uses the station fallback for missing or invalid source %s",
    (source) => {
      expect(isProviderDefaultArtwork(source)).toBe(true);
    }
  );

  it("does not classify a different image as the provider fallback", () => {
    expect(isProviderDefaultArtwork("https://cdn.example.com/albums/artist-cover.webp?size=large")).toBe(false);
  });
});

describe("TrackArtwork", () => {
  it("renders a real cover without replacing it", () => {
    render(<TrackArtwork src="https://cdn.example.com/album.webp" />);

    expect(screen.getByRole("img", { name: "Capa da música atual" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/album.webp"
    );
  });

  it("renders the white station logo for the provider's generic cover", () => {
    render(<TrackArtwork src="https://player.srvstm.com/img/img-capa-artista-padrao.png" />);

    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoWhite);
  });

  it("switches a failed cover to the logo and accepts a new valid URL", () => {
    const { rerender } = render(<TrackArtwork src="https://cdn.example.com/broken-cover.webp" />);

    fireEvent.error(screen.getByRole("img", { name: "Capa da música atual" }));
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoWhite);

    rerender(<TrackArtwork src="https://cdn.example.com/new-cover.webp" />);
    expect(screen.getByRole("img", { name: "Capa da música atual" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/new-cover.webp"
    );
  });
});
