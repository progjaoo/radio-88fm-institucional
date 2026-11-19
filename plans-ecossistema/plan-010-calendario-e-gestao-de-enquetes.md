# Plano 010 - Calendario e gestao de enquetes

Data: 17/11/2026. Estado: Etapas 0-3 implementadas localmente; a validacao visual final no BrowserOS aguarda uma sessao autenticada propria. Etapas 4-5 nao iniciadas. Complementa o Plano 009; nao substitui seus gates editoriais, de OAuth ou de publicacao.

## Objetivo

Uma unica area **Enquetes** no Gestao, com **Calendario** para visualizar a pauta e **Gestao** para operar enquetes, votos e mensagens. Reproduzir a organizacao temporal da referencia enviada, nao suas cores laranja nem uma copia integral do Google Agenda. Manter Genesis, dark/light, AppShell e componentes existentes.

Google Agenda continua ferramenta da Producao. O calendario do Gestao e uma projecao dos eventos sincronizados e enquetes locais; nao e um iframe e nao consulta Google pelo navegador. Nao criar, editar ou excluir eventos na agenda da Producao. Permitir criar enquetes diretamente no Gestao, sem dependencia do Google.

## Evidencias e gaps reais

Checkout de implementacao: `/Users/joaomvalente/.codex/worktrees/feed-production-security/gestao`.

| Evidencia | Situacao atual | Mudanca planejada |
|---|---|---|
| `painel-adm/src/pages/PollsPage.tsx` | Catalogo com filtros e tabela, botao Agenda Google; filtro por edicao percorre todas as paginas no cliente | Layout compartilhado e filtros de periodo no servidor |
| `painel-adm/src/pages/CalendarIntegrationPage.tsx` | Conexao, fonte e tabela de previas em secoes separadas | Configuracoes secundarias, calendario operacional como superficie principal |
| `painel-adm/src/pages/PollWorkspacePage.tsx` | Resultados e mensagens dentro da enquete | Preservar workspace e acessos separados |
| `api-ouvintes/src/routes/admin-calendar-oauth.ts` | Status, fontes, programas, sync manual, eventos paginados | Nao usar esse endpoint como calendario sem contrato temporal unificado |
| `painel-adm/src/types/calendar-integration.ts` | Evento staging tem payload validado ou null, motivo e estado; nao fornece envelope temporal seguro para invalidos | Projecao minima para localizar pendencias por data sem expor descricao bruta |
| `api-ouvintes/src/services/calendar-poll-sync.ts` | Leitura privada e staging; nao materializa enquete publica | Vínculo staging-enquete depende do Plano 009, nunca simular enquete publicada |

Consultar `docs/programacao-enquetes/{progresso.md,plano-009-parte-3b.md}`, `docs/frontend-admin.md`, `docs/contribution-guidelines.md`, agentes Frontend Genesis, Integracoes, Identidade/RBAC, DBA e QA. Agentes sao responsabilidades de revisao, nao alegacao de execucao paralela.

## Arquitetura da informacao

```text
Sidebar: Enquetes
  Cabecalho: Enquetes                       [Nova enquete] [Mais acoes]
  Calendario | Gestao
  Programa / origem / estado / busca        ultima sincronizacao + aviso discreto

Calendario:
  < > Hoje   Novembro 2026                 Mes | Semana | Dia | Lista
  grade temporal unica, sem cartao externo envolvendo outro cartao
  evento -> painel lateral com contexto e acoes autorizadas

Gestao:
  uma tabela clara, largura util total, filtros acima, paginacao abaixo
  linha -> workspace da enquete: Visao geral | Resultados | Mensagens

Mais acoes -> Integracao Google / Sincronizar agora (conforme permissao)
```

Rotas propostas: `/enquetes/calendario`, `/enquetes/gestao`; `/enquetes` redireciona para Calendario quando autorizado e para o acesso disponivel quando nao. Preservar `/enquetes/nova`, IDs de workspace e links antigos; reservar rotas estaticas antes de `:pollId`. `/enquetes/integracao` permanece compativel durante a transicao. Estado de data, visualizacao e filtros na URL, para voltar sem perder contexto.

