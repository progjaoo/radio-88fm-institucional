# Progresso do Institucional - Rádio 88 FM

Registro contínuo solicitado pelo usuário. Atualizar a cada etapa, separando planejamento, implementação, validação e publicação. Não registrar segredos nem declarar integração/deploy sem evidência.

## 18/11/2026 - Capas dos programas e card No Ar

- Ajuste de alinhamento: o card usa as mesmas margens e largura dos blocos adjacentes na Home. A arte ocupa 52% no desktop, define a altura pela proporção 16:9 e encosta na base sem recorte.

- Implementado no Institucional local: card compacto 16:9, cinco cores vinculadas às capas existentes e logo fixa no mini player. BrowserOS confirmou Favorito com imagem 1920 × 1080, borda `#D26F01` e card de 960 px. A geração de cor para novos uploads no Gestão continua pendente.
- A página Programação passou a usar as mesmas abas Radix e o mesmo estilo de Conteúdos. BrowserOS confirmou a troca da grade por clique e por seta + Enter. Typecheck, testes dirigidos e build passaram; sem deploy.
- [Plano 015](plans-ecossistema/plan-015-capas-de-programas-no-ar.md) e [proposta interativa](docs/design/programas-no-ar/proposta.html) preparados para aprovação. O mini player mantém a logo; o card compacto usa o tom da borda da arte, preserva a composição 16:9 e mantém fallback institucional.
- Validação no BrowserOS com as capas reais de Altar 88 e Temperatura Gospel, fallback de Favorito e prévia em 390 px. Nenhuma alteração na Home, no Docker ou na grade.

## 18/11/2026 - Cobertura de capas no player

- [Plano 014](plans-ecossistema/plan-014-cobertura-de-capas-itunes.md): diagnóstico em lote e homologação da estratégia sem exceções por música.
- Benchmark concluído: 33/50 com a busca original e 38/50 após o ajuste. Aumentar para 25 ou 50 resultados não elevou a cobertura. Mantida uma única chamada por faixa; rótulos finais da rádio, convidados confirmados e diferenças de `&/e/é` no título são tratados sem exceções por música.
- Homologado em `8086/ouvir`: 22 testes Node, 207 Vitest, typecheck, lint, build e resolvedor instalado conferidos. O BrowserOS mostrou capa ao vivo com o áudio pausado. Feed, painel, API e banco preservados. Sem deploy.

## 18/11/2026 - Capas de música no Ouvir ao Vivo

- Corrigido o falso negativo de “Eu Cuido de Ti”: `Cancao & Louvor` da VOX é reconhecido como o crédito único `Canção e Louvor` do iTunes. Outros créditos com `&` continuam exigindo os artistas da faixa.
- O player tenta novamente quando o endpoint ainda está na faixa anterior ou falha temporariamente. As tentativas são limitadas e canceladas ao trocar de faixa; a capa antiga nunca é usada para a nova.
- A busca real no iTunes retornou capas para sete faixas conhecidas, e todas as URLs 600×600 responderam HTTP 200. O EP de “Eu Cuido de Ti” usa a mesma imagem conferida na referência. [Diagnóstico e regressões](docs/integrations/music-artwork-recognition-hardening.md).
- Validação: 18 testes Node e 207 Vitest, typecheck, lint dirigido e build Docker passaram. Só o Institucional em `8086` foi atualizado; API, painel, PostgreSQL e release ativo do Feed foram preservados. Retorno local pela tag `radio88-feed-institutional:before-artwork-credit`.
- BrowserOS conferiu o player em pausa e a logo quando não havia faixa identificada. A faixa do print foi conferida no resolver do container com metadado reproduzido e iTunes real, sem alterar a transmissão. Sem deploy em produção.

## 18/11/2026 - Handoff do Institucional no Figma

- Criada a área **88 FM Institucional | Estado atual** na página Principal, sem modificar as telas existentes.
- [Plano 013](plans-ecossistema/plan-013-handoff-figma-institucional.md) executado parcialmente: biblioteca visual editável e masters criados para botões, headers desktop/mobile, player desktop/mobile, card No Ar, filtros, tabs/seletor, estado vazio, redes sociais e rodapé. Tokens de marca também foram incluídos.
- Capturas desktop de Home e Conteúdos estão na seção como referências temporárias (`514:1052` e `513:1052`). O catálogo de Conteúdos mostra o estado real de indisponibilidade, sem vídeos inventados. O BrowserOS confirmou as rotas locais atuais em `http://127.0.0.1:8086/` e `/conteudos`.
- Ainda não é o handoff final: faltam os frames compostos editáveis Home e Conteúdos para desktop e 390 px, a checagem de menu/carrossel mobile e a remoção das capturas de referência. O Figma MCP atingiu o limite de chamadas do plano Starter durante a inspeção; a UI do Figma está autenticada, mas esse limite impede prosseguir por MCP sem liberação/upgrade. As capturas foram preservadas para não apagar a única referência visual antes da substituição.

## 18/11/2026 - Conteúdos em celular

