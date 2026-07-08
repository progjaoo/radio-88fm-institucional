import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogoHistoricoItem } from "@/data/historicoLogos";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  items: LogoHistoricoItem[];
}

interface TimelineLogoCardProps {
  item: LogoHistoricoItem;
  index: number;
  revealed: boolean;
  registerRef: (index: number, node: HTMLDivElement | null) => void;
}

const TimelineLogoCard = ({ item, index, revealed, registerRef }: TimelineLogoCardProps) => {
  const isLeft = index % 2 === 1;

  const card = (
    <Card className="group w-full max-w-[340px] border-border bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl motion-reduce:transform-none">
      <CardContent className="flex min-h-[190px] items-center justify-center p-8 md:min-h-[210px] md:p-10">
        <img
          src={item.logoSrc}
          alt={item.alt}
          className="max-h-32 max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
        />
      </CardContent>
    </Card>
  );

  return (
    <div
      ref={(node) => registerRef(index, node)}
      className={cn(
        "group relative grid grid-cols-[32px_1fr] gap-4 pb-10 transition-all duration-700 ease-out last:pb-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 md:grid-cols-[1fr_64px_1fr] md:gap-0 md:pb-14",
        revealed ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      )}
    >
      <div className="relative z-10 flex justify-center md:col-start-2 md:row-start-1">
        <span
          className={cn(
            "mt-[92px] h-5 w-5 rounded-full border-4 border-white shadow-[0_0_0_1px_rgba(4,151,216,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:bg-radio-red md:mt-[94px]",
            revealed ? "scale-110 bg-radio-red" : "bg-radio-blue"
          )}
        />
      </div>

      <div
        className={cn(
          "col-start-2 flex md:row-start-1",
          isLeft ? "md:col-start-1 md:justify-end md:pr-8" : "md:col-start-3 md:justify-start md:pl-8"
        )}
      >
        {card}
      </div>
    </div>
  );
};

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false));

  const registerRef = useCallback((index: number, node: HTMLDivElement | null) => {
    itemRefs.current[index] = node;
  }, []);

  useEffect(() => {
    setRevealed((prev) => (prev.length === items.length ? prev : items.map(() => false)));
  }, [items.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;

    const update = () => {
      // ponto fixo no viewport que a linha e os cards "perseguem" ao rolar
      const anchorY = window.innerHeight * 0.65;
      const containerRect = container.getBoundingClientRect();

      const covered = anchorY - containerRect.top;
      const ratio = containerRect.height > 0 ? covered / containerRect.height : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));

      setRevealed((prev) =>
        prev.map((wasRevealed, index) => {
          if (wasRevealed) return true; // uma vez revelado, não some mais
          const node = itemRefs.current[index];
          if (!node) return wasRevealed;
          const rect = node.getBoundingClientRect();
          return rect.top <= anchorY;
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
    <div ref={containerRef} className="relative mx-auto max-w-[980px]">
      <div className="absolute bottom-0 left-4 top-0 w-[2px] bg-[rgba(4,151,216,0.18)] md:left-1/2 md:-translate-x-1/2" />
      <div
        className="absolute left-4 top-0 w-[2px] origin-top bg-[rgba(4,151,216,0.9)] transition-[height] duration-200 ease-out md:left-1/2 md:-translate-x-1/2"
        style={{ height: `${progress * 100}%` }}
      />
      <div className="relative">
        {items.map((item, index) => (
          <TimelineLogoCard
            key={item.id}
            item={item}
            index={index}
            revealed={revealed[index] ?? false}
            registerRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;