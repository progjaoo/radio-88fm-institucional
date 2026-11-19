# Privacidade, programacao mobile e revisao SEO

Estado: implementacao local para aprovacao em 19/11/2026. Nao publicada.
Branch: `codex/programacao-mobile-privacidade-local`.

## Conferencia pelo responsavel

- Politica: http://127.0.0.1:8086/privacidade
- Programacao: http://127.0.0.1:8086/programacao
- Sitemap local: http://127.0.0.1:8086/sitemap.xml
- Em 390px, deslizar os cards ou usar as setas. Trocar o dia reinicia a lista. No desktop, a grade continua em duas/tres colunas. Sem reproducao automatica e com teclado e movimento reduzido.
- Conferir o link discreto no footer, os 12 assuntos da politica e os botoes de preferencias de metricas. Recusar persiste `denied`, nao volta ao padrao `unknown`.

## Informacoes confirmadas pelo titular

CNPJ 31.232.747/0001-07; contato de privacidade comercial@grupogtf.com.br. A skill Alexa apenas reproduz a transmissao ao vivo. Nao foi fornecida razao social; a pagina usa a marca e o CNPJ, sem inventar razao social ou encarregado.

O paragrafo de publicidade foi limitado a: "A Radio 88 FM veicula comerciais de empresas que pagam para anunciar na radio." A pagina publica usa acentuacao normal.

A politica cobre navegacao/audio, formularios, cadastros, votos/opinioes privadas, identificacao opcional, Alexa, publicidade, cookies/preferencias, terceiros/transferencias, seguranca, conservacao, direitos, menores e contato. Nao afirma que votar equivale a entrar em sorteio ou autorizar marketing. Nao promete prazo de retencao inexistente nem anonimato absoluto.

Antes de publicar, o responsavel deve revisar o texto com assessoria juridica e confirmar a entidade controladora, bases legais por finalidade, regras para menores, prazos efetivos e operacao de atendimento. A entrega tecnica nao constitui certificacao LGPD/Alexa. Nao e necessario enviar documentos ou senhas para avaliar o texto.

## Preferencias de metricas

- Google Analytics agora verifica a preferencia mesmo depois de inicializado; a recusa tambem ativa o mecanismo `ga-disable`.
- Vercel Analytics usa `beforeSend` e consulta a mesma preferencia em cada envio.
- A politica nao afirma que toda medicao depende atualmente de opt-in. O padrao legado permite metricas quando nao existe escolha; `VITE_GA_REQUIRE_CONSENT=true` exige permissao previa para essas duas integracoes. Reativar banner/alterar essa estrategia requer decisao operacional/juridica separada.
- Os controles nao apagam cookies anteriores, nao comandam cookies de terceiros incorporados e nao impedem logs tecnicos necessarios ao funcionamento. Isso e explicado no texto.

## SEO / GEO / AEO: evidencia de codigo

| Item | Estado local / evidencia |
| --- | --- |
| Politica descoberta por navegacao | Link real em `src/components/Footer.tsx`; texto pequeno, alvo minimo 44px |
| Politica indexavel | `src/services/seo/seoConfig.ts`: titulo/descricao especificos e `indexable: true` |
| HTML sem depender de JS | `scripts/prerender.ts`: texto completo de /privacidade no HTML do build |
| Canonical e robots | `SeoHead.tsx`: dominio www.radio88fm.com, index/follow na politica; validacao em scripts/validate-seo.ts |
| Sitemap | Gerado do catalogo canonico; inclui /privacidade, programacao, conteudos, paginas institucionais e artigos publicos do Feed |
| Identidade e semantica | JSON-LD Organization, RadioStation, WebSite, WebPage, Article e BreadcrumbList existentes; logo colorida, endereco e perfis oficiais preservados |
| Leitura por pessoas/buscadores | Um H1, secoes H2, sumario navegavel, texto real, contato e identificacao explicitos |
| Duplicacao | Filtros de Conteudos convergem para a pagina canonica; /debates redireciona para Conteudos |
| Exclusoes intencionais | 404 e URLs funcionais de participacao nao sao paginas editoriais do sitemap; Gestao e dados pessoais nao entram no sitemap publico |

Nao criamos FAQ/schema invisivel, numeros de audiencia inventados, conteudo especial apenas para robos ou promessa de destaque em IA. Segundo o Google, as boas praticas usuais de SEO continuam aplicaveis a AI Overviews/AI Mode; nao existe requisito adicional especifico. Sitemap e indexabilidade nao garantem indexacao nem posicao.

Limites observados: programacao e catalogo YouTube sao atualizados no cliente; o prerender contem o shell/estados iniciais, nao uma copia completa desses catalogos dinamicos. Para indexar cada video como pagina propria, planejar URLs editoriais estaveis com metadados/VideoObject reais e video como conteudo principal; nao declarar isso implementado nesta entrega. Desempenho mobile deve ser acompanhado com dados de campo, nao apenas testes de layout.

## Search Console: leitura em 19/11/2026

Consulta inicial pelo BrowserOS, propriedade `radio88fm.com`. Nenhum pedido de indexacao/validacao foi submetido. A remocao de URLs PHP foi posteriormente autorizada pelo titular e executada conforme registro abaixo.

