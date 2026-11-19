# Plano 012 - Conteúdos da Rádio 88 FM

Data: 17/11/2026. Estado em 18/11/2026: proposta visual implementada no Docker local. Conector institucional instalado; validação com o YouTube real e catálogo persistente seguem pendentes. Consulte o [registro do incremento](../docs/integrations/conteudos-youtube.md).

## 1. Objetivo e Limites

Evoluir a página Debates para um acervo único **Conteúdos**, reunindo **Debate 88**, **Altar 88**, **Encerramento Enquete 88** e **Cristo em Nós**, com busca e filtros por ano, mês e dia.

O protótipo isolado em `docs/design/conteudos/` registra a proposta. A versão funcional está em `/conteudos` no Docker local. Nenhuma migração, criação de credencial ou publicação foi realizada.

## 2. Navegação Confirmada

Header desktop: **INÍCIO → NOSSA RÁDIO → CONTEÚDOS ▾ → FEED → EQUIPE**. Feed e Equipe continuam no header, conforme esclarecimento explícito do usuário. Logo e botões **ANUNCIE**, **OUVIR AO VIVO** e **ASSISTIR** são preservados.

Conteúdos abre um painel flutuante com exatamente quatro destinos, nesta ordem:

1. Debate 88.
2. Altar 88.
3. Encerramento Enquete 88.
4. Cristo em Nós.

Usar `NavigationMenu` Radix/shadcn existente, não menu exclusivo de CSS. Abrir por hover no mouse e por clique, Enter ou Espaço. Proposta: atraso de abertura de 150 ms, área de passagem entre gatilho e painel sem lacuna que provoque fechamento, Escape devolve foco. O painel sobrepõe a página sem deslocá-la, não fica sob o header e não cobre o mini player.

No mobile/tablet sem espaço: manter menu recolhível do header; Conteúdos expande os mesmos quatro links por toque. Feed, Equipe e todos os CTAs seguem disponíveis. Não depender de hover, não produzir scroll horizontal no header, manter alvos de pelo menos 44 px.

## 3. Página e Comportamento

- Rota canônica `/conteudos`. Cada destino do dropdown abre a mesma página com `categoria` preenchida: `/conteudos?categoria=altar-88`, por exemplo.
- Acesso geral pela rota `/conteudos`; filtros de categoria na página: Todos os conteúdos, Debate 88, Altar 88, Encerramento de Enquete, Cristo em Nós. A categoria ativa fica evidente. Abaixo de 640 px, o seletor Radix **Programa** substitui as abas, com o mesmo estado na URL.
- Filtros acima do destaque: **Buscar conteúdo**, **Ano**, **Mês**, **Dia**. Reutilizar `Input`, `Select`, `SelectGroup`, `SelectItem` e `SelectTrigger` existentes; nada de select nativo estilizado apenas superficialmente.
- Estado compartilhável na URL: `categoria`, `q`, `ano`, `mes`, `dia`; exemplo `/conteudos?categoria=altar-88&ano=2026&mes=11&dia=17&q=fe`.
- Busca por título/tema e número de edição quando houver, insensível a caixa e acentos. A categoria nunca depende do texto digitado na busca.
- Todos os anos/meses como opção inicial. Dia fica disponível depois de escolher ano e mês; gerar somente dias válidos. Alterar mês/ano invalida e limpa um dia impossível (29/02, 31/04). Informar essa dependência ao usuário.
- Trocar categoria preserva busca e datas; limpar filtros limpa busca/datas e preserva categoria. Mudança dos filtros atualiza a URL sem poluir o histórico a cada tecla.
- Destaque: **Mais assistido na seleção**, calculado por visualizações verificadas dentro dos filtros atuais. Sem filtros de data, considerar todo o catálogo disponível da categoria; não afirmar que é o mais visto da história enquanto o backfill estiver incompleto.
- Abaixo do destaque, mostrar seis conteúdos elegíveis do mais recente ao mais antigo, sem duplicar o destaque. Se os filtros retornarem menos, mostrar apenas o que existe. **Ver mais no YouTube** abre a playlist oficial da categoria, ou as playlists do canal em Todos. Não há paginação na vitrine pública.
- Cards leves: miniatura 16:9, categoria, título, data, duração e visualizações. Nada de accordion ou caixas dentro de caixas. Três colunas em desktop amplo e duas em tablet. Abaixo de 640 px, os recentes ficam em carrossel nativo de toque, sem autoplay, com prévia do próximo card e setas de 44 px acessíveis por teclado. O destaque continua separado, em duas colunas no desktop e empilhado no mobile.
- Estados separados: carregamento, API indisponível com tentar novamente, categoria vazia, filtro sem resultado, vídeo indisponível e catálogo parcial. Nunca substituir falha por números ou vídeos fictícios.
- Preservar Header, Layout, mini player, redes, WhatsApp, Feed, No Ar, enquetes e participações. A seção de vídeos de encerramento não encerra/abre enquetes nem modifica a integração Google Agenda.

