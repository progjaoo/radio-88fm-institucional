import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useListenerRegistrationCampaign } from "./useListenerRegistrationCampaign";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const activeSession = {
  placement: "institutional_modal",
  placementVersion: 1,
  campaign: {
    id: "campaign-id",
    slug: "campanha-teste",
    type: "sweepstake",
    active: true,
    title: "Campanha teste",
    description: "Descricao da campanha",
    privacyNoticeVersion: "2026-08-01",
    privacyNoticeUrl: "/privacidade",
    termsUrl: null,
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: null,
  },
  listenerState: "anonymous",
  experience: "anonymous_registration_required",
  participation: null,
  dismissedUntil: null,
};

describe("useListenerRegistrationCampaign", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LISTENER_REGISTRATION_ENABLED", "true");
    vi.stubEnv("VITE_LISTENER_REGISTRATION_API_URL", "http://localhost:3010");
    vi.stubEnv("VITE_LISTENER_REGISTRATION_PLACEMENT", "institutional_modal");
    vi.stubEnv("VITE_LISTENER_REGISTRATION_OPEN_DELAY_MS", "0");
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(activeSession), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it("fecha somente a visita atual e volta a abrir em nova montagem quando nao houve cadastro", async () => {
    const first = renderHook(() => useListenerRegistrationCampaign(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(first.result.current.campaign?.slug).toBe("campanha-teste"));

    await waitFor(() => expect(first.result.current.open).toBe(true));

    act(() => first.result.current.dismiss());

    expect(first.result.current.open).toBe(false);
    expect(
      Object.keys(localStorage).some((key) => key.includes("dismissed.campanha-teste")),
    ).toBe(false);

    first.unmount();

    const second = renderHook(() => useListenerRegistrationCampaign(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(second.result.current.campaign?.slug).toBe("campanha-teste"));

    await waitFor(() => expect(second.result.current.open).toBe(true));
  });
});
