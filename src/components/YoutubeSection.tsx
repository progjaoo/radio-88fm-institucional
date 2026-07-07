import { ExternalLink, PlaySquare } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { YoutubeItem, YoutubeVariant } from "@/lib/youtube";
import YoutubeVideoCard from "@/components/YoutubeVideoCard";

interface YoutubeSectionProps {
  videos: YoutubeItem[];
  shorts: YoutubeItem[];
  loading: boolean;
  moreHref: string;
}

interface YoutubeBlockProps {
  title: string;
  items: YoutubeItem[];
  variant: YoutubeVariant;
  loading: boolean;
  withIcon?: boolean;
}

const YoutubeBlock = ({ title, items, variant, loading, withIcon = false }: YoutubeBlockProps) => {
  const emptyMessage = loading ? "Carregando vídeos..." : "Nenhum vídeo disponível no momento.";

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        {withIcon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-radio-red text-white">
            <PlaySquare size={18} />
          </span>
        )}
        <h2 className="font-display text-2xl font-extrabold text-white md:text-3xl">{title}</h2>
      </div>

      {items.length > 0 ? (
        <Carousel opts={{ align: "start", loop: items.length > 1 }} className="mx-auto w-full">
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className={`pl-4 ${variant === "short" ? "basis-[64%] sm:basis-[42%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5" : "basis-full sm:basis-1/2 lg:basis-1/3"}`}
              >
                <YoutubeVideoCard item={item} variant={variant} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden border-none bg-white/90 text-radio-dark shadow-md hover:bg-white sm:flex md:-left-4" />
          <CarouselNext className="right-2 hidden border-none bg-white/90 text-radio-dark shadow-md hover:bg-white sm:flex md:-right-4" />
        </Carousel>
      ) : (
        <div className={`rounded-2xl border border-white/10 bg-white/[0.04] text-center text-white/60 ${variant === "short" ? "py-16" : "py-10"}`}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

const YoutubeSection = ({ videos, shorts, loading, moreHref }: YoutubeSectionProps) => {
  return (
    <section className="py-7 md:py-12">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="space-y-8 rounded-[18px] bg-black px-4 py-6 sm:rounded-[28px] sm:px-6 md:px-8 lg:space-y-10 lg:px-10 lg:py-10">
          <YoutubeBlock title="Vídeos" items={videos} variant="video" loading={loading} />

          <div className="border-t border-white/10" />

          <YoutubeBlock title="Shorts" items={shorts} variant="short" loading={loading} withIcon />

          <a
            href={moreHref}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-radio-red py-2.5 text-center font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 sm:py-3 sm:text-lg sm:tracking-widest"
          >
            Ver mais
            <ExternalLink size={19} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default YoutubeSection;
