# Rádio 88 FM Institucional

Stack do projeto: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Vitest
Tipo: WEB

Site institucional da Rádio 88 FM. Consome dados da API `PortalGtf` para banners/carrossel, programação e notícias relacionadas.

## Principais Funcionalidades

- Home institucional.
- Hero/carrossel com slide estático e banners do CMS.
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
```

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
