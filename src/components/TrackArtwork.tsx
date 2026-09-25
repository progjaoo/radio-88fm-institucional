import { useState } from "react";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { cn } from "@/lib/utils";
import { isProviderDefaultArtwork } from "@/lib/trackArtwork";

interface TrackArtworkProps {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

interface ArtworkImageProps extends Omit<TrackArtworkProps, "src"> {
  source: string;
  providerFallback: boolean;
}

const ArtworkImage = ({
  source,
  providerFallback,
  alt = "Capa da música atual",
  className,
  imageClassName = "object-cover",
  fallbackClassName = "object-contain p-3",
}: ArtworkImageProps) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  const showingFallback = providerFallback || hasLoadError;

  return (
    <img
      src={showingFallback ? radioLogoWhite : source}
      alt={showingFallback ? "Logo Rádio 88 FM" : alt}
      className={cn("h-full w-full", className, showingFallback ? fallbackClassName : imageClassName)}
      draggable={false}
      onError={() => {
        if (!showingFallback) setHasLoadError(true);
      }}
    />
  );
};

const TrackArtwork = ({ src, ...props }: TrackArtworkProps) => {
  const source = src?.trim() ?? "";
  const providerFallback = isProviderDefaultArtwork(source);

  return <ArtworkImage key={source} source={source} providerFallback={providerFallback} {...props} />;
};

export default TrackArtwork;
