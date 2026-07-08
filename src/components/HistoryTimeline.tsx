import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { LogoHistoricoItem } from "@/data/historicoLogos";

interface HistoryTimelineProps {
  items: LogoHistoricoItem[];
}

const getLogoLabel = (index: number) => `${index + 1}ª logo`;

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api || isPaused || items.length <= 1) return;

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, 4800);

    return () => window.clearInterval(interval);
  }, [api, isPaused, items.length]);

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <Carousel
        opts={{ align: "start", loop: true }}
        setApi={setApi}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
        className="px-2 sm:px-10"
      >
        <CarouselContent className="-ml-5 py-5">
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="basis-[82%] pl-5 sm:basis-[64%] md:basis-1/2 lg:basis-1/3">
              <Card
                tabIndex={0}
                className="group relative overflow-hidden rounded-[28px] border-border bg-white shadow-sm outline-none transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-radio-blue focus-visible:ring-offset-2 motion-reduce:transform-none"
              >
                <span className="absolute left-5 top-5 z-10 rounded-full bg-radio-dark/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {getLogoLabel(index)}
                </span>
                <CardContent className="flex min-h-[240px] items-center justify-center p-8 md:min-h-[300px] md:p-12">
                  <img
                    src={item.logoSrc}
                    alt={item.alt}
                    className="max-h-44 max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 hidden h-10 w-10 border-border bg-white/95 text-radio-dark shadow-md hover:bg-white disabled:opacity-30 sm:flex" />
        <CarouselNext className="right-0 hidden h-10 w-10 border-border bg-white/95 text-radio-dark shadow-md hover:bg-white disabled:opacity-30 sm:flex" />
      </Carousel>
    </div>
  );
};

export default HistoryTimeline;
