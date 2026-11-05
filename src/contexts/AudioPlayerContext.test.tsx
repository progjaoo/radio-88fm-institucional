import { act, fireEvent, render, screen } from "@testing-library/react";
import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerContext";
import { Analytics } from "@/services/analytics/analytics";
import { MockAudio } from "@/test/MockAudio";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";

vi.mock("@/services/analytics/analytics", () => ({ Analytics: { track: vi.fn() } }));

function Controls() {
  const player = useAudioPlayer();
  return <><button onClick={player.togglePlay}>Toggle</button><button onClick={player.toggleMute}>Mute</button><output>{player.isLoading ? "loading" : player.isPlaying ? "playing" : "paused"}</output>{player.playbackError && <p role="alert">{player.playbackError}</p>}</>;
}

describe("Audio lifecycle", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ musica_atual: "Rádio 88 FM" }) }));
    vi.mocked(Analytics.track).mockClear();
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("starts paused without metadata, stream playback or analytics", () => {
    const { unmount } = render(<AudioPlayerProvider><Controls /></AudioPlayerProvider>);
    expect(screen.getByText("paused")).toBeInTheDocument();
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].preload).toBe("none");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60000));
    expect(fetch).not.toHaveBeenCalled();
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
    expect(fetch).not.toHaveBeenCalled();
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
    expect(fetch).toHaveBeenCalledTimes(requests);
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
});
