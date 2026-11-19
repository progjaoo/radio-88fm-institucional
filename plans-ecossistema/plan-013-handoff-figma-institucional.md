# Plano 013 - Institucional editável no Figma

Destino: [88FM SITE / Principal / 88 FM Institucional | Estado atual](https://www.figma.com/design/lKtzydgUN1xZSMK2nxr6Rd/88FM-SITE?node-id=511-1052). Área reservada em 18/11/2026, sem modificar as telas anteriores.

## Estado da execução em 18/11/2026

**Parcial; primeiro lote visual ainda não está pronto para aceite.** Foram criados na seção reservada uma biblioteca visual editável e masters de componentes para cores, botões, cabeçalho desktop/mobile, player, card No Ar, filtros, navegação de Conteúdos, estado vazio, redes sociais e rodapé. Também foram feitas capturas de referência desktop de Home e Conteúdos. As capturas não substituem as telas compostas com instâncias.

O Figma MCP informou que o limite de chamadas do plano Starter foi atingido durante a inspeção do resultado. Não foi possível montar e verificar os frames finais Home/Conteúdos em desktop/390 px nem remover as capturas de referência. IDs conhecidos: seção `511:1052`, masters `519:1096`, biblioteca `519:1466`, captura Conteúdos `513:1052` e captura Home `514:1052`. Preservar as duas capturas até os frames editáveis serem montados e conferidos.

## Sequência

1. **Referência.** Conferir o estado real do Docker local em `8086` no BrowserOS, em 1440 e 390 px. Registrar versão, rotas e estados. Os dados de exemplo em Conteúdos e Enquetes devem ser identificados como ilustrativos; não transferir dados de ouvintes nem chaves.
2. **Fundações.** Inventariar estilos e componentes que já existem no Figma. Comparar com `src/index.css`, configuração Tailwind e fontes do site. Reusar o que for compatível; vincular os componentes novos a variáveis de cor, raio e espaçamento e a estilos de texto derivados do site.
3. **Componentes.** Montar componentes principais com Auto Layout, propriedades para texto/imagem e variantes úteis. Priorizar Header e menu Conteúdos, mini player, botões, rodapé, card No Ar, filtros, abas/seletor de programa, card de vídeo e carrossel mobile. Usar SVGs e imagens do site, sem rasterizar a interface inteira. Separar os componentes principais dos frames de tela, que devem usar instâncias.
4. **Primeiro lote.** Montar Home e Conteúdos em desktop e mobile. Incluir menu fechado/aberto, grade desktop, seletor e carrossel em 390 px, além dos estados de carregamento, vazio e indisponibilidade do catálogo. A captura editável do HTML pode acelerar a referência, mas não substitui a organização em componentes e instâncias. **Pendente após desbloqueio do Figma MCP:** compor os quatro frames com instâncias dos masters, conferir o visual e só então excluir as capturas de referência identificadas acima.
5. **Demais telas.** Após conferir o primeiro lote, montar Feed/listagem e matéria, Nossa Rádio, Equipe, Programação, Anuncie, Ouvir/Assistir e participação em enquete. Incluir interações de protótipo apenas onde forem úteis para a revisão, como menu e filtros. Figma não executa o streaming, a API ou a lógica do site.
6. **Aceite.** Comparar com a referência no BrowserOS; verificar texto editável, ausência de sobreposição, Auto Layout previsível e troca de variantes. O designer deve conseguir mover ou duplicar frames, editar textos e substituir imagens sem desanexar os componentes. Entregar links por lote e manter o trabalho existente intacto.