## Disposicao e componentes

- Um PageHeader, uma navegacao local e uma superficie principal. Sem KPI em cards decorativos; resumo opcional em uma linha textual de contagens autorizadas.
- Tabs/links de rota para Calendario e Gestao; ToggleGroup/Select para visualizacao, Button para Hoje e navegacao, Popover para filtros secundarios.
- Table com cabecalho contrastante, pergunta, programa, data/horario, origem, estado editorial e DropdownMenu de acoes. Separadores sutis e altura de linha confortavel; nao colocar cada celula em um card.
- Sheet para detalhe rapido de evento; formulario de criacao/edicao continua em pagina propria com FieldGroup, sem formulario longo dentro de dialog.
- Resultados com barras e totais existentes; mensagens como lista editorial `nome - bairro`, opiniao e horario. Anonimo quando aplicavel; sem aprovacao obrigatoria de participacoes.
- AlertDialog para publicar, encerrar, arquivar ou assumir controle; Sonner para feedback. Sem alert/confirm/prompt nativo.
- Reutilizar tokens Genesis e tipografia atuais. Cores comunicam estado, sempre acompanhadas de texto/icone. Mirtilo pode indicar origem Google, nunca identificar agenda por cor.

## Regras do calendario

1. Mes: domingo a sabado, 7 colunas, semanas necessarias ao mes; hoje com contorno no token primario. Celulas mostram no maximo 3 eventos, depois `+N` abre lista do dia. Nao esconder eventos sem acesso nem contar dados restritos.
2. Semana e Dia: horario local `America/Sao_Paulo`, intervalos sobrepostos lado a lado, cabecalho de dia inteiro separado. Diferenciar data editorial da janela em que a enquete aceita participacoes.
3. Lista: agrupamento por dia com programa, janela e estado. E a visualizacao inicial no mobile; Mes pode ser selecionado, sem comprimir 7 colunas com textos ilegíveis. Em 320 px, controles quebram em linhas, sem overflow global.
4. Evento de dia inteiro importado usa a data como pauta e herda horario da edicao Bom Dia 88 quando valido. Nao abrir enquete por 24h. Janela semiaberta, inicio incluso e fim exclusivo, inclusive madrugada.
5. Manual e Google aparecem juntos com badges de origem. Staging sem enquete vinculada aparece `Importada - aguardando conferencia`, nao `Agendada` nem `No ar`.
6. Deduplicar apenas pelo vinculo persistido de origem. Titulos iguais nao sao identidade; nao juntar manual/importada por heuristica. Evento vinculado aparece uma vez com ambos os estados relevantes.
7. Cancelados continuam consultaveis com filtro; nunca apagar votos/mensagens. Eventos invalidos com data confiavel mostram pendencia no dia; sem data confiavel vao para lista `Sem data`, nao para o dia atual por conveniencia.
8. Sem drag/reschedule de evento Google nesta entrega. Clicar em data permite criar enquete local com data preselecionada, sem gravacao externa. Mudancas em enquetes publicadas seguem regras do Plano 009.
9. Mostrar atualizacao, sincronizando, dados desatualizados e falha sem ocultar dados ja persistidos. Sync manual refaz consulta do calendario; nao prometer atualizacao Google em tempo real.

## Contrato e autorizacao

Propor `GET /api/admin/polls/calendar?from=<ISO>&to=<ISO>&view=month&programId=<UUID>&origin=all&state=...&after=...&limit=...`. Implementar schema estrito: intervalo `[from,to)`, teto 42 dias, limit maximo 200, cursor estavel e ordenacao por inicio+ID. Buscar eventos que intersectam a janela (`start < to && end > from`), nao apenas os que comecam dentro dela. Datas invalidas retornam 400; limites e escopos nao podem ser relaxados pelo cliente.

Resposta proposta: `items`, `nextCursor`, `timezone`, `syncedAt`, `stale`, `counts`. Item: ID opaco, tipo `poll|staged_event`, origem, pergunta/rotulo permitido, programId/programName permitido, data editorial local, inicio/fim opcionais, allDay, estado editorial e estado de importacao separados, capabilities calculadas no servidor e link interno autorizado. Nao enviar tokens, IDs de agenda privada, resposta bruta Google, e-mail de criador, participantes, telefones ou opinioes para a grade.

