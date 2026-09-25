import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import Ouvir from "./Ouvir";

class MockAudio {
  static instances: MockAudio[] = [];

  src: string;
  muted = false;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();

  constructor(src = "") {
    this.src = src;
    MockAudio.instances.push(this);
  }
}

const renderOuvir = () =>
  render(
    <AudioPlayerProvider>
      <Ouvir />
    </AudioPlayerProvider>
  );

const mockStreamResponse = (data: Record<string, string>) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(data),
    })
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

  it("loads stream metadata and normalizes the station name", async () => {
    renderOuvir();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole("heading", { name: "Rádio 88 FM" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /capa/i })).toHaveAttribute("src", "https://example.com/capa.jpg");
  });

  it("shows the station logo when the API returns its generic cover during a track", async () => {
    mockStreamResponse({
      musica_atual: "Conversa ao vivo",
      capa_musica: "https://player.srvstm.com/img/img-capa-artista-padrao.png",
      ouvintes_conectados: "192",
      status: "online",
    });
    renderOuvir();

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
