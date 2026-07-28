import { Helmet } from "react-helmet-async";
import {
  SITE_CONTACT,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SOCIAL_PROFILES,
} from "@/config/site";
import type { RouteSeoConfig } from "@/services/seo/seo.types";
import { buildAbsoluteAssetUrl } from "@/services/seo/url";

type SchemaNode = Record<string, unknown>;

export function buildStructuredDataGraph(route: RouteSeoConfig, canonicalUrl: string) {
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const radioId = `${SITE_ORIGIN}/#radio-station`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const webpageId = `${canonicalUrl}#webpage`;

  const graph: SchemaNode[] = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteAssetUrl("/logo-88fm.png"),
        width: 108,
        height: 108,
      },
      sameAs: SITE_SOCIAL_PROFILES,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_CONTACT.telephone,
        email: SITE_CONTACT.email,
        contactType: "customer service",
        availableLanguage: "Portuguese",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_CONTACT.streetAddress,
        addressLocality: SITE_CONTACT.addressLocality,
        addressRegion: SITE_CONTACT.addressRegion,
        addressCountry: SITE_CONTACT.postalCountry,
      },
    },
    {
      "@type": "RadioStation",
      "@id": radioId,
      name: SITE_NAME,
      url: SITE_ORIGIN,
      broadcastFrequency: "88 FM",
      areaServed: ["Volta Redonda", "Sul Fluminense"],
      parentOrganization: { "@id": organizationId },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_ORIGIN,
      name: SITE_NAME,
      inLanguage: SITE_LANGUAGE,
      publisher: { "@id": organizationId },
    },
    {
      "@type": route.schemaType,
      "@id": webpageId,
      url: canonicalUrl,
      name: route.title,
      description: route.description,
      inLanguage: SITE_LANGUAGE,
      isPartOf: { "@id": websiteId },
      about: { "@id": radioId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: buildAbsoluteAssetUrl(route.imagePath),
      },
    },
  ];

  if (route.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Início",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: route.title.split(" | ")[0],
          item: canonicalUrl,
        },
      ],
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

interface StructuredDataProps {
  route: RouteSeoConfig;
  canonicalUrl: string;
}

const StructuredData = ({ route, canonicalUrl }: StructuredDataProps) => {
  const graph = buildStructuredDataGraph(route, canonicalUrl);
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");

  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
};

export default StructuredData;
