import imageModalEmpty from "@/assets/image-modal-vazia.svg";
import { cn } from "@/lib/utils";

const CAMPAIGN_ARTWORK_LAYOUT = {
  aspectRatio: 668 / 333,
  title: {
    left: "7%",
    top: "29%",
    width: "46%",
    height: "31%",
  },
  description: {
    left: "8%",
    top: "69%",
    width: "43%",
    height: "21%",
  },
} as const;

export interface CampaignModalArtworkProps {
  title: string;
  description: string;
  className?: string;
}

function CampaignArtworkTitle({ title }: { title: string }) {
  const normalizedTitle = title.trim().replace(/[.!?]+$/, "");
  const anniversaryTitle = normalizedTitle.match(
    /^(.*?)\s+(dos)\s+(32\s+anos\s+da)\s+(.+)$/i,
  );

  if (!anniversaryTitle) {
    return (
      <p className="line-clamp-3 font-display text-[clamp(0.72rem,2.35vw,1.45rem)] font-extrabold uppercase leading-[1.02] text-white">
        {title}
      </p>
    );
  }

  const [, introduction, connector, anniversary, station] = anniversaryTitle;

  return (
    <p className="font-display text-[clamp(0.66rem,2.1vw,1.28rem)] font-medium uppercase leading-[1.08] text-white">
      <span className="block whitespace-nowrap" data-testid="campaign-title-line-1">
        {introduction}
      </span>
      <span className="block whitespace-nowrap" data-testid="campaign-title-line-2">
        {connector} <strong className="font-extrabold">{anniversary}</strong>
      </span>
      <strong
        className="block whitespace-nowrap font-extrabold"
        data-testid="campaign-title-line-3"
      >
        {station}
      </strong>
    </p>
  );
}

export function CampaignModalArtwork({
  title,
  description,
  className,
}: CampaignModalArtworkProps) {
  return (
    <div
      className={cn(
        "relative aspect-[668/333] w-full overflow-hidden bg-[#038CE4]",
        className,
      )}
      data-testid="campaign-modal-artwork"
      style={{ aspectRatio: CAMPAIGN_ARTWORK_LAYOUT.aspectRatio }}
    >
      <img
        src={imageModalEmpty}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-contain"
      />

      <div
        aria-hidden="true"
        className="absolute flex items-center justify-center px-[4%] text-center"
        style={CAMPAIGN_ARTWORK_LAYOUT.title}
      >
        <CampaignArtworkTitle title={title} />
      </div>

      <p
        aria-hidden="true"
        className="absolute line-clamp-3 overflow-hidden text-center text-[clamp(0.55rem,1.45vw,0.88rem)] font-semibold leading-[1.15] text-white"
        data-testid="campaign-artwork-description"
        style={CAMPAIGN_ARTWORK_LAYOUT.description}
      >
        {description}
      </p>
    </div>
  );
}
