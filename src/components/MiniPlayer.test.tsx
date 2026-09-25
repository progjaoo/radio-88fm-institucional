import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/AudioPlayerContext";
import MiniPlayer from "./MiniPlayer";

class MockAudio {
  src: string;
  muted = false;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();

  constructor(src = "") {
    this.src = src;
  }
}

const MiniPlayerHarness = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { togglePlay } = useAudioPlayer();

  return (
    <>
      <output data-testid="current-route">{location.pathname}</output>
      <button type="button" onClick={togglePlay}>Iniciar transmissão</button>
      <button type="button" onClick={() => navigate("/noticias")}>Mudar de tela</button>
      <MiniPlayer />
    </>
  );
};

describe("MiniPlayer", () => {
  beforeEach(() => {
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          musica_atual: "Conversa ao vivo",
          capa_musica: "https://player.srvstm.com/img/img-capa-artista-padrao.png",
          ouvintes_conectados: "192",
          status: "online",
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("keeps the station logo in the minimized player after route navigation", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AudioPlayerProvider>
          <MiniPlayerHarness />
        </AudioPlayerProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar transmissão" }));
    const artwork = await screen.findByRole("img", { name: "Logo Rádio 88 FM" });
    expect(artwork).toHaveAttribute("src", radioLogoWhite);

    fireEvent.click(screen.getByRole("button", { name: "Mudar de tela" }));
    await waitFor(() => expect(screen.getByTestId("current-route")).toHaveTextContent("/noticias"));
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoWhite);
  });
});