## 4. Evidências e Fontes por Categoria

Inspeção pública realizada em 17/11/2026 pelo BrowserOS no canal `@radio88oficial`. Existem playlists/podcasts dedicados; usar seus IDs como configuração explícita, confirmando proprietário via API antes de ativar. A inspeção visual não substitui homologação autenticada do conector.

| Categoria | Playlist observada | ID | Amostra pública observada |
| --- | --- | --- | --- |
| Debate 88 | Debate 88 | `PLWmzVwopd1_UaDR64PfoC7LOvTq0PCwuf` | `rXh6N6r07ng`, edição #104 |
| Altar 88 | Altar 88 | `PLWmzVwopd1_VpfAHf80JhyfQFpex4rwrx` | `_1zHTzpae5c`, Desça a casa do oleiro |
| Encerramento Enquete 88 | Encerramento - Enquete - Bom Dia 88 | `PLWmzVwopd1_WexoQ1Zq5OVX-wEFSvpRTL` | `F1lZ8kA3pdo`, O problema é espiritualizar o que seria prático |
| Cristo em Nós | Cristo em Nós | `PLWmzVwopd1_XoRX--CGuvsEUkXUjFFLBM` | `JhK2LCQ5IN4`, Teologia de John Wesley |

**Decisão recomendada:** playlist é a fonte editorial da categoria; título é dado de busca e, quando aplicável, de número. Encerramentos reais nem sempre contêm “enquete” no título. O classificador numerado do Debate atual não pode ser reaproveitado como filtro obrigatório dos outros programas.

Um vídeo pode pertencer a várias playlists. Persistir vídeo por `videoId` e associações de categoria separadas; em Todos mostrar uma vez, em cada categoria mostrar a associação correspondente. Categorias são allowlist fixa do servidor, nunca playlist arbitrária enviada pelo navegador. Playlists vazias ou removidas geram alerta operacional, não troca automática para uma busca ampla.

