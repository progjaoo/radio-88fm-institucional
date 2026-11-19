# Plano 009 - Enquetes manuais e sincronizacao Google Agenda

Data: 16/11/2026. Status: planejado; nenhuma integracao, credencial, migration ou publicacao executada nesta entrega.

## 1. Objetivo e decisoes

Manter dois caminhos equivalentes para criar enquetes: formulario do Gestao e eventos da agenda privada `88 - ENQUETE` da conta producao88fm@gmail.com. Ambos usam as mesmas entidades, politicas, resultados e publicacao do Plano 007. O institucional nunca consulta Google nem recebe suas credenciais.

Fluxo: Google Agenda -> importador backend -> validacao -> enquete/edicao PostgreSQL -> publicacao do snapshot -> institucional -> votos e mensagens privados no Gestao.

Cadastro manual permanece completo e independente, inclusive com Google desconectado. Integracao unidirecional: nao criar ou editar eventos Google a partir do Gestao nesta fase. Esta decisao reintroduz somente importacao de enquetes, nao o calendario operacional completo abandonado nos planos 011/012 ou a paridade de todos os recursos Google.

## 2. Evidencias e limites do diagnostico

- Plano 007 canonico: `/Users/joaomvalente/Downloads/ECOSSISTEMA - PORTAL/plans-ecossistema/plan-007-programas-no-ar-enquetes-participacoes.md`. Status e jornadas iniciais estao parcialmente desatualizados.
- Codigo Gestao confirmado neste diagnostico: `/Users/joaomvalente/.codex/worktrees/feed-production-security/gestao/`, nao presumir que a antiga linha plan-051 contem as mesmas funcionalidades.
- Reutilizar API `src/routes/admin-polls.ts`, `services/poll-service.ts`, `poll-policy.ts`, `poll-edition.ts`, `public-poll-service.ts`, `public-poll-snapshot.ts`, `programming-resolver.ts` e migrations `database/migrations/0019` a `0023`. Reconfirmar HEAD, numeracao e contratos antes de implementar.
- Institucional: `src/components/OnAirSection.tsx`, `src/services/public-polls.ts`, `src/pages/PollParticipation.tsx`; rota real `/enquetes/:slug`, nao a antiga `/participar/:programSlug` do plano.
- `docs/polls-local-flow.md`: modos vote/message/mixed; mensagens privadas dentro da enquete, sem aprovacao obrigatoria ou bloqueio lexical automatico; identificacao opcional e consentimento sem marketing.
- Snapshot publico local e intake possuem limites de homologacao; existencia em Docker nao comprova rollout serverless pronto. Nao remover guards locais para viabilizar importacao hospedada.
- Imagem da agenda mostra titulo/contexto e evento de dia inteiro, mas nao comprova calendarId, permissoes OAuth, programa-alvo ou alternativas. Cor e nome do evento nao definem programa.

## 3. Agentes e responsabilidade

Usar instrucoes contextualizadas em `worktrees/plan-051-reconstruction/gestao/.agents/` como referencia, adaptadas ao checkout real acima. Arquivos lidos: tech-lead.md, notifications-integrations.md, identity-rbac-security.md; README e Plano 007 orientam papeis complementares.

| Papel | Entrega e limite |
|---|---|
| Tech Lead | Contratos, fronteiras, decisoes e gates; sem merge integral de linhas divergentes |
| Backend Fastify / Integracoes | OAuth, parser, sync idempotente e publicacao; sem jobs apos resposta |
| DBA | Constraints, leases, cursores e migrations incrementais; preservar dados |
| Identidade/RBAC | Escopo por programa, segredos, revogacao e auditoria |
| Frontend Genesis | Controles no workspace Enquetes, Sonner/AlertDialog; sem novo shell |
| QA | Falhas, concorrencia, tempo, regressao manual e demonstracao Docker |
| Documentacao | Evidencias por fase e runbook, sem declarar planejado como implementado |

Selecao documental de responsabilidades; nao declara subagentes executados.

## 4. Contrato editorial

Configuracao por calendarId autorizado: programa padrao por ID, fuso America/Sao_Paulo, modo padrao message, identificacao optional, estrategia de horario pela grade e modo de importacao `review` inicialmente. Nome da agenda e somente rotulo.