`poll.read` permite enquetes apenas nos programas autorizados; `calendar_integration.read` permite previas apenas no escopo autorizado. Nenhuma permissao implica a outra. `poll.results.read` e `participation.read` continuam independentes. Contagens, busca, Sheet e URL direta repetem autorizacao por recurso. Modulo Calendario nao concede CRM, exportacao ou publicacao. Se uma pessoa tiver somente resultados/mensagens, preservar acesso direto existente sem liberar catalogo.

Backend agrega projecoes locais, nao faz chamadas Google em cada navegacao de mes. Adicionar envelope temporal minimo de staging somente se o banco atual nao o fornecer de forma segura; migracao incremental seguinte ao ultimo arquivo real, sem editar 0024-0026. Projetar indice por radio/programa/inicio e vinculo externo unico; verificar EXPLAIN com dados representativos antes de escolher indice. Conservar null/data civil para eventos de dia inteiro, nao converter UTC meia-noite por suposicao.

## Dependencias e escolhas

- Fase de calendario pode mostrar staging em modo conferencia antes de materializacao, rotulada corretamente. CTA publico e publicacao automatica dependem explicitamente das fases posteriores do Plano 009.
- Avaliar biblioteca de calendario React acessivel e mantida em spike antes de instalar: compatibilidade React 18/Tailwind 3, licenca, bundle, teclado, pt-BR, fuso e dark mode. Se usar FullCalendar, apenas plugins gratuitos necessarios, sem Scheduler premium; nenhuma dependencia e considerada aprovada/instalada por este plano.
- Nao implementar calendario inteiro artesanalmente sem justificar custo de acessibilidade; nao portar shell/tema/roteador da referencia. API e controles de dominio permanecem do Gestao.
- Horario e origem nao sao dados de autorizacao. Sem escrita bidirecional Google nesta etapa, mesmo se a biblioteca oferecer arrastar/editar.

## Execucao por incrementos

| Etapa | Trabalho e arquivos | Criterio de aceite |
|---|---|---|
| 0 - continuidade | Concluir OAuth/leitura real do 009, documentar ambiente e limites | Concluida: eventos reais da agenda autorizada permanecem somente leitura |
| 1 - prototipo | Wireframe Genesis, navegacao Enquetes, mes/lista e Sheet com fixtures identificadas | Prototipo substituido pela projecao real; validacao visual do usuario ainda pendente |
| 2 - projecao segura | `schemas/poll-calendar.ts`, `services/poll-calendar-staging.ts`, rota e testes; migracao 0029 | Concluida localmente: intervalo, cursor, RBAC e projecao segura testados em PostgreSQL Docker descartavel |
| 3 - calendario | `PollCalendarPage.tsx`, tipos/API, rotas e filtros | Concluida localmente: calendario consome dados reais staged da agenda permitida; sem escrita no Google |
| 4 - gestao enxuta | `PollsPage.tsx`, `CalendarIntegrationPage.tsx`, `PollWorkspacePage.tsx` | Table legivel, filtros compactos, configuracoes secundarias; votos/mensagens preservados |
| 5 - regressao | Testes API/painel, BrowserOS, docs de operacao/progresso | Fluxos manual/importado, estados e RBAC aprovados localmente antes de qualquer deploy |

Ao terminar cada etapa, demonstrar Docker no BrowserOS e pedir aceite antes da seguinte. Este pedido autoriza planejar a reorganizacao; nao implica implementar toda a nova UI imediatamente.

## Validacao e recuperacao

