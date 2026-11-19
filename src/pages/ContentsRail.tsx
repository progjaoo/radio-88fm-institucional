import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  videos: { id: string; card: ReactNode }[];
};

export default function ContentsRail({ title, videos }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: videos.length < 2 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const syncEdges = () => {
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setEdges((current) => current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd });
    };
    syncEdges();
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncEdges);
    resize?.observe(el);
    el.addEventListener("scroll", syncEdges, { passive: true });
    return () => {
      resize?.disconnect();
      el.removeEventListener("scroll", syncEdges);
    };
  }, []);

  const step = (direction: -1 | 1) => {
    const el = track.current;
    if (!el || (direction === -1 ? edges.atStart : edges.atEnd)) return;
    const limit = el.scrollWidth - el.clientWidth;
    const items = [...el.children] as HTMLElement[];
    const origin = items[0]?.offsetLeft ?? 0;
    const positions = items.map((item) => Math.min(limit, item.offsetLeft - origin));
    if (direction < 0) positions.reverse();
    const left = positions.find((position) => (position - el.scrollLeft) * direction > 1);
    if (left !== undefined) el.scrollTo({ left });
  };

  return (
    <section className="archive-section" aria-labelledby="contents-archive-title">
      <div className="section-title">
        <h2 id="contents-archive-title">{title}</h2>
        {videos.length > 1 && (
          <div className="archive-controls">
            <Button type="button" size="icon" variant="outline" aria-label="Vídeo anterior" aria-controls="contents-video-list"
              aria-disabled={edges.atStart} onClick={() => step(-1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button type="button" size="icon" variant="outline" aria-label="Próximo vídeo" aria-controls="contents-video-list"
              aria-disabled={edges.atEnd} onClick={() => step(1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <ul ref={track} id="contents-video-list" className="video-grid" data-single={videos.length === 1 ? "" : undefined} role="list">
        {videos.map(({ id, card }) => <li className="video-grid-item" key={id}>{card}</li>)}
      </ul>
    </section>
  );
}
