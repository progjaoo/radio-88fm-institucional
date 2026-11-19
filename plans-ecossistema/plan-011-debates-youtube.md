# Plano 011 - Debates 88 FM no institucional

Data: 17/11/2026. Estado: proposta aprovada; primeira implementacao institucional local concluida. Numeracao desta pasta, independente dos antigos planos operacionais 011/012 do Gestao.

## Objetivo e decisao de API

Adicionar **DEBATE** ao menu do institucional e a rota `/debates`, com busca por tema/numero, filtros de ano e mes e videos oficiais do canal `@radio88oficial`. Os filtros ficam acima do destaque do debate mais visualizado; os demais resultados aparecem em grade responsiva, sem acordeao. Manter o visual, cores, tipografia, Layout, mini player, redes e responsividade atuais.

Usar somente **YouTube Data API v3** para descobrir/listar videos publicos e consultar seus metadados. YouTube Analytics API e Reporting API atendem metricas e relatorios, nao sao necessarias. A reproducao utiliza o player incorporado oficial; IFrame Player API e opcional, apenas se precisarmos detectar play para coordenar o audio da radio.

Leitura publica usa API key restrita a YouTube Data API v3, guardada no backend, nunca `VITE_*`. Nao exige login YouTube do visitante, OAuth da Producao nem acesso a dados privados. Nao reutilizar o token OAuth do Google Calendar. Nenhuma escrita no canal.

## Evidencias e reutilizacao

- `src/App.tsx`: React Router com Layout compartilhado; adicionar rota sem mexer no fluxo do Plano 007.
- `src/components/Header.tsx`: lista centralizada de links usada no menu; incluir DEBATE e conferir largura do header desktop/mobile.
- `src/pages/Assistir.tsx`: player externo ja pausa radio, mas a nova pagina nao deve pausar radio apenas ao abrir o catalogo. Coordenar somente ao iniciar reproducao escolhida.
- `src/contexts/AudioPlayerContext.tsx`: manter estado de audio compartilhado; sem autoplay nem retomada inesperada ao fechar video.
- `src/services/feed/feed-data.tsx`: evidencia de conteudo publico desacoplado da fonte externa. Reutilizar principio, nao acoplar debates ao schema de noticias.
- `docs/programming-local-validation.md`, `docs/polls-local-flow.md`, `docs/integrations/music-artwork.md`: preservar Docker integrado e regressao de No Ar, participacao e player.
- Gestao: `docs/README.md`, `docs/programacao-enquetes/progresso.md` e Plano 010 documentam Fastify/PostgreSQL, RBAC e sincronizacao local; nao presumir que worker Docker funcione em serverless.
- Nao existe `.agents` neste checkout nem no checkout consultado do Gestao. Usar responsabilidades de Arquitetura, Backend, Frontend, Integracoes, DBA/Seguranca e QA, sem alegar agentes executados ou arquivos existentes.

## Interface proposta

```text
DEBATES 88 FM
Conversas e temas para assistir novamente.

[Buscar por tema ou numero] [Ano v] [Mes v]

DEBATE MAIS VISUALIZADO
[thumbnail 16:9]   #104 - DEBATE 88
                   Tema / data / visualizacoes / Assistir

TODOS OS DEBATES
[cards 16:9 em grade; resultados restantes, sem duplicar o destaque]
```

- Busca por tema/numero, Selects shadcn/Radix de ano e mes, com filtros serializados na URL (por exemplo `?ano=2026&mes=11`).
- O destaque mostra a edicao de maior visualizacao dentro do resultado filtrado; ela nao se repete na grade abaixo. Sem accordion ou dados ficticios no catalogo de producao.
- Cards em grade, com titulos, data civil, visualizacoes verificadas e player, incluindo estados de loading/erro/vazio e feedback no padrao atual. Sem alert/confirm nativo.
- Thumb, numero quando reconhecido, titulo e data; grade de duas colunas no desktop e uma no mobile. Sem caixas dentro de caixas decorativas.
- Nao criar dezenas de iframes no carregamento. Usar fachada com thumbnail, carregar um player por vez apos clique; ao fechar mes/video, destruir player para interromper audio oculto.
- Player responsivo respeitando minimo oficial de 200 x 200 px e proporcao adequada onde houver largura. Link oficial alternativo quando embed indisponivel; nao ocultar controles/marca/publicidade YouTube.

## Descoberta e classificacao sem gargalos

