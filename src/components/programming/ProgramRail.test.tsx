import { fireEvent, render, screen } from "@testing-library/react";
import ProgramRail from "./ProgramRail";

const cards = ["Fato Popular", "Bom Dia 88", "Altar 88"].map((title, index) => ({ id: String(index), content: <article>{title}</article> }));

it("navigates snap positions with arrows and keyboard without looping", () => {
  render(<ProgramRail day="Segunda" cards={cards} />);
  const track = screen.getByRole("list", { name: "Lista de programas de Segunda" });
  Object.defineProperties(track, {
    clientWidth: { value: 358 }, scrollWidth: { value: 1026 },
    scrollTo: { value: vi.fn(({ left }: { left: number }) => { track.scrollLeft = left; fireEvent.scroll(track); }) },
  });
  [...track.children].forEach((child, index) => Object.defineProperty(child, "offsetLeft", { value: index * 350 }));
  fireEvent.scroll(track);
  const previous = screen.getByRole("button", { name: "Programa anterior" });
  const next = screen.getByRole("button", { name: "Próximo programa" });
  expect(previous).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(next);
  expect(track.scrollLeft).toBe(350);
  expect(screen.getByText("2 de 3")).toBeInTheDocument();
  fireEvent.keyDown(track, { key: "ArrowRight" });
  expect(track.scrollLeft).toBe(668);
  expect(next).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(next);
  expect(track.scrollLeft).toBe(668);
  fireEvent.keyDown(track, { key: "ArrowLeft" });
  expect(track.scrollLeft).toBe(350);
});

it("shows a single program without unnecessary controls", () => {
  render(<ProgramRail day="Domingo" cards={cards.slice(0, 1)} />);
  expect(screen.getByRole("list")).toHaveAttribute("data-single");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
