import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogoHistoricoItem } from "@/data/historicoLogos";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  items: LogoHistoricoItem[];
}

interface TimelineLogoCardProps {
  item: LogoHistoricoItem;
  revealed: boolean;
}

const TimelineLogoCard = ({ item, revealed }: TimelineLogoCardProps) => {
  return (
    <div
      className={cn(
        "group relative min-w-[240px] snap-center transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:min-w-[280px] lg:min-w-0",
        revealed ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      )}
    >
      <Card className="group/card w-full border-border bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl motion-reduce:transform-none">
        <CardContent className="flex min-h-[180px] items-center justify-center p-8 md:min-h-[210px] md:p-10">
          <img
            src={item.logoSrc}
            alt={item.alt}
            className="max-h-32 max-w-full object-contain transition-transform duration-300 ease-out group-hover/card:scale-[1.04] motion-reduce:transform-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};

const getThreshold = (index: number, total: number) => {
  if (total <= 1) return 0;
  return index / (total - 1);
};

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    setRevealed((prev) => (prev.length === items.length ? prev : items.map(() => false)));
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;

    const update = () => {
      const anchorY = window.innerHeight * 0.65;
      const containerRect = container.getBoundingClientRect();
      const covered = anchorY - containerRect.top;
      const ratio = containerRect.height > 0 ? covered / containerRect.height : 0;
      const nextProgress = Math.min(1, Math.max(0, ratio));

      setProgress(nextProgress);
      setRevealed((prev) =>
        prev.map((wasRevealed, index) => {
          if (wasRevealed) return true;
          return nextProgress >= getThreshold(index, items.length);
        })
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-[1180px]">
      <div className="overflow-x-auto pb-4 pt-2 [scrollbar-width:thin]">
        <div className="relative grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-5 px-1 pt-16 sm:auto-cols-[minmax(280px,1fr)] lg:grid-flow-row lg:grid-cols-5 lg:gap-6">
          <div className="absolute left-[120px] right-[120px] top-7 h-[2px] bg-[rgba(4,151,216,0.18)] sm:left-[140px] sm:right-[140px] lg:left-[10%] lg:right-[10%]" />
          <div
            className="absolute left-[120px] right-[120px] top-7 h-[2px] origin-left bg-[rgba(4,151,216,0.9)] transition-transform duration-200 ease-out sm:left-[140px] sm:right-[140px] lg:left-[10%] lg:right-[10%]"
            style={{ transform: `scaleX(${progress})` }}
          />

          {items.map((item, index) => {
            const itemRevealed = revealed[index] ?? false;

            return (
              <div key={item.id} className="relative">
                <div className="absolute left-1/2 top-[-46px] z-10 -translate-x-1/2">
                  <span
                    className={cn(
                      "block h-5 w-5 rounded-full border-4 border-white shadow-[0_0_0_1px_rgba(4,151,216,0.35)] transition-all duration-300",
                      itemRevealed ? "scale-110 bg-radio-red" : "bg-radio-blue"
                    )}
                  />
                </div>

                <TimelineLogoCard item={item} revealed={itemRevealed} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryTimeline;