- Mes com 28/29/30/31 dias, anos bissextos, virada de ano, meia-noite, intervalo exclusivo, fuso e consultas rapidas entre meses sem mostrar resposta antiga.
- Sobreposicao, +N, null payload/data, cancelamento, Google indisponivel, cursores repetidos, ressync sem duplicacao e manual com mesmo titulo.
- Usuário sem leitura/sem programa recebe 403 ou 404 apropriado, sem vazamento por contagem/titulo/busca/link ou cache compartilhado. Invalidar consultas na troca de sessao/permissoes.
- 320, 390, 768, 1366 e 1920 px, zoom 200%, dark/light, teclado, foco de retorno do Sheet, reduced-motion, contraste e rotulos acessiveis. Nenhuma acao disponivel apenas por hover/arrastar.
- API typecheck/build/testes; painel lint/build/testes; regressao de programas, enquetes manuais, participacoes e institucional. Registrar skips e falhas preexistentes, sem declarar sucesso nao executado.
- Rollback por feature flag de navegacao para a tabela atual e codigo anterior. Preservar schema aditivo, tokens cifrados, votos, mensagens e proveniencia. Nunca resetar volume nem restaurar banco para desfazer apenas layout.

## Entrega esperada

Calendario e Gestao como duas formas de operar o mesmo dominio, sem menus duplicados e sem caixas dentro de caixas. Producao continua no Google; equipe acompanha pauta, proximas enquetes e resultados no Gestao. Nenhuma promessa de paridade de todos os recursos do Google Calendar.

## Registro de execucao

### Etapa 1 - prototipo visual local (17/11/2026)

- Implementadas as rotas `/enquetes/calendario` e `/enquetes/gestao`, com redirecionamento de `/enquetes` conforme as permissoes existentes. A navegacao interna nao concede permissao nova; calendario e gestao continuam independentes.
- O prototipo do calendario mostra mes e lista, filtros e detalhe lateral com fixtures marcadas como demonstrativas. A visualizacao inicial em viewport mobile usa lista. A criacao iniciada por uma data preenche a data no formulario local, sem salvar automaticamente.
- A integracao existente com Google continua separada e acessivel em Mais acoes conforme permissao. O prototipo nao chama API, nao altera banco e nao escreve, edita ou exclui eventos no Google Calendar.
- Validacao: 50 testes focados aprovados; TypeScript, ESLint e build Vite aprovados. Painel Docker reconstruido e saudavel; API, institucional e PostgreSQL permaneceram saudaveis. BrowserOS confirmou a navegacao e o calendario no endereco local.
- O aceite visual de desktop/mobile/tema escuro ainda depende do usuario. A cobertura mobile do modo lista foi verificada em teste; a verificacao manual de dark mode permanece pendente. Nenhuma etapa posterior foi iniciada.

### Etapas 2-3 - agenda real e correcao de data civil (17/11/2026)

- A tela deixou de usar fixtures e consulta `GET /api/admin/calendar-integrations/calendar`, restrita a agenda configurada `88 - ENQUETE`. O contrato retorna titulo, programa, datas/horarios, estado editorial/importacao e metadados de sincronizacao; nao retorna descricao bruta nem identificador externo do evento.
- A migration aditiva `0029_calendar_event_projection.sql` persiste os metadados sanitizados necessarios para projetar eventos reais, inclusive eventos que aguardam revisao. A revisao do parser faz nova leitura completa sem criar automaticamente enquetes retroativas.
- Correcao do fuso: colunas `DATE` sao serializadas no SQL como texto civil `YYYY-MM-DD`; a UI nao interpreta mais uma data de calendario como instante UTC/local. Cursor e ordenacao continuam usando a data civil explicitamente.
- Validacao: testes unitarios da API (257), integracao da projecao/RBAC/cursor em PostgreSQL Docker descartavel (19), testes do calendario do painel (5), typecheck/build da API, typecheck/lint/build do painel aprovados. API, painel, institucional e PostgreSQL locais estavam saudaveis; migration 0029 aplicada.
- Os dois registros mostrados na captura foram conferidos no banco e mantêm as datas civis da origem: **“TER O DEDO PODRE...” em 16/11** e **“O MUNDO PODE ACABAR...” em 17/11**. A sessao autenticada do calendario no BrowserOS pertence a outro agente; nao foi recarregada. A conferencia visual final deve ocorrer em uma sessao autenticada propria.
- Etapa 4 (gestao enxuta) e Etapa 5 (regressao/aceite completo) continuam pendentes. Nenhum deploy foi realizado e nenhum evento foi alterado no Google Calendar.
