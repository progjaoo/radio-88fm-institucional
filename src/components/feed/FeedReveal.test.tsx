import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import FeedReveal from "./FeedReveal";

const { controls } = vi.hoisted(() => ({ controls: { set: vi.fn(), start: vi.fn(), stop: vi.fn() } }));
vi.mock("framer-motion", async () => {
  const { forwardRef } = await import("react");
  return { useAnimationControls: () => controls, motion: { div: forwardRef<HTMLDivElement, { children: React.ReactNode; className: string }>((props, ref) => <div ref={ref} className={props.className}>{props.children}</div>) } };
});

describe("Progressive Feed reveals", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.clearAllMocks(); });
  it("renders visible editorial content on the server and without observers", () => {
    const html = renderToString(<FeedReveal>Texto indexável</FeedReveal>);
    expect(html).toContain("Texto indexável");
    expect(html).not.toMatch(/opacity|visibility|hidden/);
    render(<FeedReveal>Sem JavaScript de animação</FeedReveal>);
    expect(controls.set).not.toHaveBeenCalled();
  });
  it("does not hide blocks when reduced motion is requested", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 3000 } as DOMRect);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    vi.stubGlobal("IntersectionObserver", vi.fn());
    render(<FeedReveal>Conteúdo sem movimento</FeedReveal>);
    expect(controls.set).not.toHaveBeenCalled();
  });
  it("reveals offscreen content once, immediately exposes keyboard focus, and cleans up", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 3000 } as DOMRect);
    let intersect!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const { unmount } = render(<FeedReveal><a href="/feed">Link editorial</a></FeedReveal>);
    expect(controls.set).toHaveBeenCalledWith({ opacity: 0, y: 16 });
    act(() => intersect([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    act(() => intersect([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(controls.start).toHaveBeenCalledTimes(1);
    act(() => screen.getByRole("link").focus());
    expect(controls.set).toHaveBeenLastCalledWith({ opacity: 1, y: 0 });
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(controls.stop).toHaveBeenCalled();
  });
});