- Abaixo de 640 px, as abas viraram um seletor **Programa**; os seis recentes usam uma faixa horizontal que aceita deslize com o dedo e setas, sem autoplay. Destaque mais compacto. Tablet e desktop mantêm abas e grade.
- Homologação em BrowserOS com amostras isoladas em 390 e 768 px. Lint, typecheck, build e 15 testes dirigidos passaram. A chave e os dados do YouTube não foram alterados; a chave de produção será usada na futura publicação.
- Atualizado somente o Institucional do `radio88-feed` em `8086`, com o mesmo release do Feed. API, painel e PostgreSQL permaneceram saudáveis e não foram reiniciados. A imagem anterior foi preservada na tag `before-conteudos-mobile`.

## 18/11/2026 - Conteúdos no Institucional local

- Proposta implementada em `/conteudos`: novo dropdown no header com as quatro descrições, categorias compactas, busca e datas na URL, destaque, até seis recentes e link para a playlist. A rota legada `/debates` redireciona; Feed, Equipe e player permanecem.
- Conector server-side para as quatro playlists, cache e estados de erro/cobertura parcial. A chave legada retornou `403 ACCESS_DENIED`; o site usa o estado de indisponibilidade, sem conteúdo fictício. Catálogo persistente e validação ao vivo seguem pendentes.
- Docker em `8086`: reconstruído só o Institucional, mantendo o release do Feed, a API, o painel, o banco e o volume do site. Build, typecheck, lint dos arquivos alterados e testes de Conteúdos aprovados. BrowserOS: dropdown real e grade com seis vídeos em 390 px e desktop usando fixture separada. Suíte geral: 200 passaram; um teste de capa do player já falhava antes.
- [Integração](docs/integrations/conteudos-youtube.md) e [base Docker](docs/local-docker-baseline.md) documentadas. Sem deploy.

## 18/11/2026 - Base de homologação local no Docker

- Confirmado o projeto `radio88-feed` como base local: Institucional em `8086`, painel em `5181` e API em `3012`, com os quatro serviços saudáveis.
- Home conferida no BrowserOS e rotas principais e saúde verificadas por HTTP. A proposta Conteúdos não roda nessa imagem; os dois endpoints de YouTube/Debates responderam `404`.
- [Guia da base local](docs/local-docker-baseline.md) registra a imagem, os acessos e os cuidados para reproduzir o Compose e evoluir sem perder dados. Nenhum container ou volume alterado; nenhum deploy.

## 18/11/2026 - Descrições do menu Conteúdos

- Atualizadas as descrições do dropdown da proposta: Debate 88, Altar 88, Encerramento Enquete 88 e Cristo em Nós, conforme os textos fornecidos.
- Mantidos os nomes, ícones, playlists e comportamento de navegação existentes.

## 18/11/2026 - Seis vídeos em cada categoria

- Altar 88, Encerramento Enquete 88 e Cristo em Nós receberam amostras adicionais de suas playlists oficiais. Assim como em Debate 88, cada aba sem filtros tem um destaque e seis cards em “Mais de…”, sem repetir o destaque.
- Se houver filtros, a grade continua limitada a seis correspondências e não inclui vídeos fora da seleção. O link “Ver mais no YouTube” continua apontando à playlist de cada categoria. Datas e métricas são demonstrativas; a integração real não foi alterada.

## 18/11/2026 - Abas de categoria em Conteúdos

- A proposta usa o `Tabs` do shadcn/Radix existente, seguindo o visual segmentado da referência Base UI sem instalar outra biblioteca. Tipografia Archivo, hover azul claro, aba ativa azul com texto branco.
- As abas mantêm a categoria na URL e preservam busca e data ao trocar de programa. Alteração restrita ao protótipo, aguardando aprovação visual.
- Validação: lint e build isolado passaram. No BrowserOS, seta + Enter abriu Altar 88 e atualizou a URL; em 390 px, a página não apresentou rolagem horizontal.
- Refinamento: faixa compactada para 38 px no desktop (abas de 32 px mais a margem interna), com alvos de 44 px no toque. A aba selecionada usa o mesmo token azul de Anuncie e texto escuro para contraste. Apenas o protótipo foi alterado.
- Revisão visual seguinte: texto da aba selecionada em branco, conforme solicitado, preservando o azul de Anuncie e as dimensões compactas.

## 18/11/2026 - Simplificação da vitrine de Conteúdos

**Estado: proposta revisada para aprovação, sem mudanças no institucional funcional.**

- Topo reduzido ao título, com a tipografia de Feed/Debates. Removidos aviso superior, breadcrumb, slogan e descrições redundantes.
- Controles de busca e data sem caixa externa. Selects Radix de Ano/Mês/Dia com ícones Lucide e destaque azul em hover/foco, sem alterar componentes globais.
- Vitrine com seis itens quando disponíveis, sem repetir o destaque; filtros não buscam itens de fora para preencher a grade. O link Ver mais no YouTube leva à playlist da categoria.
- [Scan de interface](docs/design/conteudos/auditoria-visual.md) documentado. BrowserOS verificou seis cards e playlist de Debate 88, hover azul, seleção por teclado e layout de 390 px. Lint e build do protótipo passaram.
- [Plano 012](plans-ecossistema/plan-012-conteudos-youtube.md) atualizado: a vitrine não pagina; o catálogo subjacente permanece completo para consulta quando a integração for implementada.