1. Resolver o handle via `channels.list(part=id,contentDetails,forHandle=@radio88oficial)` e persistir o channelId confirmado e uploads playlistId. Nunca supor o ID a partir do handle.
2. Preferencia operacional: playlist publica exclusiva de debates, caso ja exista ou a equipe queira mante-la. Confirmar playlist e propriedade do canal; nao criar automaticamente. Na ausencia dela, usar a playlist de uploads.
3. Ler `playlistItems.list` em paginas de ate 50 com `nextPageToken`; backfill com checkpoint e limite por execucao. Consultar `videos.list` em lotes para validar canal, titulo, datas, disponibilidade, embed, duracao e detalhes de live.
4. Filtrar no backend; `#094 - DEBATE 88` e padrao de titulo, nao garantia de tag `snippet.tags`. Normalizar caixa, espacos, acentos e tipos de traco. Aceitar numero de tamanho variavel e frase DEBATE 88; registrar numero opcional.
5. Excluir falsos positivos como cortes, chamadas, teasers e shorts por regras verificadas em amostra real; casos ambiguos ficam em revisao, nunca inferir apenas pela duracao. Playlist exclusiva pode ser fonte editorial principal, mas disponibilidade/canal continuam validados.
6. `videoId` e identidade unica. Numero do debate nao e chave unica; nao juntar retransmissoes/edicoes so por numero ou titulo. Numeros duplicados sinalizam revisao.
7. Nao usar `search.list` em cada visita ou filtro mensal. Se necessario para diagnostico/backfill limitado, executar somente no backend com orcamento explicito. Nao depender dele como inventario completo.

## Datas e filtro anual/mensal

- Para live concluida, preferir `liveStreamingDetails.actualStartTime`; caso contrario usar `snippet.publishedAt`. Guardar origem da data exibida. `playlistItem.snippet.publishedAt` e inclusao na playlist, nao data do debate.
- Agrupar em `America/Sao_Paulo`, materializando data civil `YYYY-MM-DD`, ano e mes; nao converter data civil para UTC meia-noite. Testar virada de mes/ano e o erro de um dia observado no Plano 010.
- Upload atrasado pode divergir do dia do programa; prever override editorial auditado, claramente identificado como dado local. Data ambigua deve ser conferida, sem inventar uma sexta-feira.
- Primeira entrega: arquivos de debates concluidos. Lives futuras/em andamento nao contam como replay; eventual destaque ao vivo e outro incremento.

## Catalogo, contratos e operacao propostos

- Fonte externa -> sincronizador no backend do Gestao -> catalogo persistente -> endpoint publico cacheavel -> institucional. Visitas nunca acionam chamadas YouTube diretamente.
- Propor entidade `radio_debate_video` com channelId/videoId unico por radio, numero opcional, metadados minimos, datas de origem, data civil editorial, disponibilidade, estado de classificacao e timestamps de verificacao. Separar overrides locais de metadados API. Nao guardar video/audio nem corpo bruto desnecessario.
- Nova migration incremental apos reconferir numeracao atual (0029 e a ultima observada); nunca editar migrations publicadas nem executar migra nesta fase.
- `GET /api/public/debates?year=2026&month=11&after=...&limit=...`: schema estrito, cursor estavel por data+videoId, somente videos elegiveis e DTO publico. Endpoint de resumo retorna anos disponiveis e contagem dos doze meses; consultas locais indexadas por radio/estado/data.
- Administracao minima futura: revisar candidatos, incluir/excluir e corrigir data, sincronizar; chaves propostas `debate.read`, `debate.manage`, `debate.sync`, sem ampliar papeis implicitamente. Sem modulo administrativo grande no primeiro incremento.
- Docker: job persistente ou comando explicito com lock/lease, timeout, backoff e checkpoint. Hospedagem: escolher cron autenticado em lotes ou executor persistente real antes de ativar; nao usar setInterval/background apos resposta de funcao serverless.
- Proposta inicial: detectar novos videos a cada 60 minutos; conferir status/edicoes diariamente; backfill e reconciliacao completa paginados separadamente. Nao parar definitivamente na primeira pagina conhecida: alteracoes antigas exigem reconciliacao.
- `channels.list`, `playlistItems.list` e `videos.list` custam 1 unidade por chamada na documentacao consultada. Orcar paginas/lotes (incluindo todos os uploads, nao apenas quatro debates) e reservar quota compartilhada; conferir limites reais do projeto antes de ativar. Cache publico compartilhado/CDN (proposta 15 min), single-flight/lock e nenhum custo proporcional a visitas.
- Renovar ou remover metadados de API antes de 30 dias conforme politica; prever verificacao incremental de todo acervo. Falhas nao viram exclusao em massa: marcar indisponibilidade apenas em verificacao conclusiva. Nao servir metadados indefinidamente depois do limite de retencao.
- Secret server-only, logs sem key, allowlist de host/canal, validacao de videoId, rate limit nas acoes admin e alerta de quota/atraso. Metricas: ultima sincronizacao, paginas, candidatos, aceitos/revisao, falhas e quota estimada.

