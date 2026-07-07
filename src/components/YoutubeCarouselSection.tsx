import { ExternalLink } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { YoutubeItem, YoutubeVariant } from "@/lib/youtube";
import YoutubeVideoCard from "@/components/YoutubeVideoCard";

// Deprecated: substituído por YoutubeSection no plan-002. Mantido para rollback do plan-001.
interface YoutubeCarouselSectionProps {
  title: string;
  items: YoutubeItem[];
  variant: YoutubeVariant;
  loading: boolean;
  moreHref: string;
  muted?: boolean;
}

const YoutubeCarouselSection = ({ title, items, variant, loading, moreHref, muted = false }: YoutubeCarouselSectionProps) => {
  const emptyMessage = loading ? "Carregando vídeos..." : "Nenhum vídeo disponível no momento.";

  return (
    <section className={`py-10 ${muted ? "bg-muted" : ""}`}>
      <div className="container">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-radio-blue" />
          <h2 className="font-display text-2xl font-extrabold uppercase text-foreground">{title}</h2>
        </div>

        {items.length > 0 ? (
          <Carousel
            opts={{ align: "start", loop: items.length > 1 }}
            className="mx-auto w-full"
          >
            <CarouselContent className="-ml-4">
              {items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className={`pl-4 ${variant === "short" ? "basis-[72%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5" : "basis-full sm:basis-1/2 lg:basis-1/3"}`}
                >
                  <YoutubeVideoCard item={item} variant={variant} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 border-none bg-white/90 text-radio-dark shadow-md hover:bg-white md:-left-4" />
            <CarouselNext className="right-2 border-none bg-white/90 text-radio-dark shadow-md hover:bg-white md:-right-4" />
          </Carousel>
        ) : (
          <div className={`text-center text-muted-foreground ${variant === "short" ? "py-16" : "py-10"}`}>
            {emptyMessage}
          </div>
        )}

        <div className="mx-auto mt-8 max-w-lg">
          <a
            href={moreHref}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-radio-blue py-2 text-center font-display text-lg font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            Ver mais
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default YoutubeCarouselSection;
