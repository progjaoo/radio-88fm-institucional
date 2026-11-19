# Plano 015 - Capas dos programas e card No Ar

**Estado:** interface implementada e conferida no Docker local. As cinco capas existentes usam cores amostradas, vinculadas ao arquivo, inclusive Favorito (`#D26F01`). O Institucional aceita `imageEdgeColor`; cálculo, persistência e publicação automática no upload do Gestão ainda pendentes. Sem publicação em produção.

[Proposta interativa](../docs/design/programas-no-ar/proposta.html) com as artes cadastradas de **Altar 88** e **Temperatura Gospel** e o estado sem capa de **Favorito**. A grade usada na demonstração não altera o programa no ar.

## Especificação para o designer

| Item | Entrega recomendada |
| --- | --- |
| Tela | **1920 × 1080 px**, horizontal, proporção **16:9** |
| Área segura | Manter rostos, logos e elementos essenciais a pelo menos **96 px nas laterais e 54 px no topo e na base** |
| Borda | Estender a cor dominante até a borda; preferir uma faixa visualmente contínua no lado direito, onde a arte encontra o texto no desktop. Não incluir moldura branca ou cantos arredondados no arquivo |
| Conteúdo | Arte legível em cerca de 340 px de largura. Evitar texto pequeno, horário e nomes de apresentadores já exibidos pelo site |
| Exportação | PNG ou JPEG sRGB como arquivo de entrega; o upload reutiliza o otimizador existente para gerar o arquivo público. Não é necessária miniatura quadrada |

As artes atuais já têm 1920 × 1080 px. A amostragem da borda direita indicou amarelo `#FFB900` em Altar 88 e `#FEB900` em Temperatura Gospel. A tonalidade parecida vem dos arquivos reais, não de uma cor comum fixada para todos os programas.

## Comportamento proposto

- **Mini player:** manter sempre a logo colorida da Rádio 88 FM, mesmo com uma capa cadastrada. Nome e horário do programa continuam variando pela grade. Microfone, reprodução, volume, faixa e lojas não mudam.
- **Home / No Ar:** manter a régua de 1500 px e as margens dos blocos de Programação e Vídeos. A partir de 900 px, a arte ocupa 52% da largura do card e a altura acompanha a proporção 16:9, sem recorte. A imagem se apoia na base mesmo se o texto exigir mais altura. Abaixo desse ponto, arte em cima e dados/ações abaixo.
- A borda usa a cor amostrada da arte; o fundo do texto usa uma mistura clara da mesma cor com branco (aprox. 10–12%). Texto escuro e CTAs institucionais vermelho/azul permanecem. A arte toca a borda externa do card e a coluna de texto, sem moldura branca.
- **Sem capa ou erro de imagem:** logo sobre fundo branco no painel de imagem e cores institucionais na coluna de texto. A falha não pode persistir após trocar de programa. “Participe do programa” continua substituindo “Ouvir ao vivo” quando há enquete ativa.
- A mudança não atinge as capas musicais de `/ouvir`, os banners ou o Feed.

## Sequência após aprovação

1. No upload de imagem de programa no Gestão, calcular cor dominante em uma faixa interna da borda direita da imagem já orientada/otimizada, em sRGB. Ignorar transparência e descartar amostras sem uma cor predominante. Não usar cor inferida do nome do programa. Persistir metadado opcional `imageEdgeColor` (`#RRGGBB`) associado à versão do arquivo e publicá-lo junto de `imageUrl`. Recalcular ao substituir e limpar ao remover a arte.
2. Fazer backfill só das capas existentes pelo fluxo de mídia autorizado, sem regravar arquivos nem exigir recadastro. `imageEdgeColor` ausente ou inválido mantém a paleta padrão, mas uma imagem válida continua aparecendo. Evitar canvas no visitante e dependência de CORS do R2 para obter cor.
3. Atualizar o contrato público em `src/services/programming/programming-contract.ts` de modo retrocompatível. Em `src/components/OnAirSection.tsx`, aplicar o layout compacto e estado de falha de imagem; em `src/components/MiniPlayer.tsx`, usar sempre a logo. Manter públicos os destinos existentes, o estado de carregamento e a lógica de enquete.
4. Testar upload/substituição, ausência de cor, imagem quebrada, troca de programa, enquete ativa, arte fora de 16:9 sem recorte e nomes longos. Conferir localmente em 390 px e desktop: imagem sem moldura, contraste, foco, alvos de toque e ausência de rolagem horizontal. Aprovar em Docker antes de qualquer publicação.

**Validação da proposta:** BrowserOS carregou as duas artes reais em 1920 × 1080, conferiu a logo e a paleta padrão no Favorito e verificou a composição de Altar 88 em 390 px, sem rolagem horizontal.
