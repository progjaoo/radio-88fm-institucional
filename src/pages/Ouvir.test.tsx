import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Ouvir from "./Ouvir";

class MockAudio {
  static instances: MockAudio[] = [];

  src: string;
  muted = false;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();

  constructor(src = "") {
    this.src = src;
    MockAudio.instances.push(this);
  }
}

describe("Ouvir", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          musica_atual: "Radio FM 88 - Ao Vivo",
          capa_musica: "https://example.com/capa.jpg",
          ouvintes_conectados: "42",
          status: "online",
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads stream metadata and normalizes the station name", async () => {
    render(<Ouvir />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole("heading", { name: "Rádio 88 FM" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /capa/i })).toHaveAttribute("src", "https://example.com/capa.jpg");
  });

  it("plays, pauses and mutes the audio stream", async () => {
    render(<Ouvir />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reproduzir/i }));
    });

    expect(MockAudio.instances).toHaveLength(2);
    expect(MockAudio.instances[1].play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /pausar/i })).toBeInTheDocument();

    const muteButton = screen.getByRole("button", { name: /mutar/i });
    fireEvent.click(muteButton);
    expect(MockAudio.instances[1].muted).toBe(true);
    expect(screen.getByRole("button", { name: /ativar som/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /pausar/i }));
    });

    expect(MockAudio.instances[1].pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /reproduzir/i })).toBeInTheDocument();
  });
});
