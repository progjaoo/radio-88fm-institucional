import { act, fireEvent, render, screen } from "@testing-library/react";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import Ouvir from "./Ouvir";

import { MockAudio } from "@/test/MockAudio";

const renderOuvir = () =>
  render(
    <AudioPlayerProvider>
      <Ouvir />
    </AudioPlayerProvider>
  );

const mockStreamResponse = (data: Record<string, string>, artworkResponse: object | null = null) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url === "/api/music/artwork" ? artworkResponse : data,
    })),
  );
};

describe("Ouvir", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    mockStreamResponse({
      musica_atual: "Radio FM 88 - Ao Vivo",
      capa_musica: "https://example.com/capa.jpg",
      ouvintes_conectados: "42",
      status: "online",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("normalizes the station name and ignores unverified VOX covers", async () => {
    renderOuvir();

    expect(await screen.findByRole("heading", { name: "Rádio 88 FM" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoWhite);
  });

  it("shows the verified iTunes cover for Eu Cuido de Ti before playback", async () => {
    const base = "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/16/c7/63/16c7632d-e697-3b62-4ef8-c420bf51dae3/0.jpg";
    mockStreamResponse({ musica_atual: "Eu Cuido De Ti - Cancao & Louvor" }, {
      status: "matched",
      trackKey: "eu cuido de ti cancao louvor",
      artwork: {
        source: "itunes",
        imageUrl: `${base}/600x600bb.jpg`,
        fallbackImageUrl: `${base}/100x100bb.jpg`,
        trackName: "Eu Cuido de Ti",
        artistName: "Canção e Louvor",
        albumName: "Eu Cuido de Ti - EP",
      },
    });
    renderOuvir();

    expect(await screen.findByRole("img", { name: "Capa da música atual" })).toHaveAttribute("src", `${base}/600x600bb.jpg`);
    expect(screen.getByRole("heading", { name: "Eu Cuido De Ti - Cancao & Louvor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reproduzir" })).toBeInTheDocument();
  });

  it("shows the station logo when the API returns its generic cover during a track", async () => {
    mockStreamResponse({
      musica_atual: "Conversa ao vivo",
      capa_musica: "https://player.srvstm.com/img/img-capa-artista-padrao.png",
      ouvintes_conectados: "192",
      status: "online",
    });
    renderOuvir();
    fireEvent.click(screen.getByRole("button", { name: "Reproduzir" }));

    const artwork = await screen.findByRole("img", { name: "Logo Rádio 88 FM" });
    expect(artwork).toHaveAttribute("src", radioLogoWhite);
    expect(screen.getByRole("heading", { name: "Conversa ao vivo" })).toBeInTheDocument();
  });

  it("plays, pauses and mutes the audio stream", async () => {
    renderOuvir();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reproduzir/i }));
    });

    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /pausar/i })).toBeInTheDocument();

    const muteButton = screen.getByRole("button", { name: /mutar/i });
    fireEvent.click(muteButton);
    expect(MockAudio.instances[0].muted).toBe(true);
    expect(screen.getByRole("button", { name: /ativar som/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /pausar/i }));
    });

    expect(MockAudio.instances[0].pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /reproduzir/i })).toBeInTheDocument();
  });
});
