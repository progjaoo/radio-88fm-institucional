import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useListenerRegistrationCampaign } from "@/hooks/useListenerRegistrationCampaign";
import ListenerRegistrationModal from "./ListenerRegistrationModal";

vi.mock("@/hooks/useListenerRegistrationCampaign", () => ({
  useListenerRegistrationCampaign: vi.fn(),
}));

vi.mock("@/services/analytics/analytics", () => ({
  Analytics: {
    track: vi.fn(),
  },
}));

const mockedUseCampaign = vi.mocked(useListenerRegistrationCampaign);

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ListenerRegistrationModal />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ListenerRegistrationModal", () => {
  beforeEach(() => {
    mockedUseCampaign.mockReturnValue({
      campaign: {
        id: "campaign-id",
        slug: "campanha-32-anos",
        type: "sweepstake",
        active: true,
        title: "Concorra a camisa dos 32 anos",
        description: "Preencha seus dados para participar do sorteio.",
        privacyNoticeVersion: "2026-08-01",
        privacyNoticeUrl: "/privacidade",
        termsUrl: null,
        startsAt: "2026-07-01T00:00:00.000Z",
        endsAt: null,
      },
      deviceToken: "device-token",
      experience: "anonymous_registration_required",
      open: true,
      setOpen: vi.fn(),
      dismiss: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  it("uses the campaign artwork while keeping an accessible title and description", () => {
    renderModal();

    expect(screen.getByTestId("campaign-modal-artwork")).toBeInTheDocument();
    const accessibleHeading = screen.getByRole("heading", {
      name: "Concorra a camisa dos 32 anos",
    });
    const accessibleDescription = document.querySelector("[data-dialog-description]");

    expect(accessibleHeading.closest(".sr-only")).not.toBeNull();
    expect(accessibleDescription).toHaveTextContent(
      "Preencha seus dados para participar do sorteio.",
    );
    expect(accessibleDescription?.closest(".sr-only")).not.toBeNull();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });
});
