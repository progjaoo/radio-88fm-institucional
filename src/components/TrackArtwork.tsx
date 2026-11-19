import { useState } from "react";
import radioLogoWhite from "@/assets/logoheadsvg.svg";
import { cn } from "@/lib/utils";
import { isProviderDefaultArtwork } from "@/lib/trackArtwork";

interface TrackArtworkProps {
  src?: string | null;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

interface ArtworkImageProps extends Omit<TrackArtworkProps, "src" | "fallbackSrc"> {
  source: string;
  fallbackSource: string;
  providerFallback: boolean;
}

const ArtworkImage = ({
  source,
  fallbackSource,
  providerFallback,
  alt = "Capa da música atual",
  className,
  imageClassName = "object-cover",
  fallbackClassName = "object-contain p-3",
}: ArtworkImageProps) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [hasFallbackError, setHasFallbackError] = useState(false);
  const useStationLogo = providerFallback || (hasLoadError && (!fallbackSource || hasFallbackError));
  const currentSource = useStationLogo ? radioLogoWhite : hasLoadError ? fallbackSource : source;

  return (
    <img
      src={currentSource}
      alt={useStationLogo ? "Logo Rádio 88 FM" : alt}
      className={cn("h-full w-full", className, useStationLogo ? fallbackClassName : imageClassName)}
      draggable={false}
      onError={() => {
        if (providerFallback || useStationLogo) return;
        if (hasLoadError) setHasFallbackError(true);
        else setHasLoadError(true);
      }}
    />
  );
};

const TrackArtwork = ({ src, fallbackSrc, ...props }: TrackArtworkProps) => {
  const source = src?.trim() ?? "";
  const fallbackSource = fallbackSrc?.trim() ?? "";
  const providerFallback = isProviderDefaultArtwork(source);

  return <ArtworkImage key={`${source}:${fallbackSource}`} source={source} fallbackSource={fallbackSource} providerFallback={providerFallback} {...props} />;
};

export default TrackArtwork;
