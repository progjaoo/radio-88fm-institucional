import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import radioLogoColor from "@/assets/logoheadsvgcolor.svg";
import { useProgramming } from "@/services/programming/ProgrammingProvider";
import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/AudioPlayerContext";
import MiniPlayer from "./MiniPlayer";

import { MockAudio } from "@/test/MockAudio";

vi.mock("@/services/programming/ProgrammingProvider", () => ({ useProgramming: vi.fn() }));

const program = { id: "program-1", name: "Fato Popular", description: "Jornalismo", slug: "fato-popular", presenters: ["Equipe 88"], imageUrl: "https://example.com/programa.webp", time: "05:00 às 09:30", source: "weekly" as const, sourceId: "slot-1" };

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
    vi.mocked(useProgramming).mockReturnValue({ enabled: false, current: null, status: "unavailable", snapshot: null });
    MockAudio.instances = [];
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

  it.each(["/", "/feed", "/ouvir", "/inexistente"])("shows a paused player immediately at %s", (route) => {
    render(<MemoryRouter initialEntries={[route]}><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.getByRole("region", { name: "Player da Rádio 88 FM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reproduzir" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
  });

  it("links to the radio page instead of playing under the video route", () => {
    render(<MemoryRouter initialEntries={["/assistir"]}><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Ouvir rádio" })).toHaveAttribute("href", "/ouvir");
    expect(screen.queryByRole("button", { name: "Reproduzir" })).not.toBeInTheDocument();
  });

  afterEach(async () => {
    await act(async () => {});
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
    expect(artwork).toHaveAttribute("src", radioLogoColor);

    fireEvent.click(screen.getByRole("button", { name: "Mudar de tela" }));
    await waitFor(() => expect(screen.getByTestId("current-route")).toHaveTextContent("/noticias"));
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoColor);
  });

  it("shows the scheduled program while paused and shares the stream metadata request", () => {
    vi.mocked(useProgramming).mockReturnValue({ enabled: true, current: program, status: "ready", snapshot: null });
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.getByText("NO AR")).toBeInTheDocument();
    expect(screen.getByText("Fato Popular")).toBeInTheDocument();
    expect(screen.getByText("05:00 às 09:30")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoColor);
    expect(screen.getByRole("button", { name: "Reproduzir" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows song and artist beside playback controls without replacing the program", async () => {
    vi.mocked(useProgramming).mockReturnValue({ enabled: true, current: program, status: "ready", snapshot: null });
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "A Alegria Do Senhor - Sarah Beatriz" }) } as Response);
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    const title = await screen.findByTitle("A Alegria Do Senhor - Sarah Beatriz");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    expect(title).toHaveTextContent("A Alegria Do Senhor - Sarah Beatriz");
    expect(title.closest(".mini-player-status")?.nextElementSibling).toBe(screen.getByRole("button", { name: "Reproduzir" }));
    expect(document.querySelector(".mini-player-identity")).not.toHaveTextContent("A Alegria Do Senhor - Sarah Beatriz");
    expect(screen.getByText("Fato Popular")).toBeInTheDocument();
    expect(title.parentElement).not.toHaveTextContent("Áudio pausado");
    expect(title.parentElement).not.toHaveTextContent("Toque para ouvir");
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Reproduzir" }));
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    expect(title).toBeInTheDocument();
    expect(title.parentElement).toHaveTextContent("A Alegria Do Senhor - Sarah Beatriz");
  });

  it("uses a neutral title when metadata contains only the station name", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "Radio Fm 88,7 - Volta Redonda/rj" }) } as Response);
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Reproduzir" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Transmissão ao vivo")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Radio Fm 88,7 - Volta Redonda/rj")).not.toBeInTheDocument();
    expect(document.querySelector(".mini-player-status strong")).toHaveTextContent("Rádio 88 FM");
  });

  it("keeps the neutral station title when metadata cannot be loaded, without starting audio", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Metadata offline"));
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    await act(async () => {});
    expect(document.querySelector(".mini-player-status strong")).toHaveTextContent("Rádio 88 FM");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
  });

  it("keeps the colored logo when the program artwork changes", () => {
    vi.mocked(useProgramming).mockReturnValue({ enabled: true, current: program, status: "ready", snapshot: null });
    const view = render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoColor);
    vi.mocked(useProgramming).mockReturnValue({ enabled: true, current: { ...program, name: "Bom Dia 88", imageUrl: "https://example.com/bom-dia.webp" }, status: "ready", snapshot: null });
    view.rerender(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.getByRole("img", { name: "Logo Rádio 88 FM" })).toHaveAttribute("src", radioLogoColor);
  });

  it("does not invent a program when programming is unavailable", () => {
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    expect(screen.queryByText("NO AR")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir Ouvir ao vivo" })).toHaveTextContent("Rádio 88 FM");
    expect(screen.getByRole("link", { name: /Google Play/ })).toHaveAttribute("href", expect.stringContaining("id=com.sentinel4.radio88"));
    expect(screen.getByRole("link", { name: /App Store/ })).toHaveAttribute("href", expect.stringContaining("id1587595590"));
  });

  it("adjusts real audio volume, restores sound and never starts playback from volume controls", () => {
    render(<MemoryRouter><AudioPlayerProvider><MiniPlayer /></AudioPlayerProvider></MemoryRouter>);
    const slider = screen.getByRole("slider", { name: "Volume da rádio" });
    fireEvent.change(slider, { target: { value: "35" } });
    expect(MockAudio.instances[0].volume).toBe(.35);
    fireEvent.click(screen.getByRole("button", { name: "Mutar" }));
    expect(MockAudio.instances[0].muted).toBe(true);
    fireEvent.change(slider, { target: { value: "60" } });
    expect(MockAudio.instances[0].muted).toBe(false);
    expect(MockAudio.instances[0].volume).toBe(.6);
    fireEvent.change(slider, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Ativar som" }));
    expect(MockAudio.instances[0].volume).toBe(.6);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
  });
});