## 18/11/2026 - Revisão visual de Conteúdos

**Estado: proposta revisada e aberta para aprovação; nenhuma alteração no site funcional.**

- Revisão do protótipo conforme o design institucional: header fixo de 64 px, cores, tipografia, espaçamentos, campos `Input`/`Select` e botões compartilhados. Feed e Equipe permanecem no header.
- Rodapé, redes sociais, WhatsApp e selos de lojas reaproveitados. A representação do mini player usa as classes institucionais sem executar áudio ou consultar a programação.
- Barra de categorias quebra em linhas no celular. Os filtros de data têm rótulos completos e valores padrão curtos; margem lateral no desktop evita colisão com a barra social.
- BrowserOS: hover e escolha de Altar 88 em desktop, escolha do dia 17 após Ano/Mês e troca para Cristo em Nós pelo menu de 390 px. Em 390 px, o documento não excedeu a largura do viewport.
- Lint, build isolado do protótipo e `git diff --check` conferidos. [Proposta](docs/design/conteudos/proposta.html) e [especificação visual](docs/design/conteudos/components.md) atualizadas. Publicação e integração com o YouTube seguem pendentes de aprovação.

## 17/11/2026 - Conteúdos / Plano 012

**Estado: proposta em preparação, aguardando aprovação; não implementado no site funcional.**

- Planejamento criado em [Plano 012](plans-ecossistema/plan-012-conteudos-youtube.md), como evolução do [Plano 011](plans-ecossistema/plan-011-debates-youtube.md).
- Header confirmado: INÍCIO, NOSSA RÁDIO, CONTEÚDOS com dropdown, FEED e EQUIPE. Feed e Equipe não serão removidos. Preservar Anuncie, Ouvir ao Vivo e Assistir.
- Quatro categorias: Debate 88, Altar 88, Encerramento Enquete 88 e Cristo em Nós; busca e filtros por ano/mês/dia.
- BrowserOS confirmou playlists públicas específicas das quatro categorias. Encerramentos podem não mencionar enquete no título; proposta usa associação à playlist, não apenas classificação textual.
- Protótipo isolado: [proposta](docs/design/conteudos/proposta.html), com componentes Radix existentes e dados demonstrativos identificados. Ainda não é uma integração real nem altera Docker/produção.
- Próximo gate: validar o protótipo no BrowserOS e submeter ao usuário; depois do aceite, executar etapas do plano com testes locais.

## Contexto do Plano 011

A página Debates e endpoints server-side foram implementados na etapa anterior, conforme [registro de integração](docs/integrations/debates-youtube.md). Há pendências de credencial no runtime local, catálogo persistente e histórico completo. O protótipo visual não comprova a resolução dessas pendências.

Este arquivo é o índice de evolução deste checkout a partir desta solicitação; os documentos anteriores permanecem preservados.

## 19/11/2026 - Disposicao do card No Ar

- Horario passa a compartilhar a primeira linha com No Ar / Radio 88 FM.
- Nome do programa e apresentadores compartilham a segunda linha em telas largas; apresentadores quebram para linha propria no mobile para preservar legibilidade.
- Altura, capa, cores e botoes de participacao/programacao preservados.
- Cinco testes de integracao Plano 007 aprovados. Atualizacao exclusiva do ambiente local; sem deploy em Producao.

### Refinamento visual do card No Ar

Identidade do programa a esquerda; horario com icone e locutores a direita, separados por linha vertical discreta. No mobile, a divisoria fica horizontal e os blocos se empilham. Mantidas capa, altura e acoes. Cinco testes de integracao aprovados.

- Ajuste fino: colunas do No Ar aproximadas, com menor espacamento e mais area para os locutores; mobile preservado.

- No Ar e nome do programa centralizados na coluna, com deslocamento discreto a direita em desktop; botoes centralizados abaixo.

## 19/11/2026 - Preparacao de release e controle de enquetes

- Branch codex/institucional-conteudos-programacao-20261119 agrupa Conteudos/YouTube, grade/No Ar, participacoes, Anuncie/midia kit, redes sociais e novo mini player/capas iTunes. Rota direta de enquete configurada no Vercel.
- Gestao: acao Retirar do ar, preservando respostas e sem republicacao automatica apos retirada manual; proximas enquetes continuam automaticas. Nenhuma escrita na agenda Google.
- Pendentes: operacao completa dos ouvintes, entrega das participacoes aos locutores, selecao e sorteios; nao estao liberados por esta entrega.
- Logo colorida do mini player gerou favicon PNG 48px/ICO, touch icon 180px e PNG social/Media Session 512px, com URL nova para caches. Google/mensageiros/Vercel podem reter a miniatura antiga ate nova captura.
- Gate: API de Producao ainda retorna 404 para programming/config; nao apontar o institucional oficial para Preview. Publicacao coordenada depende da promocao do Gestao/API e credenciais corretas.
