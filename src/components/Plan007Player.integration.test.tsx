import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MockAudio } from "@/test/MockAudio";
import Programacao from "@/pages/Programacao";

vi.hoisted(() => {
  vi.stubEnv("VITE_ON_AIR_ENABLED", "true");
  vi.stubEnv("VITE_PROGRAMMING_API_URL", "");
});

import { ProgrammingProvider } from "@/services/programming/ProgrammingProvider";
import MiniPlayer from "./MiniPlayer";
import OnAirSection from "./OnAirSection";

const now = Date.parse("2026-11-12T19:00:00Z");
const programId = "11111111-1111-4111-8111-111111111111";
const poll = {
  id: "33333333-3333-4333-8333-333333333333", programId,
  slug: "demonstracao-local", programName: "Favorito", question: "Sua opinião?", context: "Teste",
  mode: "message", allowMessage: true, identificationPolicy: "optional", options: [],
  startsAt: "2026-11-12T18:00:00Z", endsAt: "2026-11-12T20:00:00Z",
};
const snapshot = {
  schemaVersion: 1, radioKey: "radio-88", namespace: "preview/radio-88", revision: 1,
  generatedAt: "2026-11-12T17:00:00Z", validUntil: "2026-12-12T17:00:00Z", timezone: "America/Sao_Paulo",
  programs: [{ id: programId, name: "Favorito", slug: "favorito", description: "Programa da rádio", presenters: ["Régis", "Cíntia"], imageUrl: "https://example.com/favorito.webp", imageEdgeColor: "#D26F01" }],
  slots: [{ id: "22222222-2222-4222-8222-222222222222", programId, weekday: 4, startMinute: 900, endMinute: 1020, validFrom: "2026-11-11", validUntil: null }],
  exceptions: [],
};
let availablePoll: typeof poll | null;

beforeEach(() => {
  availablePoll = poll;
  MockAudio.instances = [];
  vi.spyOn(Date, "now").mockReturnValue(now);
  vi.stubGlobal("Audio", MockAudio);
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.startsWith("https://radiovox.conectastm.com/")) return { ok: true, json: async () => ({ musica_atual: "Rádio 88 FM" }) };
    if (url === "/api/public/programming/config") return { ok: true, json: async () => snapshot };
    if (url === `/api/public/polls/active?programId=${programId}`) return { ok: true, json: async () => ({ poll: availablePoll }) };
    throw new Error(`Unexpected request: ${url}`);
  }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
afterAll(() => vi.unstubAllEnvs());

function mount() {
  return render(<MemoryRouter><AudioPlayerProvider><ProgrammingProvider><OnAirSection /><MiniPlayer /></ProgrammingProvider></AudioPlayerProvider></MemoryRouter>);
}

it("shares the program between card and player and preserves the participation link", async () => {
  mount();
  expect(await screen.findByRole("link", { name: "PARTICIPE DO PROGRAMA" })).toHaveAttribute("href", "/enquetes/demonstracao-local");
  expect(screen.getAllByText("Favorito")).toHaveLength(2);
  expect(screen.getByText("NO AR")).toBeInTheDocument();
  expect(screen.getAllByText("15:00 às 17:00")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Reproduzir" })).toBeInTheDocument();
  expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("keeps listening available with no open poll, without removing the program card", async () => {
  availablePoll = null;
  mount();
  await screen.findByRole("heading", { name: "Favorito" });
  expect(screen.getByRole("link", { name: "OUVIR AO VIVO" })).toHaveAttribute("href", "/ouvir");
  expect(screen.queryByRole("link", { name: "PARTICIPE DO PROGRAMA" })).not.toBeInTheDocument();
  expect(screen.getByText("NO AR")).toBeInTheDocument();
});

it("does not advertise participation for an expired poll", async () => {
  availablePoll = { ...poll, endsAt: "2026-11-12T18:59:59Z" };
  mount();
  await screen.findByRole("heading", { name: "Favorito" });
  expect(screen.queryByRole("link", { name: "PARTICIPE DO PROGRAMA" })).not.toBeInTheDocument();
});

it("uses the published edge color only on the card and restores the station fallback on image failure", async () => {
  mount();
  const cover = await screen.findByRole("img", { name: "Favorito" });
  const card = cover.closest<HTMLElement>(".on-air-card")!;
  expect(card.style.getPropertyValue("--program-edge")).toBe("#D26F01");
  expect(within(screen.getByRole("region", { name: "Player da Rádio 88 FM" })).getByRole("img", { name: "Logo Rádio 88 FM" })).toBeInTheDocument();
  fireEvent.error(cover);
  expect(card.style.getPropertyValue("--program-edge")).toBe("");
  expect(within(card).getByRole("img", { name: "Rádio 88 FM" })).toBeInTheDocument();
});

it("filters the weekly schedule through accessible day tabs", async () => {
  render(<MemoryRouter><ProgrammingProvider><Programacao /></ProgrammingProvider></MemoryRouter>);
  const monday = screen.getByRole("tab", { name: "Segunda" });
  const thursday = screen.getByRole("tab", { name: "Quinta" });
  expect(monday).toHaveAttribute("aria-selected", "true");
  fireEvent.mouseDown(thursday, { button: 0 });
  expect(thursday).toHaveAttribute("aria-selected", "true");
  expect(await within(screen.getByRole("tabpanel", { name: "Quinta" })).findByRole("heading", { name: "Favorito" })).toBeInTheDocument();
});