## Etapas e aceite

1. **Validacao da fonte:** confirmar channelId, playlist dedicada e amostra de 10-20 debates reais; verificar titulos, cortes, datas e embeds. Definir primeiro ano do backfill. Nao alegar catalogo conferido: nesta etapa documental o canal publico nao disponibilizou metadados suficientes na leitura web.
2. **Conector e catalogo:** credencial no Docker, schema/migration e sync idempotente com checkpoint; testes em PostgreSQL descartavel, duplicacao, revogacao/indisponibilidade, quota e API key nunca no frontend. Demonstrar e pedir aceite.
3. **Pagina institucional:** menu, rota, busca/ano/mes, destaque por visualizacoes, grade e player sob demanda; demonstrar Docker no BrowserOS em desktop/mobile antes de prosseguir.
4. **Operacao/regressao:** logs, revalidacao/retencao, cache compartilhado, executor da hospedagem, rollback por flag e documentacao. Publicacao depende de pedido separado.

Aceite: 0-5+ debates por mes sem truncamento; mesmo video aparece uma vez; datas de live atravessando mes/ano corretas; API indisponivel sem avalanche de retries; titulo ambiguo nao e publicado como debate; removido/privado/embedding bloqueado tem estado apropriado; nenhum iframe oculto tocando; mini player, Feed, No Ar e participacao preservados; teclado, zoom 200% e 320/390/768/1366/1920 px. Typecheck/lint/build/testes dos projetos afetados e validacao local no radio88-feed.

## Fontes oficiais verificadas em 17/11/2026

- [YouTube Data API - autenticacao](https://developers.google.com/youtube/data/guides/authentication)
- [Channels.list - forHandle](https://developers.google.com/youtube/data/reference/rest/v3/channels/list)
- [Uploads do canal](https://developers.google.com/youtube/data/guides/implementation/videos)
- [PlaylistItems.list - paginacao e quota](https://developers.google.com/youtube/data/reference/rest/v3/playlistItems/list)
- [Videos.list](https://developers.google.com/youtube/data/reference/rest/v3/videos/list)
- [Videos - datas e liveStreamingDetails](https://developers.google.com/youtube/data/reference/rest/v3/videos)
- [Player incorporado](https://developers.google.com/youtube/player_parameters)
- [Politicas e retencao de dados](https://developers.google.com/youtube/terms/developer-policies)
- [Analytics e Reporting](https://developers.google.com/youtube/reporting)

## Registro de execucao local - 17/11/2026

- Concluido neste checkout: rota /debates, navegacao no header, filtros de busca/ano/mes, destaque calculado por viewCount, cards responsivos e player oficial carregado sob demanda.
- Concluido neste checkout: endpoints server-side para debates e conteudo YouTube da Home; a chave nao e mais lida pelo codigo do navegador. O ambiente recomendado e YOUTUBE_DATA_API_KEY, sem prefixo VITE_.
- Concluido neste checkout: endpoints tambem foram conectados ao servidor do preview local; Compose repassa a credencial somente como variavel de runtime.
- Limite atual: a leitura direta varre no maximo 500 uploads recentes e usa cache em memoria/CDN de 15 minutos. Nao substitui o catalogo persistente, backfill com checkpoint nem sincronizador autenticado previstos para o Gestao.
- Testes de unidade cobrem classificacao, ordenacao do destaque, cache e agrupamento civil em Sao Paulo; a tela cobre filtros, busca, carregamento do player e pausa do radio.
- Pendente antes de considerar completo: testar com a chave real no container, confirmar a cobertura dos uploads antigos, validar restricoes da chave para uso server-side, implementar sincronizacao persistente no Gestao e concluir regressao desktop/mobile no BrowserOS. Nenhuma chave foi exibida, criada ou modificada; nenhum deploy foi executado.
