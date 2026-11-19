# Proposta Debates - 17/11/2026
Estado: modelo aprovado e aplicado na pagina institucional /debates.
Referencia: src/index.css e tailwind.config.ts; Montserrat/Archivo, marca #1360E8, header preto, fundo branco, amarelo como acento. Nao importar tema externo.
Componentes aplicados: Header/Layout existentes, Input de busca, Select de ano/mes via shadcn/Radix instalado, destaque por visualizacoes, cards 16:9 e player oficial sob demanda. Foco visivel, teclado, reduced-motion e alvos de toque com pelo menos 44px. Mini player preservado; radio pausa apenas quando a pessoa inicia um video.
O prototipo proposta.html continua sendo apenas uma ilustracao isolada, sem chamadas YouTube. A pagina real usa somente dados vindos do endpoint server-side.

## Revisao 2 - busca e filtros
Accordion removido por pedido do usuario. Busca + Ano + Mes em uma unica barra; grade continua de 3/2/1 colunas, seis itens por pagina no modelo, contador, limpar filtros e estado vazio. Busca demonstrativa por trecho do titulo, insensivel a caixa/acentos, debounce de 250ms. Filtros combinados e persistidos em q/ano/mes na URL. Destaque aparece somente sem filtros para priorizar resultados ao buscar.
Na integracao: GET publico com q, year, month e cursor validados; SQL parametrizado, limites de tamanho e pagina, cancelamento de requisicoes obsoletas e indices aferidos com EXPLAIN. Nunca concatenar entrada em SQL nem chamar YouTube por tecla. O prototipo apenas filtra fixtures explicitamente identificadas no navegador.

## Revisao 3 - filtros antes do destaque
Barra Busca/Ano/Mes movida acima do destaque. Destaque renomeado para Debate mais visualizado e permanece visivel durante a busca. Na integracao, selecionar pelo statistics.viewCount verificado dos debates elegiveis do catalogo (nao de todos os videos do canal); desempate por data e videoId, sem inventar contagens. Modelo continua ilustrativo.

## Revisao 4 - Select shadcn/Radix real
Ano e Mes agora montam o Select existente em src/components/ui/select.tsx (Radix), via preview-selects.tsx; bundle embutido no HTML para funcionar inclusive aberto como arquivo. Triggers de 48px, icones CalendarDays/CalendarRange Lucide, chevron, menu branco elevado, item selecionado azul e check, suporte de teclado/Escape/foco fornecido pelo Radix. Select nativo fica oculto apenas como adaptador dos filtros demonstrativos. Nenhuma dependencia nova nem mudanca no componente global.

## Correcao de overflow dos filtros
Tracks minmax(0,...) e min-width:0 nos labels, mounts e triggers impedem que o tamanho intrinseco do Select ultrapasse a coluna. Selects adaptadores hidden explicitamente display:none; texto trunca sem empurrar chevron. Abaixo de 800px a busca ocupa uma linha inteira e Ano/Mes dividem igualmente a linha seguinte.

## Implementacao da pagina institucional

A pagina real nao usa o accordion nem os fixtures do prototipo. Ela busca uma vez o catalogo server-side e aplica busca/filtros localmente; por isso digitar nao faz chamadas ao YouTube. Busca, Ano e Mes ficam acima do destaque. O debate mais visto e calculado dentro dos resultados elegiveis atuais e fica fora da grade secundaria para nao duplicar o card. Um iframe oficial por vez e criado somente apos acao explicita; ao fechar, e removido e o radio nao retoma sozinho. Resultados, falha de API, catalogo vazio e filtro sem correspondencia possuem estados distintos.
