import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogoHistoricoItem } from "@/data/historicoLogos";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  items: LogoHistoricoItem[];
}

interface TimelineLogoCardProps {
  item: LogoHistoricoItem;
  index: number;
}

const TimelineLogoCard = ({ item, index }: TimelineLogoCardProps) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isLeft = index % 2 === 1;

  useEffect(() => {
    const node = itemRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

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
      ref={itemRef}
      className={cn(
        "group relative grid grid-cols-[32px_1fr] gap-4 pb-10 transition-all duration-700 ease-out last:pb-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 md:grid-cols-[1fr_64px_1fr] md:gap-0 md:pb-14",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      )}
      style={{ transitionDelay: `${Math.min(index * 90, 360)}ms` }}
    >
      <div className="relative z-10 flex justify-center md:col-start-2 md:row-start-1">
        <span className="mt-[92px] h-5 w-5 rounded-full border-4 border-white bg-radio-blue shadow-[0_0_0_1px_rgba(4,151,216,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:bg-radio-red md:mt-[94px]" />
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
  return (
    <div className="relative mx-auto max-w-[980px]">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-radio-blue/35 md:left-1/2 md:-translate-x-1/2" />
      <div className="relative">
        {items.map((item, index) => (
          <TimelineLogoCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
