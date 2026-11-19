import { act, fireEvent, render, screen } from "@testing-library/react";
import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerContext";
import { Analytics } from "@/services/analytics/analytics";
import { MockAudio } from "@/test/MockAudio";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";

vi.mock("@/services/analytics/analytics", () => ({ Analytics: { track: vi.fn() } }));

function Controls() {
  const player = useAudioPlayer();
  return <><button onClick={player.togglePlay}>Toggle</button><button onClick={player.toggleMute}>Mute</button><output>{player.isLoading ? "loading" : player.isPlaying ? "playing" : "paused"}</output><output data-testid="metadata">{player.streamData?.musica_atual}</output>{player.playbackError && <p role="alert">{player.playbackError}</p>}</>;
}

describe("Audio lifecycle", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "Rádio 88 FM" }) }));
    vi.mocked(Analytics.track).mockClear();
  });
  afterEach(async () => { await act(async () => {}); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("starts paused without playback or analytics, but keeps public metadata current", () => {
    const { unmount } = render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    expect(screen.getByText("paused")).toBeInTheDocument();
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].preload).toBe("none");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60000));
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(Analytics.track).not.toHaveBeenCalled();
    unmount();
    expect(Analytics.track).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("waits for playing, handles rejection and permits retry", async () => {
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    const audio = MockAudio.instances[0];
    audio.play.mockImplementationOnce(() => Promise.reject(new Error("blocked")));
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    expect(screen.getByRole("alert")).toHaveTextContent("Tente novamente");
    expect(screen.getByText("paused")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(Analytics.track).not.toHaveBeenCalled();
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    expect(screen.getByText("playing")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(Analytics.track).toHaveBeenCalledWith("radio_play");
  });

  it("allows cancelling a connection and ignores its late rejection", async () => {
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    let reject!: (reason: Error) => void;
    MockAudio.instances[0].play.mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail; }));
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(Analytics.track).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Toggle"));
    await act(async () => reject(new Error("cancelled")));
    expect(screen.getByText("paused")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not count buffering as listening, deduplicates playing and cleans timers", async () => {
    const { unmount } = render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    const audio = MockAudio.instances[0];
    act(() => { vi.advanceTimersByTime(10000); audio.dispatchEvent(new Event("waiting")); vi.advanceTimersByTime(60000); });
    expect(Analytics.track).not.toHaveBeenCalledWith("radio_listening_time", { seconds: 30 });
    act(() => { audio.dispatchEvent(new Event("playing")); audio.dispatchEvent(new Event("playing")); vi.advanceTimersByTime(20000); });
    expect(vi.mocked(Analytics.track).mock.calls.filter(([event]) => event === "radio_play")).toHaveLength(1);
    expect(Analytics.track).toHaveBeenCalledWith("radio_listening_time", { seconds: 30 });
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    const requests = vi.mocked(fetch).mock.calls.length;
    act(() => vi.advanceTimersByTime(60000));
    expect(fetch).toHaveBeenCalledTimes(requests + 4);
    expect(vi.mocked(Analytics.track).mock.calls.filter(([event]) => event === "radio_pause")).toHaveLength(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops managed media before requesting radio playback and keeps mute independent", async () => {
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    const stop = vi.fn();
    window.addEventListener(RADIO_PLAY_REQUEST, stop);
    MockAudio.instances[0].play.mockImplementationOnce(() => {
      expect(stop).toHaveBeenCalledTimes(1);
      MockAudio.instances[0].dispatchEvent(new Event("playing"));
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText("Mute"));
    expect(MockAudio.instances[0].muted).toBe(true);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    window.removeEventListener(RADIO_PLAY_REQUEST, stop);
  });

  it("skips public metadata polling while the tab is hidden and refreshes on return", () => {
    const { unmount } = render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    expect(fetch).toHaveBeenCalledTimes(1);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => { document.dispatchEvent(new Event("visibilitychange")); vi.advanceTimersByTime(30000); });
    expect(fetch).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("updates the song as it changes without the listener ever pressing play", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ musica_atual: "Primeira música - Cantora" }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ musica_atual: "Próxima música - Cantor" }) } as Response);
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => {});
    expect(screen.getByTestId("metadata")).toHaveTextContent("Primeira música - Cantora");
    await act(async () => { vi.advanceTimersByTime(15000); });
    expect(screen.getByTestId("metadata")).toHaveTextContent("Próxima música - Cantor");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    expect(Analytics.track).not.toHaveBeenCalled();
  });
});

describe("OS media controls", () => {
  let originalSession: PropertyDescriptor | undefined;
  let session: { metadata: MediaMetadata | null; playbackState: string; setActionHandler: ReturnType<typeof vi.fn> };
  let actions: Map<string, (() => void) | null>;
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "Radio Fm 88,7 - Volta Redonda" }) }));
    vi.stubGlobal("MediaMetadata", class { constructor(value: MediaMetadataInit) { Object.assign(this, value); } });
    actions = new Map();
    session = { metadata: null, playbackState: "none", setActionHandler: vi.fn((name, handler) => actions.set(name, handler)) };
    originalSession = Object.getOwnPropertyDescriptor(navigator, "mediaSession");
    Object.defineProperty(navigator, "mediaSession", { configurable: true, value: session });
  });
  afterEach(() => {
    if (originalSession) Object.defineProperty(navigator, "mediaSession", originalSession);
    else Reflect.deleteProperty(navigator, "mediaSession");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it("provides raster station artwork and a clean title before the first play", async () => {
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => {});
    expect(session.metadata?.title).toBe("Rádio 88 FM - O Som do Céu!");
    expect(session.metadata?.artwork).toEqual([{
      sizes: "512x512",
      src: "https://www.radio88fm.com/logo-88fm-color.png?media-session=v2",
      type: "image/png",
    }]);
    expect(session.playbackState).toBe("paused");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
  });
  it("publishes secure station artwork synchronously before Safari starts playback", async () => {
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => {});
    const audio = MockAudio.instances[0];
    audio.play.mockImplementationOnce(() => {
      expect(session.playbackState).toBe("playing");
      expect(session.metadata?.artwork[0]?.src).toBe("https://www.radio88fm.com/logo-88fm-color.png?media-session=v2");
      return Promise.resolve();
    });
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    expect(MockAudio.instances).toHaveLength(1);
  });
  it("connects native play/pause to the existing player and refreshes metadata after loading", async () => {
    const { unmount } = render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => actions.get("play")?.());
    expect(MockAudio.instances).toHaveLength(1);
    expect(session.playbackState).toBe("playing");
    session.metadata = null;
    act(() => MockAudio.instances[0].dispatchEvent(new Event("loadedmetadata")));
    expect(session.metadata?.title).toBe("Rádio 88 FM - O Som do Céu!");
    act(() => actions.get("pause")?.());
    expect(session.playbackState).toBe("paused");
    unmount();
    expect(actions.get("play")).toBeNull();
    expect(actions.get("pause")).toBeNull();
  });
  it("keeps song metadata even when audio is paused", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "Videira - Fernanda Brum" }) } as Response);
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => {});
    expect(session.metadata?.title).toBe("Videira - Fernanda Brum");
    expect(session.playbackState).toBe("paused");
  });
  it("does not break playback when native metadata or an action is unsupported", async () => {
    vi.stubGlobal("MediaMetadata", class { constructor() { throw new Error("unsupported"); } });
    session.setActionHandler.mockImplementation(() => { throw new Error("unsupported action"); });
    render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    await act(async () => fireEvent.click(screen.getByText("Toggle")));
    expect(screen.getByText("playing")).toBeInTheDocument();
  });
});
