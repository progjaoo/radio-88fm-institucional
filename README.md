# Rádio 88 FM Institucional

Stack do projeto: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Vitest
Tipo: WEB

Site institucional da Rádio 88 FM. Consome banners e campanhas públicas da API `GestaoOuvintes`, com imagens servidas pelo Cloudflare R2. Integrações legadas de programação e notícias relacionadas usam a API `PortalGtf` quando necessário.

## Principais Funcionalidades

- Home institucional.
- Hero/carrossel com slide branco fixo e banners publicados pela Gestão de Ouvintes.
- Nossa Rádio.
- Programação.
- Anuncie.
- Ouvir ao vivo.
- Assistir ao vivo.
- Player global.
- WhatsApp flutuante.

## API

Configure:

```env
VITE_DOTNET_URL=http://localhost:5091
VITE_GESTAO_OUVINTES_API_URL=http://localhost:3010
```

Banners ficam habilitados por padrão e são consultados uma vez ao abrir a Home, sem polling. O branco permanece como primeiro slide; banners publicados são acrescentados com a rotação existente. Sem publicações ou em caso de falha da API, fica apenas o branco centralizado e estático, sem banners promocionais locais.

Em produção, configure `VITE_GESTAO_OUVINTES_API_URL=https://gestaoouvintes88fm-api.vercel.app`. Para pausar a integração, use `VITE_INSTITUTIONAL_BANNERS_ENABLED=false`. Para reativar, remova essa variável ou use `true` e gere um novo build.

## Rotas

```text
/
/nossa-radio
/programacao
/anuncie
/ouvir
/assistir
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
```

## Estrutura

```text
src/
├── assets
├── components
├── contexts
├── hooks
├── pages
└── lib
```

## Documentação

- [Documentação central](../docs/README.md)
- [Guia específico do institucional](../docs/radio-88-fm-institucional.md)
- [Deploy](../docs/deploy.md)
