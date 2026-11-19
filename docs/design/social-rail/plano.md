# Plano: redes sociais fixas no institucional

Status: implementado localmente em 13/11/2026 apos autorizacao do usuario. Sem publicacao em producao. Especificacao e limites de validacao em components.md.
Referencia: capturas fornecidas da Melodia. Inspecao ao vivo pendente: MCP BrowserOS indisponivel nesta sessao. Nao foi usado outro navegador.

## Direcao

Seguir replica-design para adaptar comportamento, nao copiar os arquivos, cores da emissora ou sua interface. Preservar Montserrat/Archivo, branco, azul Radio 88, raios suaves e sombras discretas. Quatro destinos atuais: Facebook, Instagram, YouTube e TikTok. Nao incluir X, Apple ou Android nesta coluna; lojas ja estao no mini player.

## Componente proposto

- SocialRail, uma unica instancia no Layout global, em todas as rotas, incluindo Feed, artigo, Ouvir, Assistir e 404.
- Coluna direita centralizada, margem desktop 18 px, botao 46 x 46 px, raio 12 px, gap 8 px; mobile 44 x 44 px, margem 8 px.
- Estado normal branco, icones de marca escuros; hover e foco com fundo da rede e simbolo branco, tooltip lateral com nome. Sem aumentar largura da coluna ou deslocar o conteudo.
- Previa usa vetores de marca do Simple Icons por CDN, nao icones genericos nem arquivos copiados da Melodia. Antes de implementar, conferir desenhos, licencas e diretrizes oficiais, e servir SVGs locais revisados, sem dependencia de CDN em runtime.
- Azul Facebook, degrade Instagram, vermelho YouTube e preto TikTok. As cores exatas e eventual versao multicolorida do TikTok dependem da revisao das diretrizes de marca; nao tratar aproximacoes do prototipo como tokens oficiais finais.
- Transicao de 200 ms; sem movimento para prefers-reduced-motion. Touch funciona diretamente sem depender de hover.
- Links com nome acessivel, nova aba e noopener noreferrer; foco visivel. Icones decorativos ocultos do leitor de tela.
- Nao competir com WhatsApp, player ou controles de acessibilidade; definir camada abaixo de dialogs e pausar interacao da coluna quando modal estiver aberto.
- Em telas de pouca altura ou artigo muito estreito, avaliar recolhimento por botao Redes para evitar cobrir texto. Confirmar este comportamento no aceite mobile.

## Etapas depois do aceite

1. Conferir referencia no BrowserOS e fontes oficiais dos vetores.
2. Definir tokens locais e executar verificador de contraste da skill para cada estado (minimo 3:1 para simbolos e 4,5:1 para tooltip).
3. Criar componente e catalogo unico com links atuais; montar apenas no Layout.
4. Testar teclado, touch, foco, links, dialogs, 404, safe area e z-index.
5. Validar em 320, 390, 768, 1024, 1440 e 1920 px, inclusive paisagem e viewport baixo. Confirmar que nenhum conteudo/controle fica coberto.
6. Conferir no Docker radio88-feed antes de qualquer preview ou producao.

Sem mudancas em API, banco, R2 ou regras do Plano 007. Nao remover redes ja existentes no banner/footer nesta tarefa. Nao adicionar scripts de rastreamento das redes.

Artefato: proposta.html. E um prototipo isolado, nao uma rota publica nem componente integrado. Nao foi renderizado/validado em navegador nesta sessao; verificacao de contraste e de fontes oficiais ainda pendente.
