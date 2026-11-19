# SocialRail: especificacao implementada

- Componente global em Layout, uma instancia por rota; reinicia fechado na navegacao.
- Desktop a partir de 1280 px e altura de 640 px: quatro links verticais, alvo 46 px, raio 12 px, gap 8 px; painel branco com raio 18 px, borda e sombra discreta.
- Abaixo de 1280 px ou 640 px de altura: botao Redes de 48 px acima do WhatsApp, menu recolhido por padrao, links de 44 px. Em pouca altura, fica ao lado do WhatsApp e usa duas colunas; abaixo de 400 px de altura, quatro colunas para reduzir altura.
- Estados dos links: normal escuro/branco; hover e foco com fundo da marca e simbolo branco; tooltip lateral. Nao ha estados de loading/erro porque os vetores sao locais e os links nao fazem fetch.
- Foco visivel de 3 px em azul escuro; Tab/Shift+Tab normais; Escape fecha e devolve foco ao botao; sair do componente ou clicar fora fecha. Toque nao depende de hover.
- Modais Radix e dialogs nativos abertos ocultam a coluna. Z-index 30, abaixo do player/WhatsApp e dos dialogs. Impressao omite o componente.
- Movimento reduzido remove transicoes e deslocamento. Forced colors preserva icones na cor LinkText.
- Catalogo do componente em src/config/social-links.ts. Destinos preservados do banner; nao ha novos scripts de tracking ou redes incorporadas.
- Cores definidas em SocialRail.css, com equivalencias em tokens.json; contrato de contraste em contraste.txt. Cor de marca sobre branco e medida como UI, nao como texto pequeno; textos de tooltip usam par proprio de contraste.

## Validacao

17/17 testes direcionados: quatro SocialRail, dez MiniPlayer, tres integracao Plano 007. Typecheck e ESLint aprovados. Contraste: nove pares, zero falhas AA.

Container institucional-1 do projeto radio88-feed reconstruido e iniciado em 13/11/2026. Build completo com prerender e validacao SEO aprovado. Conferencia HTTP do HTML de /, /feed, /nossa-radio, /equipe, /anuncie, /ouvir, /assistir e rota inexistente: exatamente uma coluna e quatro redes em cada resposta; rota inexistente manteve status 404. Suite completa: 174/175, com a falha preexistente em seoConfig.test.ts:34, sem alteracao nesta tarefa.

Limitacao: MCP BrowserOS indisponivel na sessao. Nao foi utilizado outro navegador como substituto. Permanecem pendentes QA visual de hover, matriz de larguras/alturas, modais reais, teclado em navegador e dispositivos fisicos. A leitura do site Melodia ao vivo tambem nao foi realizada; a adaptacao se baseia nas capturas enviadas.

Sem deploy, alteracao de banco/API ou modificacao dos botoes sociais existentes no banner/footer.
