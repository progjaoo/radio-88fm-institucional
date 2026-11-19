import { fireEvent, render, screen } from "@testing-library/react";
import ContentsRail from "./ContentsRail";

const videos = ["Primeiro", "Segundo", "Terceiro"].map((title, i) => ({
  id: String(i), card: <article>{title}</article>,
}));

it("keeps a single list of videos and navigates the mobile snap positions without looping", () => {
  render(<ContentsRail title="Mais de Altar 88" videos={videos} />);
  const track = screen.getByRole("list");
  Object.defineProperties(track, {
    clientWidth: { value: 358 },
    scrollWidth: { value: 864 },
    scrollTo: { value: vi.fn(({ left }: { left: number }) => {
      track.scrollLeft = left;
      fireEvent.scroll(track);
    }) },
  });
  [...track.children].forEach((item, i) => {
    Object.defineProperty(item, "offsetLeft", { value: i * 292 });
  });
  fireEvent.scroll(track);
  const previous = screen.getByRole("button", { name: "Vídeo anterior" });
  const next = screen.getByRole("button", { name: "Próximo vídeo" });
  expect(previous).toHaveAttribute("aria-disabled", "true");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  fireEvent.click(next);
  expect(track.scrollLeft).toBe(292);
  fireEvent.click(next);
  expect(track.scrollLeft).toBe(506);
  expect(next).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(next);
  expect(track.scrollLeft).toBe(506);
  fireEvent.click(previous);
  expect(track.scrollLeft).toBe(292);
});

it("removes the arrows when a filter leaves only one recent video", () => {
  render(<ContentsRail title="Mais de Altar 88" videos={videos.slice(0, 1)} />);
  expect(screen.getByRole("list")).toHaveAttribute("data-single");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
