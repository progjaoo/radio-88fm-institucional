import { fireEvent, render, screen } from "@testing-library/react";
import type { FeedIndexPost } from "@/services/feed/feed.types";
import FeedCover from "./FeedCover";

const post: FeedIndexPost = { id: "1", slug: "capa", title: "Acontecimento", excerpt: "Teste", category: { name: "Eventos", slug: "eventos" }, publishedAt: "2026-11-05", cover: { url: "/capa.webp", alt: "Arte da rádio" } };
describe("Feed covers", () => {
  it("preserves legacy landscape artwork without distorting the portrait grid", () => {
    render(<FeedCover post={post} sizes="33vw" />);
    const image = screen.getByRole("img");
    Object.defineProperties(image, { naturalWidth: { value: 1260 }, naturalHeight: { value: 900 } });
    fireEvent.load(image);
    expect(image).toHaveClass("object-contain");
  });
  it("shows a branded fallback after a failed cover and retries a different URL", () => {
    const { rerender } = render(<FeedCover post={post} sizes="33vw" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img", { name: "Arte da rádio" }).tagName).toBe("DIV");
    rerender(<FeedCover post={{ ...post, cover: { ...post.cover, url: "/outra.webp" } }} sizes="33vw" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/outra.webp");
  });
});
