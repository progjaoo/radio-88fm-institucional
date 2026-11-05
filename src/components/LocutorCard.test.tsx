import { fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import LocutorCard from "./LocutorCard";

const { captured } = vi.hoisted(() => ({ captured: { target: {} as Record<string, unknown>, transition: {} as Record<string, unknown> } }));
vi.mock("@/hooks/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: vi.fn(() => false) }));
vi.mock("framer-motion", async () => {
  const React = await import("react");
  type Props = React.HTMLAttributes<HTMLDivElement> & { animate: Record<string, unknown>; transition: Record<string, unknown> };
  return { motion: { div: React.forwardRef<HTMLDivElement, Props>(({ animate, transition, ...props }, ref) => {
    captured.target = animate;
    captured.transition = transition;
    return <div ref={ref} {...props} />;
  }) } };
});

function setup() {
  render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" compact /></TooltipProvider>);
  return screen.getByRole("group", { name: "Locutor - Programa" });
}
describe("Locutor hover", () => {
  afterEach(() => vi.mocked(usePrefersReducedMotion).mockReturnValue(false));
  it("lifts the image from a stationary hit area and restores it on leave", () => {
    const trigger = setup();
    expect(captured.target).toEqual({ scale: 1, y: 0 });
    fireEvent.mouseEnter(trigger);
    expect(captured.target).toEqual({ scale: 1.4, y: -40 });
    expect(captured.transition).toMatchObject({ type: "spring", stiffness: 300, damping: 20 });
    expect(trigger).not.toHaveAttribute("style");
    expect(screen.getByRole("img")).toHaveClass("h-[clamp(5rem,12vw,9rem)]");
    fireEvent.mouseLeave(trigger);
    expect(captured.target).toEqual({ scale: 1, y: 0 });
  });
  it("keeps the deliberate hover response instant for reduced motion", () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    const trigger = setup();
    fireEvent.mouseEnter(trigger);
    expect(captured.target).toEqual({ scale: 1.4, y: -40 });
    expect(captured.transition).toEqual({ duration: 0 });
  });
  it("supports keyboard focus without pointer movement", () => {
    const trigger = setup();
    fireEvent.focus(trigger);
    expect(captured.target).toEqual({ scale: 1.18, y: -4 });
    fireEvent.blur(trigger);
    expect(captured.target).toEqual({ scale: 1, y: 0 });
  });
});