| Campo Google | Destino |
|---|---|
| summary | pergunta; slug assistido unico gerado apenas na criacao |
| description | contexto sanitizado, sem HTML ativo e sem bloco de configuracao |
| start.date / end.date | datas locais; end e exclusivo, nao horario de enquete |
| start.dateTime / end.dateTime | intervalo explicito, validado contra edicao da grade |
| id + calendarId | identidade externa unica, nao titulo/data |
| updated/etag/status | deteccao de revisao e cancelamento |

Modelo opcional ao fim da descricao (gramatica restrita, nao executar YAML arbitrario):

```text
[CONFIG ENQUETE 88]
PROGRAMA: Bom Dia 88
TIPO: Voto e mensagem
ALTERNATIVAS:
- Sim, pode haver influencia espiritual.
- Nao, pode ser falta de sabedoria nas escolhas.
[/CONFIG ENQUETE 88]
```

Parser aceita tambem bloco legado final PROGRAMA/TIPO/ALTERNATIVAS quando inequivoco; duplicidade, chaves desconhecidas e blocos incompletos ficam pendentes. Sem IA, inferencia de Sim/Nao ou selecao por cor. Nome de programa deve resolver exatamente um programa ativo autorizado; ambiguidades exigem revisao. Nunca ampliar escopo pelo texto do evento.

Sem alternativas e sem tipo explicito: message. Tipo vote/mixed explicito sem alternativas: pendente, nao degradar silenciosamente. Validar quantidades/comprimentos com schemas existentes, preservar ordem, rejeitar duplicatas normalizadas. Nao importar `(AUDIO)` como arquivo; links/anexos nao sao baixados automaticamente. Arte opcional pelo Gestao; sem arte usar fallback existente.

Evento de dia inteiro: usar a edicao do programa naquela data, nao 24 horas. Multiplos dias ou mais de uma edicao candidata: revisao. Eventos com horario: intervalo deve caber integralmente na edicao; nao truncar silenciosamente. Grade/excecoes sao autoridade; intervalo inclusivo no inicio e exclusivo no fim. Conflitos entre manual/importada para mesmo programa/edicao bloqueiam auto-publicacao, sem prioridade por origem.

## 5. Propriedade e conflitos

- Manual: sem vinculo externo; Google nunca altera ou apaga esse registro.
- Importada/sincronizada: Google controla pergunta/contexto/horario/alternativas antes de publicar. Gestao controla arte, notas internas e dados dos ouvintes; documentar mapa de campos na implementacao.
- Acao `Assumir edicao no Gestao` exige permissao, justificativa e AlertDialog; mantem proveniencia, pausa aplicacao automatica de alteracoes e mostra divergencias posteriores. Nao publicar de volta no Google.
- Slug e ID publico permanecem estaveis. Atualizacao repetida nao cria outra enquete.
- Publicada: pergunta, alternativas, modo, programa e edicao ficam congelados para sync, mesmo sem votos; nova mudanca gera revisao pendente. Apos primeiro voto ou mensagem, jamais reinterpretar respostas existentes. Revisao substantiva aceita gera nova enquete com novo ID e, se necessario, encerra a anterior; nao migrar votos.
- Exclusao/cancelamento confirmado no Google cancela disponibilidade da importada sob controle Google, audita e publica retirada; preserva historico. Item assumido pelo Gestao gera aviso, sem cancelamento automatico. Ausencia numa pagina/filtro nao equivale a exclusao.
- Desconectar Google pausa sync, nao apaga dados e mantem encerramentos programados. Operador pode assumir enquetes. Nao reabrir encerradas numa ressincronizacao.

## 6. Arquitetura, OAuth e executor (ADR proposta)

OAuth Authorization Code no backend; state de uso unico vinculado a sessao e PKCE quando suportado pela biblioteca. Callback fixo permitido, sem open redirect. Token de acesso/refresh criptografado com chave fora do banco e rotacionavel; nunca VITE, logs ou snapshots. Acesso offline para sync; invalid_grant pede reconexao, nao loop infinito. Nao usar senha Gmail nem API key como acesso a agenda privada.

Escopos recomendados: calendar.events.readonly; calendar.calendarlist.readonly apenas se seletor de agendas exigir. O escopo Google nao se limita automaticamente a uma agenda: allowlist de calendarId obrigatoria no backend. Conta autoriza, operador escolhe apenas 88 - ENQUETE; nao importar entrevistas/feriados. Verificar requisitos OAuth, verificacao e expiracao de refresh tokens de app externo em Testing antes do rollout. Service account com compartilhamento explicito da agenda e alternativa a avaliar, nao pressupor delegacao de dominio em conta Gmail.

