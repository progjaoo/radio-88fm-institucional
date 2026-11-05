import { fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import LocutorCard from "./LocutorCard";

const { captured } = vi.hoisted(() => ({ captured: { hover: {} as Record<string, unknown>, focus: {} as Record<string, unknown>, transition: {} as Record<string, unknown> } }));
vi.mock("framer-motion", async () => {
  const React = await import("react");
  type Props = React.HTMLAttributes<HTMLDivElement> & { whileHover: Record<string, unknown>; whileFocus: Record<string, unknown>; transition: Record<string, unknown> };
  return { motion: { div: React.forwardRef<HTMLDivElement, Props>(({ whileHover, whileFocus, transition, ...props }, ref) => {
    captured.hover = whileHover;
    captured.focus = whileFocus;
    captured.transition = transition;
    return <div ref={ref} {...props} />;
  }) } };
});

describe("LocutorCard original composition", () => {
  it("renders the tooltip outside the clipped team layer without intercepting clicks", async () => {
    const { container } = render(<TooltipProvider><div style={{ overflow: "hidden", transform: "scale(1)" }}><LocutorCard image="/foto.png" name="Locutor" program="Programa" /></div></TooltipProvider>);
    fireEvent.focus(screen.getByRole("group"));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Locutor");
    expect(tooltip).toHaveTextContent("Programa");
    expect(container).not.toContainElement(tooltip);
    expect(document.querySelector('[data-radix-popper-content-wrapper] .pointer-events-none')).toHaveClass("z-50");
    expect(document.querySelector('[data-radix-popper-content-wrapper]')?.parentElement).toHaveClass("pointer-events-none");
  });
  it("uses the exact original card and portrait dimensions", () => {
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" /></TooltipProvider>);
    expect(screen.getByRole("group")).toHaveClass("w-[113px]", "flex-shrink-0");
    expect(screen.getByRole("img")).toHaveClass("h-[250px]", "w-auto", "object-bottom");
  });
  it("uses the hover and spring supplied by the user", () => {
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" /></TooltipProvider>);
    expect(captured.hover).toEqual({ scale: 1.4, y: -40, zIndex: 4 });
    expect(captured.transition).toEqual({ type: "spring", stiffness: 300, damping: 20 });
  });
  it("preserves keyboard focus from the original component", () => {
    render(<TooltipProvider><LocutorCard image="/foto.png" name="Locutor" program="Programa" /></TooltipProvider>);
    expect(screen.getByRole("group")).toHaveAttribute("tabindex", "0");
    expect(captured.focus).toEqual({ scale: 1.18, y: -4, zIndex: 4 });
  });
});
