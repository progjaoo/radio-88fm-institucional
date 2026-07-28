import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useListenerRegistration } from "@/hooks/useListenerRegistration";
import { ListenerRegistrationApiError } from "@/services/listener-registration/types";
import ListenerRegistrationModal from "./ListenerRegistrationModal";
import { getListenerRegistrationErrorMessage } from "./error-message";

vi.mock("@/hooks/useListenerRegistration", () => ({
  useListenerRegistration: vi.fn(),
}));

vi.mock("@/services/analytics/analytics", () => ({
  Analytics: {
    track: vi.fn(),
  },
}));

const mockedUseCampaign = vi.mocked(useListenerRegistration);

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
      enabled: true,
      complete: vi.fn(),
      requestOpen: vi.fn(),
      refetchCampaign: vi.fn(),
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

  it("presents the campaign duplicate-phone response in clear language", () => {
    const error = new ListenerRegistrationApiError(
      409,
      "PHONE_ALREADY_PARTICIPATING",
      "Mensagem tecnica que nao deve substituir a regra.",
    );

    expect(getListenerRegistrationErrorMessage(error)).toBe(
      "Você já está participando do sorteio.",
    );
  });
});
