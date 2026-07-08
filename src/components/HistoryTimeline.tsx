import { useEffect, useState } from "react";
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

const getVersionLabel = (index: number) => `${index + 1}ª versão`;

// Aumente/diminua este valor para controlar a velocidade do carrossel continuo.
// 0.2 = bem lento, 0.35 = recomendado, 0.5 = medio.
const LOGO_CAROUSEL_SPEED = 0.5;

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api || isPaused || items.length <= 1) return;

    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (shouldReduceMotion) return;

    let frame = 0;

    const animate = () => {
      const engine = api.internalEngine();

      engine.location.add(LOGO_CAROUSEL_SPEED);
      engine.target.set(engine.location);
      engine.scrollLooper.loop(-1);
      engine.slideLooper.loop();
      engine.translate.to(engine.location.get());

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [api, isPaused, items.length]);

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <Carousel
        opts={{ align: "start", dragFree: true, loop: true }}
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
              <div
                tabIndex={0}
                className="group relative flex min-h-[240px] items-center justify-center p-6 outline-none transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] focus-visible:-translate-y-2 focus-visible:ring-2 focus-visible:ring-radio-blue focus-visible:ring-offset-2 motion-reduce:transform-none md:min-h-[300px] md:p-10"
              >
                <span className="pointer-events-none absolute left-5 top-5 z-10 inline-flex translate-y-1 items-center gap-2 rounded-full bg-radio-dark/90 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-black opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out before:h-2 before:w-2 before:rounded-full before:bg-radio-blue group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {getVersionLabel(index)}
                </span>
                <img
                  src={item.logoSrc}
                  alt={item.alt}
                  className="max-h-48 max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none md:max-h-56"
                />
              </div>
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
