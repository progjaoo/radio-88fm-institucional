import { SITE_SOCIAL_IMAGE_ALT, SITE_SOCIAL_IMAGE_PATH } from "@/config/site";
import type { RouteSeoConfig } from "./seo.types";
import { normalizePathname } from "./url";
import feedIndexData from "@/data/feed-index.json";
import type { FeedIndex } from "@/services/feed/feed.types";

const socialImage = {
  imagePath: SITE_SOCIAL_IMAGE_PATH,
  imageAlt: SITE_SOCIAL_IMAGE_ALT,
} as const;

const baseRouteSeoConfigs: RouteSeoConfig[] = [
  {
    path: "/",
    title: "Rádio 88 FM | O Som do Céu em Volta Redonda",
    analyticsTitle: "Home | Rádio 88 FM",
    pageName: "home",
    description:
      "Ouça e assista à Rádio 88 FM ao vivo e conheça nossa história, equipe e programação em Volta Redonda e no Sul Fluminense.",
    indexable: true,
    ...socialImage,
    schemaType: "WebPage",
  },
  {
    path: "/nossa-radio",
    title: "Nossa História | Rádio 88 FM Volta Redonda",
    analyticsTitle: "Nossa Rádio | Rádio 88 FM",
    pageName: "nossa_radio",
    description:
      "Conheça a história da Rádio 88 FM, suas identidades visuais e o legado iniciado em Volta Redonda.",
    indexable: true,
    ...socialImage,
    schemaType: "AboutPage",
  },
  {
    path: "/equipe",
    title: "Equipe e Locutores | Rádio 88 FM",
    analyticsTitle: "Equipe | Rádio 88 FM",
    pageName: "equipe",
    description:
      "Conheça os locutores, comunicadores e profissionais que fazem a programação da Rádio 88 FM.",
    indexable: true,
    ...socialImage,
    schemaType: "AboutPage",
  },
  {
    path: "/programacao",
    title: "Programação da Rádio 88 FM | Horários e Programas",
    analyticsTitle: "Programação | Rádio 88 FM",
    pageName: "programacao",
    description:
      "Confira os horários, programas e apresentadores da programação da Rádio 88 FM em Volta Redonda.",
    indexable: true,
    ...socialImage,
    schemaType: "WebPage",
  },
  {
    path: "/anuncie",
    title: "Anuncie na Rádio 88 FM | Volta Redonda e Região",
    analyticsTitle: "Anuncie | Rádio 88 FM",
    pageName: "anuncie",
    description:
      "Divulgue sua marca na Rádio 88 FM e alcance ouvintes de Volta Redonda e do Sul Fluminense.",
    indexable: true,
    ...socialImage,
    schemaType: "ContactPage",
  },
  {
    path: "/ouvir",
    title: "Ouvir Rádio 88 FM ao Vivo | Som do Céu",
    analyticsTitle: "Ouvir Ao Vivo | Rádio 88 FM",
    pageName: "ouvir_ao_vivo",
    description:
      "Ouça a programação da Rádio 88 FM ao vivo pela internet, direto de Volta Redonda, RJ.",
    indexable: true,
    ...socialImage,
    schemaType: "WebPage",
  },
  {
    path: "/assistir",
    title: "Assistir Rádio 88 FM ao Vivo | Estúdio 88 FM",
    analyticsTitle: "Assistir Ao Vivo | Rádio 88 FM",
    pageName: "assistir_ao_vivo",
    description:
      "Assista à transmissão ao vivo do estúdio da Rádio 88 FM e acompanhe nossa programação.",
    indexable: true,
    ...socialImage,
    schemaType: "WebPage",
  },
  {
    path: "/privacidade",
    title: "Aviso de Privacidade | Rádio 88 FM",
    analyticsTitle: "Privacidade | Rádio 88 FM",
    pageName: "privacidade",
    description: "Consulte como a Rádio 88 FM trata dados pessoais e preferências de privacidade.",
    indexable: false,
    ...socialImage,
    schemaType: "WebPage",
  },
];

const feedIndex = feedIndexData as FeedIndex;
const feedSeoConfigs: RouteSeoConfig[] = [
  {
    path: "/feed",
    title: "Feed | Rádio 88 FM",
    analyticsTitle: "Feed | Rádio 88 FM",
    pageName: "feed",
    description: "Acompanhe festas, bastidores e momentos da Rádio 88 FM.",
    indexable: feedIndex.posts.length > 0,
    ...socialImage,
    schemaType: "WebPage",
  },
  ...Array.from({ length: Math.max(0, Math.ceil(feedIndex.posts.length / 12) - 1) }, (_, index) => {
    const page = index + 2;
    return {
      path: `/feed/pagina/${page}`,
      title: `Feed | Página ${page} | Rádio 88 FM`,
      analyticsTitle: `Feed | Página ${page} | Rádio 88 FM`,
      pageName: "feed",
      description: `Mais momentos e histórias da Rádio 88 FM, página ${page}.`,
      indexable: true,
      ...socialImage,
      schemaType: "WebPage" as const,
    };
  }),
  ...feedIndex.posts.map((post) => ({
    path: `/feed/${post.slug}`,
    title: `${post.title} | Rádio 88 FM`,
    analyticsTitle: `${post.title} | Rádio 88 FM`,
    pageName: "feed_article",
    description: post.excerpt,
    indexable: true,
    imagePath: post.cover.url,
    imageAlt: post.cover.alt,
    schemaType: "Article" as const,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  })),
];

export const routeSeoConfigs: RouteSeoConfig[] = [...baseRouteSeoConfigs, ...feedSeoConfigs];

export const notFoundSeoConfig: RouteSeoConfig = {
  path: "/404",
  title: "Página não encontrada | Rádio 88 FM",
  analyticsTitle: "Página não encontrada | Rádio 88 FM",
  pageName: "not_found",
  description: "A página solicitada não foi encontrada no site da Rádio 88 FM.",
  indexable: false,
  ...socialImage,
  schemaType: "WebPage",
};

const routeSeoMap = new Map(routeSeoConfigs.map((route) => [route.path, route]));

export const INDEXABLE_ROUTE_PATHS = routeSeoConfigs
  .filter((route) => route.indexable)
  .map((route) => route.path);

export function getRouteSeoConfig(pathname: string) {
  return routeSeoMap.get(normalizePathname(pathname)) || notFoundSeoConfig;
}