Local: comando/job de execucao unica no Docker radio88-feed, com fixtures e acionamento manual. Hospedado: scheduler externo autenticado aciona funcao bounded de sync com lease no PostgreSQL, paginas limitadas por execucao e checkpoint retomavel. Meta inicial de acionamento 5 min depende de capacidade/plano de hospedagem aprovado; sem promessa de SLA antes de medir. Proibido setInterval ou background depois da resposta em Vercel. Se plano nao suportar intervalo, contratar scheduler adequado ou aceitar intervalo maior explicitamente.

Importacao nao equivale a publicacao: transacao grava enquete + intencao duravel de publicar. Executor de publicacao usa o mecanismo real de release, retry idempotente e status separado `importada`, `aguardando revisao`, `agendada`, `publicacao pendente`, `disponivel`, `erro`. Horarios futuros entram em snapshot antecipado validado; abrir/encerrar no tempo por politica, nao depender de cron pontual. Intake revalida janela/grade/estado no servidor. Medir cache/CDN da retirada; nenhuma nova participacao apos cancelamento confirmado no banco, mesmo com pagina antiga.

Proposta futura: events.watch HTTPS com validacao do channelId/resourceId/token esperado, dedupe e renovacao antes de expirar. Webhook apenas sinaliza sync; nao contem evento completo, nao substitui reconciliacao periodica. Nao afirmar que headers sao assinatura criptografica Google.

## 7. Sincronizacao confiavel

Listagem inicial paginada com parametros documentados; filtrar eventos elegiveis localmente. Incremental com syncToken: respeitar incompatibilidades de timeMin/timeMax/orderBy, manter parametros consistentes; persistir nextSyncToken somente apos todas as paginas e efeitos duraveis. Nao misturar janela deslizante com cursor incremental. Recorrencias ficam pendentes no primeiro incremento (nao expandir serie infinita); incluir suporte explicito em fase futura.

410: descartar cursor, reconstruir espelho externo sem apagar enquetes/respostas. OAuth revogado ou 403/404 de agenda: desconectada/erro, nunca cancelamento em massa. 429/5xx: backoff com jitter/Retry-After, retry limitado e retomada posterior. Lease com expiracao e fencing/version para impedir executor atrasado gravar sobre run novo. unique(calendarId,eventId,connectionId) e revisao/hash tornam retry idempotente. Re-sync com mesmos dados produz zero criacoes/publicacoes novas. Registrar conflito se edicao local ou grade mudar entre leitura e commit.

## 8. Dados, API e acessos propostos

Reutilizar radio_poll, radio_program_edition, votos/mensagens/perfis e auditoria; nao copiar dominio de ouvintes.

Novas tabelas candidatas: radio_calendar_connection (conta/scopes/token cifrado/status), radio_calendar_source (calendarId, programa, defaults, review/auto, cursores/lease), radio_poll_external_link (pollId, evento, etag/hash, ownership, revisao pendente), radio_calendar_sync_run (status/contadores/erro sanitizado), radio_calendar_publication_job (intencao/version/retry). Reusar outbox existente se confirmada equivalente. FKs UUID/escopo radio, timestamptz, unique de origem e indices status/nextAttemptAt; usar constraints do destino. Payload externo minimo, retencao proposta 30 dias para diagnostico sanitizado e 90 dias para runs; auditoria segue politica atual, confirmar antes de rollout.

Migracoes SQL forward-only pelo npm run db:migrate; numeracao somente apos novo inventario (nao reservar 0024 sem verificar). Backup, teste descartavel e restore comprovado. Nenhuma permissao nova concedida implicitamente a todos os papeis.

Contratos candidatos sob /api/admin/calendar-integrations: conectar/callback/desconectar; listar/configurar fontes; POST /:id/sync; GET /:id/runs; GET /:id/pending; POST /pending/:id/resolve; POST /polls/:id/take-ownership. Job interno autenticado em rota separada, sem token query string. Zod/erros padrao; POST repetivel com idempotency key e alteracoes com expectedVersion/409. Erros 401/403/409/422/429/503 explicitos, sem corpo bruto Google.

Permissoes propostas recurso.acao: calendar_integration.read/manage/sync/review/autopublish; decidir nomes finais pelo catalogo. Sync nao concede publish. Auto-publicacao exige configuracao por administrador autorizado + capacidade efetiva de publicar no programa; revalidar principal de automacao ativo a cada run. Revogacao pausa novos efeitos. Tela, botoes, API e jobs usam mesma politica por programa; controle de fontes nao concede acesso ao CRM ou telefones. Auditoria com ator humano/servico, origem, evento, enquete, versao e decisao, sem tokens nem dados de participantes.

