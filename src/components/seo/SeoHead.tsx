import { Helmet } from "react-helmet-async";
import { SITE_LANGUAGE, SITE_LOCALE, SITE_NAME } from "@/config/site";
import type { RouteSeoConfig } from "@/services/seo/seo.types";
import { buildAbsoluteAssetUrl, buildCanonicalUrl } from "@/services/seo/url";
import StructuredData from "./StructuredData";

interface SeoHeadProps {
  config: RouteSeoConfig;
  pathname: string;
}

const SeoHead = ({ config, pathname }: SeoHeadProps) => {
  const canonicalUrl = buildCanonicalUrl(pathname);
  const socialImageUrl = buildAbsoluteAssetUrl(config.imagePath);
  const robots = config.indexable
    ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    : "noindex,follow";

  return (
    <>
      <Helmet>
        <html lang={SITE_LANGUAGE} />
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={SITE_LOCALE} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="108" />
        <meta property="og:image:height" content="108" />
        <meta property="og:image:alt" content={config.imageAlt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content={socialImageUrl} />
        <meta name="twitter:image:alt" content={config.imageAlt} />
      </Helmet>
      <StructuredData route={config} canonicalUrl={canonicalUrl} />
    </>
  );
};

export default SeoHead;