- Sitemap oficial ja cadastrado com status Success, ultima leitura exibida 16/11/2026, 10 paginas descobertas.
- Relatorio Pages: 7 indexadas; 25 nao indexadas: 8 redirecionamentos, 6 nao encontradas, 6 bloqueadas por 403, 1 noindex, 1 alternativa canonica e 3 descobertas ainda nao indexadas. Esses numeros sao o retrato historico do painel, nao prova de que todas as URLs atuais falham.
- Visao geral: sete URLs mobile com necessidade de melhoria de Core Web Vitals; sete desktop boas. HTTPS: sete, sem URL nao HTTPS no resumo; Breadcrumbs: seis validas, nenhuma invalida.

Prioridade apos aprovacao: investigar exemplos dos 403 e 404, distinguir enderecos legados de rotas publicas ainda relevantes e usar Inspecao de URL/teste ao vivo. Redirecionamentos e alternativas canonicas nao devem virar indexaveis por conveniencia; 404 inexistente nao deve redirecionar em massa para a home. Nao remover protecao do Gestao ou liberar dados privados para resolver um indicador.

## Publicacao futura: ordem

1. Aprovar texto e layout local; confirmar razao social se quiser sua inclusao formal.
2. Executar novamente testes/typecheck/build/SEO com namespace e dados de Feed de producao, sem levar indices QA do Preview. Publicar somente com aprovacao do titular.
3. Conferir HTTP 200 e HTML publico de https://www.radio88fm.com/privacidade sem login, canonical, robots index/follow, footer, dados estruturados e sitemap.
4. No Search Console, conferir/reprocessar https://www.radio88fm.com/sitemap.xml e inspecionar as paginas publicas novas. Solicitar indexacao apenas das URLs finais relevantes; nunca localhost nem Preview.
5. Atualizar a Privacy Policy URL da skill Alexa para https://www.radio88fm.com/privacidade apos confirmar a pagina publicada. Revisar as declaracoes de coleta na skill; esta entrega nao altera o Alexa Developer Console.
6. Acompanhar indexacao, 403/404 e Core Web Vitals. Nao prometer todas as paginas indexadas nem ranking especifico.

## Fontes oficiais

- [Direitos dos titulares, ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).
- [Sitemaps, Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
- [Recursos de IA e o site, Google Search Central](https://developers.google.com/search/docs/appearance/ai-features).
- [Requisitos de URL de privacidade da Alexa, Amazon](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2023/02/certification-requirements-privacy-urls-feb-2023).

### Enderecos legados identificados

O detalhamento dos seis 403 mostra variantes HTTP/HTTPS e www/sem-www de `index.php`, `principal.php` e `fatopopular_principal.php`. A abertura atual de `https://www.radio88fm.com/index.php` retornou 403 no BrowserOS. Por instrucao posterior do titular, os redirects PHP propostos foram substituidos por resposta 410 Gone + X-Robots-Tag noindex para caminhos terminados em .php. Regra local e rewrite Vercel para handler dedicado preparados, sem afetar as rotas atuais. Apos publicar, verificar se alguma camada de firewall ainda bloqueia antes do roteamento; nao desativar protecoes globalmente. Nenhuma configuracao de firewall de producao foi alterada nesta entrega.

### Remocoes PHP autorizadas

Pedidos por prefixo especifico enviados para https://www.radio88fm.com/index.php, /principal.php e /fatopopular_principal.php. O Google informa que cada pedido cobre variantes www/sem-www e HTTP/HTTPS. O ultimo estado observado foi Processing request para os tres, nao remocao concluida. Nunca foi solicitado remover o prefixo raiz do dominio. A ferramenta oculta resultados temporariamente (cerca de seis meses); o 410 no servidor e a ausencia no sitemap sustentam a retirada permanente apos publicar. O historico do relatorio Pages nao e apagado imediatamente. [Referencia oficial](https://support.google.com/webmasters/answer/9689846?hl=en).

O unico noindex do relatorio e /privacidade (corrigido localmente); os tres descobertos ainda nao indexados sao Feed e os dois artigos. Os exemplos 404 incluem politica-de-privacidade.html e players antigos; preparados redirects especificos para /privacidade, /ouvir e /assistir. Regulamento antigo de promocao e noticia sem equivalente continuam 404, sem inventar conteudo ou redirecionar tudo para home.

### QA de interface e Docker

217 testes frontend, 29 testes de servidor, typecheck e build/SEO aprovados. Lint sem erros, com 16 avisos preexistentes. BrowserOS: politica, footer e recusa de metricas conferidos no Docker. Responsividade em iframe real de 390px no servidor temporario do mesmo checkout: sem overflow da pagina, primeiro/ultimo card, setas/contador e reinicio ao trocar de dia conferidos. Corrigida a altura dos tabs quando quebram em duas linhas. Nao equivale a ensaio fisico de gesto em iOS/Android. Artefatos QA temporarios nao devem entrar no release.

### Fechamento da conferencia da grade

Apos login do titular, grade local publicada pela interface na revisao 53 (namespace preview/radio-88). Snapshot publico HTTP 200 com 11 programas/37 horarios e cores publicadas. Na home Docker, Temperatura Gospel apresentou #FFB900 na borda e fundo suave derivado, imagem carregada e altura 370px; logo da radio preservada na barra. Bom Dia 88 publicado com #E73C24. Sem enquete ativa retornada pelos endpoints desses dois programas, sem CTA de participacao. Nao houve criacao de respostas nem alteracao de enquetes/Production. Pendencia anterior da publicacao local resolvida.