## 9. UX integrada

Workspace Enquetes preservado. Filtro Origem: Todas/Manual/Google Agenda. Badges de origem e estado de sync. Secao Integracao Google Agenda para operadores autorizados: conectar, escolher agenda/programa, defaults, ultima sync, erros e Sincronizar agora. Pendencias em Table e detalhe Sheet com diff antes/depois e motivo; nao multiplicar menus de participacoes. AlertDialog para assumir edicao, cancelar, desconectar e habilitar automatico; Sonner para resultado. Sem alert/confirm JavaScript. Mobile, teclado, foco, loading/vazio/erro e dark/light Genesis preservados.

Institucional mantem CTA PARTICIPE DO PROGRAMA apenas no bloco No Ar para enquete valida do programa atual. Sem mudanca do header/player. Formulario publico e resultados iguais para ambas as origens; nenhuma origem Google deve revelar agenda privada, conta ou descricao bruta.

## 10. Roadmap executavel e gates

| Fase | Tarefas/arquivos candidatos | Aceite antes de continuar |
|---|---|---|
| 0 - contratos | Revisar checkout/007, schemas, publicacao local vs hospedada; fechar defaults/programa e executor | Mapa de campos, politica de conflitos e topologia aprovados; nenhuma credencial requerida |
| 1 - parser | calendar-poll-parser.ts, fixtures HTML/texto e testes; preview sem gravacao | Conversao deterministica, sem inferencias e HTML ativo; usuario valida exemplo real |
| 2 - persistencia | Migrations, vinculos externos, versoes/leases/runs e servico de importacao com fixtures | Banco Docker descartavel: idempotencia, concorrencia, integridade e cadastro manual intacto |
| 3 - Google leitura | Cliente OAuth, fonte allowlist, sync inicial/incremental, erros e job manual | OAuth local com conta autorizada; importar so agenda selecionada em review; sem publicar automaticamente |
| 4 - painel | Filtros/origem, integracao, pendencias/diff e assumir controle | Revisao e publicacao manual ponta a ponta; RBAC negativo e mobile/teclado |
| 5 - automatico local | Intencao duravel de publicar, scheduler simulado, janela e cancelamento | Fixture futura abre/fecha sem clique; resultado/voto/mensagem corretos; falhas recuperadas |
| 6 - homologacao | Scheduler hospedado, segredos, release real, observabilidade/quotas e backup | Preview isolado; sem remover guard local; latencia/custo medidos; aceite expresso antes de producao |
| 7 - opcional | watch/renovacao/reconciliacao; recorrencias apos especificacao propria | Dedupe/reconexao/cancelamento comprovados; nao requisito da primeira entrega |

Cada fase termina com demonstracao no Docker e pergunta de aceite para continuar. Nao cadastrar eventos ou dados reais implicitamente para testar; fixtures identificadas. Sem deploy, migrations ou OAuth nesta entrega documental.

## 11. Matriz minima de testes

- Manual cria/edita/publica/encerra sem Google; importador nunca sobrescreve manual.
- Evento real do exemplo sem alternativas vira message; bloco mixed valido gera opcoes ordenadas.
- Eventos iguais, editados, deletados, cancelados, multipagina, recorrentes e 410 nao duplicam ou apagam votos.
- Dia inteiro, virada de meia-noite, horario limite, excecao da grade, programa inativo, multiplos eventos e edicao ambigua.
- Publicada/primeira participacao concorrente com sync: travas/versionamento impedem mudar significado.
- Fonte sem escopo, ID adulterado, principal revogado, OAuth state invalido/repetido, segredo ausente em logs/browser.
- 429/timeout/5xx apos commit, lease expirada, publicacao falha, retry e ressync: sem duplicar efeitos.
- Snapshot/CDN antigo nao permite envio apos termino; cancelamento interrompe intake; sem PII em release.
- Teste completo: evento fixture -> revisao -> publicar -> Home CTA -> voto/mensagem -> resultado no Gestao; repetir para manual.
- API typecheck/build/testes; painel lint/build/testes; institucional testes/build/SEO e regressao de feed/banners/player. Falhas anteriores registradas sem oculta-las.

## 12. Operacao e recuperacao

