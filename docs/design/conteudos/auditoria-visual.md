# Scan de Interface - Conteúdos

18/11/2026. Escopo: protótipo isolado. Referência consultada: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). A auditoria não certifica a aplicação inteira.

## proposta.tsx

- `proposta.tsx:135` - Topo tinha aviso, slogan e texto auxiliar concorrentes. Mantido apenas o H1 com as mesmas classes de tipografia de Feed/Debates; nota de dados no fim da página.
- `proposta.tsx:124` - Faltava atalho para o conteúdo principal. Adicionado link de salto com foco visível.
- `proposta.tsx:138` - Campo de busca não tinha nome e configuração de autocomplete. Corrigido sem remover rótulo visível.
- `proposta.tsx:121` - Miniaturas sem dimensões explícitas. Definidos tamanho intrínseco e carregamento sob demanda na grade.
- `proposta.tsx:151` - Grade ilimitada sem continuidade editorial. Limitada a seis itens relevantes, sem duplicar o destaque; link semântico para a playlist oficial da categoria.

## proposta.css

- `proposta.css:87` - Caixa externa repetia as bordas de cada campo. Removidas borda, sombra e fundo do grupo.
- `proposta.css:106` - Opções Radix herdavam o amarelo do tema. Hover e destaque por teclado usam azul, somente no protótipo. Ícones representam cada filtro; o chevron e a seleção permanecem no Radix.

## Validação e Escopo

- BrowserOS: seis cards e link oficial em Debate 88, seleção por teclado refletida na URL, hover com fundo azul e largura de 390 px sem overflow horizontal.
- O filtro de ano retornou menos de seis quando havia menos correspondências nas amostras; nenhum vídeo foi inserido fora do filtro.
- Build isolado e lint passaram. Reprodução, legendas do player e dados reais da API permanecem para a implementação, não são simulados como funcionais nesta proposta.
