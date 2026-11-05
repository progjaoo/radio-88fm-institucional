import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import LocutorCard from "./LocutorCard";

const { captured } = vi.hoisted(() => ({ captured: { hover: {} as Record<string, unknown>, focus: {} as Record<string, unknown> } }));
vi.mock("@/hooks/usePrefersReducedMotion", () => ({ usePrefersReducedMotion: vi.fn(() => false) }));
vi.mock("framer-motion", async () => {
  const React = await import("react");
  type Props = React.HTMLAttributes<HTMLDivElement> & { whileHover: Record<string, unknown>; whileFocus: Record<string, unknown>; transition: unknown };
  return { motion: { div: React.forwardRef<HTMLDivElement, Props>(({ whileHover, whileFocus, transition: _transition, ...props }, ref) => {
    captured.hover = whileHover;
    captured.focus = whileFocus;
    return <div ref={ref} {...props} />;
  }) } };
});

describe("LocutorCard restored baseline", () => {
  afterEach(() => vi.mocked(usePrefersReducedMotion).mockReturnValue(false));
  it("preserves the compact effect from before the animation request", () => {
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" compact /></TooltipProvider>);
    expect(captured.hover).toMatchObject({ scale: 1.08, y: -4 });
    expect(captured.focus).toMatchObject({ scale: 1.08, y: -4 });
    expect(screen.getByRole("img")).toHaveClass("h-[clamp(5rem,12vw,9rem)]");
  });
  it("preserves the original noncompact behavior", () => {
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" /></TooltipProvider>);
    expect(captured.hover).toMatchObject({ scale: 1.4, y: -40 });
  });
  it("preserves the original reduced-motion behavior", () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" compact /></TooltipProvider>);
    expect(captured.hover).toMatchObject({ scale: 1, y: 0 });
  });
});
