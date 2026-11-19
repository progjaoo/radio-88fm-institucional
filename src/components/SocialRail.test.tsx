import { fireEvent, render, screen } from "@testing-library/react";
import SocialRail from "./SocialRail";
import { socialLinks } from "@/config/social-links";

it("renders only the four local brand icons with safe external destinations", () => {
  const { container } = render(<SocialRail />);
  expect(screen.getByRole("navigation", { name: "Redes sociais da Rádio 88 FM" })).toBeInTheDocument();
  expect(screen.getAllByRole("link")).toHaveLength(4);
  for (const social of socialLinks) {
    const link = screen.getByRole("link", { name: `${social.label} da Rádio 88 FM (nova aba)` });
    expect(link).toHaveAttribute("href", social.href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(social.icon).not.toMatch(/^https?:/);
  }
  expect(container.querySelector("script, iframe")).toBeNull();
});

it("opens and closes the compact menu and restores focus with Escape", () => {
  render(<SocialRail />);
  const toggle = screen.getByRole("button", { name: "Abrir redes sociais" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle.getAttribute("aria-controls")).toBe(screen.getByRole("navigation").id);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
});

it("closes on an outside pointer interaction", () => {
  render(<SocialRail />);
  const toggle = screen.getByRole("button", { name: "Abrir redes sociais" });
  fireEvent.click(toggle);
  fireEvent.pointerDown(screen.getByRole("link", { name: /Facebook/ }));
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  fireEvent.pointerDown(document.body);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});

it("closes after keyboard focus leaves the component", () => {
  render(<SocialRail />);
  const toggle = screen.getByRole("button", { name: "Abrir redes sociais" });
  fireEvent.click(toggle);
  const facebook = screen.getByRole("link", { name: /Facebook/ });
  fireEvent.blur(toggle, { relatedTarget: facebook });
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  fireEvent.blur(facebook, { relatedTarget: document.body });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});
