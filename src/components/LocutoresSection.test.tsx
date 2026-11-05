import { act, render, screen } from "@testing-library/react";
import LocutoresSection from "./LocutoresSection";

vi.mock("./LocutorCard", () => ({ default: ({ name }: { name: string }) => <div role="group" aria-label={name} /> }));
const locutores = [{ name: "Primeiro", program: "Programa", image: "/foto.png" }, { name: "Segundo", program: "Outro", image: "/foto2.png" }];

describe("Original team geometry in the responsive opening", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
  it("keeps every portrait in order and scales the entire original canvas together", () => {
    let width = 640;
    let measure!: () => void;
    const disconnect = vi.fn();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ width }) as DOMRect);
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { measure = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const { container, unmount } = render(<LocutoresSection locutores={locutores} />);
    const canvas = container.querySelector(".home-team-canvas")!;
    expect(canvas).toHaveStyle({ transform: "scale(0.5)" });
    expect(canvas).toHaveClass("w-[1280px]", "origin-bottom-left");
    expect(canvas.firstElementChild).toHaveClass("overflow-hidden", "-space-x-11");
    expect(screen.getAllByRole("group", { hidden: true }).map(el => el.getAttribute("aria-label"))).toEqual(["Primeiro", "Segundo"]);
    width = 1280;
    act(() => measure());
    expect(canvas).toHaveStyle({ transform: "scale(1)" });
    width = 1800;
    act(() => measure());
    expect(canvas).toHaveStyle({ transform: "scale(1)" });
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
  it("retains the mobile-hidden section and reserved stage", () => {
    const { container } = render(<LocutoresSection locutores={locutores} />);
    expect(screen.getByRole("region", { name: "Equipe da Rádio 88 FM" })).toHaveClass("hidden", "lg:block", "home-team");
    expect(container.querySelector(".home-team-stage")).toBeInTheDocument();
  });
});
