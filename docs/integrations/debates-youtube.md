# Debates - progresso e decisao de integracao

Atualizado em 17/11/2026. Estado: primeira implementacao institucional concluida localmente; sincronizacao persistente no Gestao e deploy continuam pendentes.

- Plano: [011 - Debates YouTube](../../plans-ecossistema/plan-011-debates-youtube.md).
- API escolhida: YouTube Data API v3, leitura de dados publicos com chave no backend. Analytics e Reporting nao sao necessarias; player iframe oficial para reproducao.
- Institucional: pagina `/debates` integrada ao Layout, link no header, busca sem acentos, filtros shadcn/Radix de ano e mes, destaque por visualizacoes reais e grade responsiva. O accordion foi removido conforme aprovacao posterior.
- Origem proposta: playlist dedicada quando confirmada; alternativa uploads do canal com classificacao por titulo e revisao de ambiguidades. Filtros temporais sobre catalogo local sincronizado, nao chamadas Google a cada visitante.
- Datas agrupadas em America/Sao_Paulo, preferindo inicio real da live para nao repetir o deslocamento observado no calendario do Plano 010.
- Implementado no institucional: GET /api/debates e GET /api/youtube/content fazem chamadas server-side, cache publico por 15 minutos, classificacao por titulo, datas civis em America/Sao_Paulo e contagem real de visualizacoes. A Home foi migrada para o endpoint server-side; VITE_YOUTUBE_API_KEY deixou de ser lida pelo bundle.
- Credencial: configurar YOUTUBE_DATA_API_KEY no ambiente do container/Vercel. O handler aceita temporariamente VITE_YOUTUBE_API_KEY apenas como fallback server-side para compatibilidade, mas a configuracao recomendada e sempre a variavel sem prefixo VITE_. A chave nao e escrita nesta documentacao.
- Fonte provisoria: playlist de uploads do canal @radio88oficial, limitada a 500 uploads recentes por requisicao; o endpoint retorna scannedUploads. Catalogo duravel de todo o historico, sincronizacao incremental/checkpoint, revisao editorial, retencao em banco e worker do Gestao ainda nao foram implementados neste worktree institucional.
- Validacao local: cobertura do classificador, fuso, destaque, cache e endpoint sem credencial nos testes de servidor; testes da tela verificam busca, filtros, player sob demanda e coordenacao com o audio. O preview Docker requer repasse runtime de YOUTUBE_DATA_API_KEY.
- Proximo gate: validar os dados reais e a chave restrita no container radio88-feed; em seguida implementar o catalogo persistente e o sincronizador no Gestao antes de tratar a solucao como arquivo historico completo. Nenhuma credencial foi criada ou alterada, e nenhum deploy foi feito.
