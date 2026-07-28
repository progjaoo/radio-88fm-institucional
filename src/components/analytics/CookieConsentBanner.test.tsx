import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CookieConsentBanner from "./CookieConsentBanner";

describe("CookieConsentBanner", () => {
  beforeEach(() => localStorage.clear());

  it("lets the visitor accept analytics explicitly", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner registrationModalOpen={false} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Aceitar analytics" }));
    expect(screen.queryByRole("region", { name: "Preferências de privacidade" })).not.toBeInTheDocument();
  });

  it("does not compete with the listener registration modal", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner registrationModalOpen />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("region", { name: "Preferências de privacidade" })).not.toBeInTheDocument();
  });
});