Flags separadas importacao/auto-publicacao; auto off por padrao. Desligar auto nao cancela manual ou historico. Se necessario pausar sync e assumir enquetes; preservar prazos. Falha de publicacao fica pendente com retry, nao declara disponivel. Rollback de codigo via compatibilidade de schema; nao editar migration aplicada nem remover tabelas/dados para voltar. Revogar credencial na desconexao conforme capacidade do provedor e eliminar segredo local, preservando auditoria sanitizada.

Monitorar ultimo sucesso/cursor, atraso de evento atualizado, falhas por tipo, conflitos e fila de publicacao. Alerta proposto apos 15 min sem sync bem-sucedida em operacao, a calibrar; nao registrar tokens/titulos/opinioes em metricas. Runbook deve incluir reconexao, invalid_grant, 410, renovacao de canal, troca de programa e redrive de publicacao.

## 13. Decisoes pendentes para execucao

Confirmar calendarId e programa padrao da agenda (nao presumir Bom Dia 88); autorizar projeto OAuth/conta; escolher scheduler conforme hospedagem real; validar template e habilitacao automatica apos piloto. Recomendacoes ja fixadas: manual preservado, review inicial, message sem alternativas, identificacao opcional, grade como limite e sem escrita no Google. Nao impedem iniciar fase 0/1 com fixtures.

## 14. Referencias oficiais verificadas em 16/11/2026

- Eventos: https://developers.google.com/workspace/calendar/api/v3/reference/events
- Listagem e parametros: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
- Sync incremental, paginacao e 410: https://developers.google.com/workspace/calendar/api/guides/sync
- OAuth e scopes: https://developers.google.com/workspace/calendar/api/auth
- Watch, webhook e expiracao: https://developers.google.com/workspace/calendar/api/guides/push

Esta documentacao define trabalho futuro; nao comprova integracao pronta ou autoriza publicar.

## 15. Execucao - parte 1 (16/11/2026)

Inventario/contratos conferidos no checkout feed-production-security/gestao. Parser puro e fixture implementados; 37 novos testes, 75 direcionados e regressao API 244 aprovados/72 skips no Docker sem rede. Typecheck/build aprovados. Demo somente leitura http://127.0.0.1:8095/; nao e nova tela do painel. Evidencias e limitacoes em Gestao `docs/programacao-enquetes/plano-009-parte-1.md`. Cloud Console acessivel em projeto Mosaico Leads Repository: nao alterado, chaves/OAuth nao criados. Fase 1 aguarda aceite; fase 0 tem inventario concluido mas programa/calendarId/projeto/executor reais ainda pendentes. Proximo incremento: fase 2 com fixtures e banco descartavel, somente apos aprovacao. Nenhum dado real, migration, runtime existente, publicacao, commit/push ou deploy alterado. Dependencias existentes apontaram 7 moderadas/3 altas no npm ci, gate de release registrado.

## 16/11/2026 - Plano 009 parte 2a: staging privado e Cloud

Implementadas migration aditiva0024 e persistencia privada de fontes/eventos/execucoes no Gestao feed-production-security. Lease com fencing por ator, idempotencia, cursor explicito, versao, auditoria sem conteudo e RBAC/sessao revalidados no banco. Catalogo sem grants automaticos. Docker PostgreSQL descartavel/rede interna: migrations duas vezes,14integracao+37parser=51aprovados,typecheck/build aprovados; runner versionado. Nao aplicada ao radio88-feed ativo. Fase2 ainda parcial: sem materializacao radio_poll, historico/revisoes ou conflitos editoriais reais.

BrowserOS confirmou agenda privada88-ENQUETE calendarId8h0fgc1thts6ggq0453f561fd0@group.calendar.google.com e eventoDecarabia17/11dia-inteiro semalternativas/programa explicitos. Criado projeto dedicado radio-88-fm-enquetes,CalendarAPI habilitada,clienteOAuthWebDockerLocal e usuario de teste producao88fm@gmail.com. Escopo somenteleitura events.readonly,callbacks127.0.0.1/localhost3012. Segredo600 foraGit,sem tokens emitidos. Nenhuma enquete realimportada/publicada,sem callbackimplementado,scheduler oudeploy. Diario Gestao docs/programacao-enquetes/plano-009-parte-2a.md. Proximoaceite: materializacao segura e conexaoOAuth; confirmarprogramapadrao. Registro anterior de projeto/calendarId pendentes e historico, superado parcialmente por esta verificacao.
