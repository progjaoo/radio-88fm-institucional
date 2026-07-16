import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import YoutubeSection from "./YoutubeSection";
import type { YoutubeItem } from "@/lib/youtube";

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselPrevious: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" aria-label="Mostrar item anterior" {...props} />
  ),
  CarouselNext: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" aria-label="Mostrar próximo item" {...props} />
  ),
}));

const youtubeItem: YoutubeItem = {
  id: "video-1",
  title: "Vídeo da Rádio 88",
  publishedAt: "2026-07-16T12:00:00Z",
  thumbnailUrl: "https://img.youtube.com/vi/video-1/hqdefault.jpg",
  durationSeconds: 90,
  durationLabel: "1:30",
  viewCount: "100",
  viewCountLabel: "100 visualizações",
  relativeTimeLabel: "hoje",
  url: "https://www.youtube.com/watch?v=video-1",
};

describe("YoutubeSection", () => {
  it("shows a functional mobile arrow only for the videos block", () => {
    render(
      <YoutubeSection
        videos={[youtubeItem]}
        shorts={[{ ...youtubeItem, id: "short-1", url: "https://www.youtube.com/shorts/short-1" }]}
        loading={false}
        moreHref="https://www.youtube.com/@radio88oficial"
      />
    );

    expect(screen.getByRole("button", { name: "Mostrar mais vídeos" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mostrar mais Shorts" })).not.toBeInTheDocument();
  });
});
