# Banner principal gerenciavel (Plan 050)

A Home consome o contrato existente de banners do Gestao de Ouvintes.
`isPrimary` e opcional: respostas antigas continuam exibindo o branco primeiro.
Um unico principal elegivel substitui o branco; os demais seguem `order`.
Desmarcar, desativar ou excluir o destaque restaura a abertura branca.

O controle fica no formulario **Banners institucionais > Editar** do painel,
com a opcao **Usar como banner principal**. A API precisa da migration `0013`
e da flag backend `INSTITUTIONAL_PRIMARY_BANNER_ENABLED=true`, habilitada
somente depois da publicacao do leitor R2 preparado.

O institucional nao precisa de flag nova, credenciais R2 nem consulta extra.
A Home consulta a lista uma vez ao montar, sem polling/SSE. Para ver uma
alteracao, recarregar a Home depois de sincronizar o snapshot e propagar o cache.

Arquivos principais:

- `src/services/institutional-banners/heroSlides.ts`: ordenacao e fallback.
- `src/hooks/useInstitutionalBanners.ts`: consulta cancelavel e timeout de 5s.
- `src/pages/Index.tsx`: estado inicial, ciclo do Embla, imagens e acoes.

Na primeira carga, o espaco do hero aguarda a configuracao. Erro/timeout usa
o branco; erro da imagem principal tambem restaura o branco sem mudar a escolha
persistida no painel. A arte usa proporcao natural, `object-contain` e raio de
10px. Um unico destaque nao rotaciona nem mostra setas.

Validacao: suite completa (100 testes), build com prerender/SEO e QA local nos
breakpoints 320/360/390/430/768/1024/1280/1440/1920. A fixture de analytics
explicita seu consentimento; nenhum comportamento de analytics foi alterado.

O typecheck global ainda acusa erros preexistentes em
`ListenerRegistrationModal.tsx` (`getErrorMessage`) e `AudioPlayerContext.tsx`
(`musica`/`cantor` no tipo `StreamData`). O build Vite/prerender e os testes passam.
