import { YoutubeItem, YoutubeVariant } from "@/lib/youtube";
import { Analytics } from "@/services/analytics/analytics";

interface YoutubeVideoCardProps {
  item: YoutubeItem;
  variant: YoutubeVariant;
}

const YoutubeVideoCard = ({ item, variant }: YoutubeVideoCardProps) => {
  const isShort = variant === "short";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        Analytics.track(isShort ? "short_open" : "video_open", {
          video_title: item.title,
          video_id: item.id,
          ...(isShort ? {} : { section: "home" }),
        })
      }
      className="group block h-full overflow-hidden rounded-2xl bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
    >
      <div className={`relative overflow-hidden bg-white/10 ${isShort ? "aspect-[9/16]" : "aspect-video"}`}>
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-bold leading-none text-white shadow-sm">
          {item.durationLabel}
        </span>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-display text-sm font-extrabold leading-snug text-white line-clamp-2 transition-colors group-hover:text-radio-yellow md:text-base">
          {item.title}
        </h3>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/60">
          {item.viewCountLabel} • {item.relativeTimeLabel}
        </p>
      </div>
    </a>
  );
};

export default YoutubeVideoCard;