Fontes públicas: [Debate 88](https://www.youtube.com/playlist?list=PLWmzVwopd1_UaDR64PfoC7LOvTq0PCwuf), [Altar 88](https://www.youtube.com/playlist?list=PLWmzVwopd1_VpfAHf80JhyfQFpex4rwrx), [Encerramento](https://www.youtube.com/playlist?list=PLWmzVwopd1_WexoQ1Zq5OVX-wEFSvpRTL), [Cristo em Nós](https://www.youtube.com/playlist?list=PLWmzVwopd1_XoRX--CGuvsEUkXUjFFLBM).

## 5. Integração e Evolução do Plano 011

Reutilizar **YouTube Data API v3**, credencial server-only `YOUTUBE_DATA_API_KEY` e player oficial. Nenhuma chave nova é necessária por categoria; a chave existente precisa ser validada para esse runtime. Não usar Analytics/Reporting, OAuth da produção nem credenciais do Calendar.

O código atual (`server/youtube.mjs`) descobre até 500 uploads recentes e classifica somente debates numerados. É uma primeira implementação, não um arquivo histórico completo. Esta evolução recomenda sair dessa descoberta genérica para as quatro playlists conhecidas e concluir catálogo persistente antes de anunciar histórico completo.

Fluxo alvo: playlists permitidas → sincronizador → catálogo persistente do Gestão → endpoint público cacheável → institucional. Não fazer quatro buscas Google por visitante ou ao digitar. Não ampliar varredura síncrona ilimitadamente dentro da função serverless.

- Resolver/validar canal e proprietário de cada playlist; `playlistItems.list` paginado em até 50; consultar `videos.list` em lotes para canal, título, duração, visualizações, privacidade, live e embed.
- Somente vídeos públicos e concluídos. Lives em andamento/agendadas não são replay. Vídeo com embed bloqueado usa link oficial; remoção confirmada retira da vitrine. Uma falha de API não significa exclusão do catálogo.
- Playlist dedicada prevalece; não excluir encerramentos por duração curta nem exigir número de edição. Revisar shorts/teasers inseridos indevidamente, sem supor que todo vídeo curto é inválido.
- Data: `liveStreamingDetails.actualStartTime` quando disponível; caso contrário `snippet.publishedAt`. Gerar data civil em `America/Sao_Paulo`; nunca usar a inclusão na playlist como data do programa. Filtros usam essa data, não a hora/fuso do browser. Publicação atrasada não permite adivinhar data editorial.
- IDs de vídeo únicos, associações idempotentes, backfill por playlist com checkpoint/lock e limite por execução, sincronização incremental proposta a cada 60 min; revalidação diária de status. Cache público de 15 min. Publicação nova pode levar o intervalo de sync mais o cache; não prometer instantaneidade.
- Orçamento por execução e quota compartilhada com Home; single-flight e cache compartilhado no backend, métricas por playlist e último sync. Retenção/revalidação de metadados em até 30 dias, sem armazenar áudio/vídeo.
- Sem trabalho em background após resposta serverless; definir executor autenticado real ou job persistente do Docker. A implantação desse executor não está autorizada nesta proposta.

Contrato alvo: `GET /api/public/video-contents?categoria=...&q=...&ano=...&mes=...&dia=...`. Validar enum, datas e tamanho da busca. Resposta: categorias/anos disponíveis, total filtrado, destaque, até seis itens sem duplicar destaque, playlist oficial, `lastSyncedAt` e estado de cobertura do catálogo. O limite visual não reduz o catálogo consultado pelos filtros. Cache key inclui filtros normalizados; requisições antigas canceladas não sobrescrevem a busca mais recente.

Modelo proposto: `radio_video_content` (vídeo, canal, datas, duração, status e visualizações), `radio_video_content_category` (associação vídeo/categoria/playlist), `radio_video_content_sync` (checkpoint/estado por playlist). Reavaliar antes de qualquer migration: se o catálogo do Plano 011 existir no Gestão, evoluir/reutilizar em vez de criar estrutura paralela. Nenhuma migration foi aplicada ou numerada nesta entrega.

## 6. Compatibilidade e Arquivos

Institucional: `src/components/Header.tsx`, seus testes, `src/pages/Debates.tsx` → página genérica `Contents.tsx`, `src/services/debates.ts` → serviço genérico de conteúdos; `src/App.tsx`, SEO/sitemap/prerender e testes. Reutilizar `NavigationMenu`, `Select`, `Input`, `Pagination`, `Skeleton`, `Button`, áudio e lógica de fachada de vídeo. Não importar um segundo tema ou biblioteca de UI.

Manter `/debates` funcionando, redirecionando para `/conteudos?categoria=debate-88` e preservando filtros reconhecidos. Planejar redirect permanente/SEO também na hospedagem, não só no React; não quebrar URLs compartilhadas nem cache antigo. Manter `/api/debates` temporariamente como adaptador da categoria Debate para consumidores existentes, com depreciação documentada.

Backend institucional atual: `server/youtube.mjs`, `api/debates.js`, `api/youtube/content.js`, servidor local/Compose. Backend Gestão alvo: conferir checkout ativo e documentação antes de listar caminhos concretos de rotas, serviços, schema/migrations e job. Não assumir que esse backend já existe ou editar outro projeto durante a aprovação visual.

Home: preservar o contrato de `/api/youtube/content`; não confundir o acervo Conteúdos com os blocos gerais de vídeos/shorts. Feed e Equipe permanecem no header e nas rotas atuais.

## 7. Etapas Executáveis após Aprovação

1. **Fonte e contrato:** confirmar os quatro proprietários/IDs pela API, amostrar vídeos de cada categoria, revisar o executor e o catálogo existente, fechar contrato/data/filtros. Testar duplicações, títulos sem categoria e playlists removidas. Gate: nenhum encerramento fica dependente da palavra enquete no título.
2. **Catálogo e conector:** modelagem incremental/reutilização no Gestão, importação idempotente e cache; validar em banco descartável/Docker. Gate: cobertura declarada e paginação sem truncamento silencioso; chave fora do bundle/logs.
3. **Interface institucional:** Header com dropdown acessível, página genérica, categorias/datas, destaque, cards e compatibilidade `/debates`. Gate: comportamento aprovado reproduzido sem tocar no áudio até iniciar vídeo.
4. **Regressão local:** testar 320/390/768/1024/1366/1920 px, zoom 200%, mouse, teclado e toque, pause do rádio, fechamento de vídeo, Feed/Equipe/No Ar/enquetes, erro e catálogo parcial. Typecheck, lint, build, testes e BrowserOS no Docker. Não confundir screenshot reduzido com teste de viewport mobile real.
5. **Documentar e pedir aceite:** atualizar `progress.md`, especificação e evidências. Publicação em Preview/Production depende de autorização separada. Recuperação: preservar rota/adaptador antigo e reverter navegação por flag/commit isolado sem apagar o catálogo.

## 8. Critérios de Aceite

- Header contém todos os cinco links; dropdown tem as quatro categorias; não há remoção de Feed/Equipe.
- Menu abre por hover/clique/teclado e toque no mobile; Escape/foco funcionam e passagem do mouse para os links não fecha o painel.
- Fonte por categoria validada; vídeo duplicado nas playlists não duplica em Todos; nenhum número de edição é exigido fora da regra editorial de Debate.
- Filtros combinados por categoria/busca/ano/mês/dia e URL produzem resultados consistentes; dias impossíveis não geram busca ambígua.
- Datas de meia-noite UTC/virada do mês e 29/02 são testadas em São Paulo; destaque considera só os resultados filtrados.
- Navegação entre categorias não perde filtros; a grade renderiza seis itens quando houver mais de seis resultados incluindo o destaque, e o link abre a playlist correta. Apenas um iframe toca; rádio pausa somente ao iniciar vídeo; não retoma sozinho.
- Erro, vazio e catálogo parcial têm mensagens próprias; nada de fake em produção ou divulgação de arquivo completo enquanto incompleto.
- Visual preserva Montserrat/Archivo e a paleta da rádio; selects não sobrepõem rótulos nem invadem campos vizinhos.

## 9. Referências e Aprovação

[YouTube playlistItems.list](https://developers.google.com/youtube/v3/docs/playlistItems/list), [recurso videos](https://developers.google.com/youtube/v3/docs/videos) e [Radix Navigation Menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) consultados no BrowserOS em 17/11/2026.

Protótipo: [proposta visual](../docs/design/conteudos/proposta.html). Especificação: [componentes](../docs/design/conteudos/components.md). Evolução: [progress.md](../progress.md).

**Aprovação solicitada:** disposição da página, ordem dos links e categorias, menu hover/toque, filtros e uso das quatro playlists como fonte editorial. Nenhuma alteração funcional deve ser feita antes desse aceite.
