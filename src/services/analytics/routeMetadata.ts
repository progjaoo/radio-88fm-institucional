export type RouteMetadata = {
  title: string;
  pageName: string;
  description: string;
};

export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Home | Rádio 88 FM",
    pageName: "home",
    description: "Rádio 88 FM - A rádio que toca o som do céu.",
  },
  "/nossa-radio": {
    title: "Nossa Rádio | Rádio 88 FM",
    pageName: "nossa_radio",
    description: "Conheça a história e o propósito da Rádio 88 FM.",
  },
  "/equipe": {
    title: "Equipe | Rádio 88 FM",
    pageName: "equipe",
    description: "Conheça a equipe da Rádio 88 FM.",
  },
  "/programacao": {
    title: "Programação | Rádio 88 FM",
    pageName: "programacao",
    description: "Confira a programação da Rádio 88 FM.",
  },
  "/anuncie": {
    title: "Anuncie | Rádio 88 FM",
    pageName: "anuncie",
    description: "Anuncie com a Rádio 88 FM e fale com o público certo.",
  },
  "/ouvir": {
    title: "Ouvir Ao Vivo | Rádio 88 FM",
    pageName: "ouvir_ao_vivo",
    description: "Ouça a Rádio 88 FM ao vivo.",
  },
  "/assistir": {
    title: "Assistir Ao Vivo | Rádio 88 FM",
    pageName: "assistir_ao_vivo",
    description: "Assista à Rádio 88 FM ao vivo.",
  },
  "/privacidade": {
    title: "Privacidade | Rádio 88 FM",
    pageName: "privacidade",
    description: "Aviso de privacidade do cadastro de ouvintes da Rádio 88 FM.",
  },
};

export const notFoundMetadata: RouteMetadata = {
  title: "Página não encontrada | Rádio 88 FM",
  pageName: "not_found",
  description: "A página solicitada não foi encontrada.",
};

export function getRouteMetadata(pathname: string) {
  return routeMetadata[pathname] || notFoundMetadata;
}
