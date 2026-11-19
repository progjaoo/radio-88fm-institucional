# Mini player: proposta para aprovacao

Data: 12/11/2026. Status: design aprovado pelo usuario e implementado localmente. Sem commit, push ou deploy.

## Referencias

- Referencia visual enviada pelo usuario: mini player da Radio 93 FM.
- Orientacoes dos agentes UI/UX Designer e Institutional Frontend Engineer do ecossistema.
- `src/components/MiniPlayer.tsx`, `src/index.css`, `src/services/programming/ProgrammingProvider.tsx` e `docs/programming-local-validation.md`.
- Fontes existentes: Montserrat e Archivo. Degrade existente: `hsl(204 97% 45%)` a `hsl(204 100% 30%)`.

## Composicao proposta

- Esquerda: indicador No Ar, microfone, miniatura do programa, nome e horario.
- Centro: convite para baixar o app e links Google Play/App Store existentes no site.
- Direita: estado do audio, play/pausa e volume.
- Desktop: barra de aproximadamente 80 px. Mobile: aproximadamente 116 px, com lojas em uma segunda linha. Se aprovado, o espaco reservado no site deve acompanhar a altura real da barra para nao cobrir conteudo.
- Microfone alterna suavemente entre vermelho e azul em ciclo de 1,4 segundo. Sem flashes rapidos. Para movimento reduzido, troca somente a cor em 2,8 segundos, sem pulsacao de opacidade.
- No Ar representa a programacao, nao a reproducao de audio. O exemplo abre pausado e nao inicia som automaticamente.
- Nome e imagem devem vir da grade publicada, nao dos metadados da musica. Sem programa confirmado, usar estado neutro Radio 88 FM, sem afirmar No Ar e sem inventar horario.
- Sem imagem do programa, usar `logoheadsvgcolor.svg`. Solicitar ao designer miniatura quadrada de 512 x 512 px, com marca centralizada e sem textos pequenos. Essa recomendacao e propria da miniatura; nao substitui a arte ampla 16:9 da secao No Ar.

## Artefatos

- `mini-player-no-ar-proposta.html`: prototipo independente com animacao e alternancia visual de play/pausa. Nao reproduz audio nem consulta API.
- `mini-player-no-ar-proposta.png`: prancha de aprovacao desktop e mobile.

Os links das lojas sao os mesmos de `src/pages/Index.tsx`. Os selos sao representacoes para aprovacao do layout; na implementacao, conferir os arquivos oficiais das lojas.

## Implementacao local

- Somente a barra foi aplicada; a area branca do prototipo nao integra a implementacao.
- `src/components/MiniPlayer.tsx`: programa/imagem/horario do `useProgramming` compartilhado, estado neutro quando indisponivel, imagem colorida alternativa e controles reais.
- `src/components/AppDownloadLinks.tsx`: links das duas lojas, compartilhados entre as disposicoes desktop e mobile.
- `src/contexts/AudioPlayerContext.tsx`: volume limitado entre 0 e 1, sincronizacao pelo evento `volumechange`, mute independente e restauracao do ultimo volume audivel ao sair do volume zero. Nao inicia audio por alterar volume.
- `src/index.css`: 80 px a partir de 1024 px; 120 px abaixo disso, mais safe area. O espaco de rodape e os controles flutuantes continuam usando `--player-space`. Microfone animado apenas com programa confirmado; alternancia simplificada para movimento reduzido (2,8 s).
- A tela `/assistir` continua oferecendo link para `/ouvir`, sem iniciar audio sobre o video.
- A capa de musica da tela Ouvir e o Media Session nao foram alterados. A miniatura da barra passa a representar o programa, nao a musica.
- Sem novas consultas, timers de JavaScript ou dependencias para o mini player. O provider existente continua responsavel pela grade.

## Validacao em 12/11/2026

- Typecheck aprovado; ESLint aprovado nos arquivos alterados.
- 23/23 testes direcionados de mini player, ciclo de audio e programacao aprovados.
- Suite completa: 166/167. Falha preexistente em `seoConfig.test.ts:34`, ja registrada em `docs/programming-local-validation.md`; nao alterada nesta tarefa.
- Builds cliente e SSR aprovados em diretorios temporarios; nao executado `feed:sync`, preservando o conteudo editorial em andamento.
- Chrome headless isolado: larguras 320, 390, 768, 1024 e 1440; todos os links/controles visiveis dentro da largura e espaco reservado igual a altura da barra. Programacao desativada nessa conferencia para nao consultar infraestrutura real; estado de programa/imagem validado nos testes direcionados.
- Validacao fisica de Safari/iOS e reproducao real do stream ainda devem ser feitas pelo usuario; dispositivos podem limitar ajuste de volume por software. Slider fica no desktop; mobile preserva o controle de som e volume do dispositivo.

Banco, R2, Preview e Production nao foram alterados. Demais trabalhos locais foram preservados.

## SVG fornecido pelo usuario (12/11/2026)

O desenho de `microfone-piscando.svg` substitui somente o antigo icone Lucide no componente `MicrophoneIcon.tsx`. Foram aproveitados corpo, grade, suporte, haste e base; o fundo quadrado e a animacao propria do arquivo nao sao importados. O desenho herda `currentColor` da barra, preservando vermelho #ff172b, azul da radio, dimensoes e ciclos ja aprovados. O original, incluindo seus metadados de proveniencia, esta preservado sem alteracoes em `references/microfone-piscando.original.svg`.

Validacao: 14/14 testes direcionados (icone, mini player e integracao do Plano 007), typecheck e ESLint aprovados. BrowserOS confirmou SVG sem fundo quadrado, tamanho de 24 px no desktop e alternancia nas cores existentes. Nenhuma alteracao em layout, lojas, player de audio, grade ou regras de participacao.

## Musica e cantor junto aos controles (13/11/2026)

A area textual ao lado do play/pausa passa a mostrar o mesmo `musica_atual` formatado por `getDisplayName` que a tela Ouvir utiliza, preservando musica e cantor na ordem fornecida pela API. O programa continua a esquerda, independente da musica. Metadados vem do AudioPlayerProvider existente, sem nova chamada ou polling no componente. Nome longo recebe reticencias e title com texto completo, sem empurrar os controles. O comportamento final de titulo e visibilidade e definido pelos refinamentos abaixo.

Dois testes adicionais verificam musica/cantor, programa preservado, pausa com ultimo titulo e metadados genericos de estacao. Nao houve mudanca no player da tela Ouvir nem na capa do programa.

### Refinamento: somente o titulo, inclusive antes do play

Por solicitacao posterior em 13/11, o subtitulo visual foi removido: a area exibe somente musica/cantor ou Radio 88 FM. Nao mostra Ouvindo a 88, Radio 88 FM ao vivo, Audio pausado ou Toque para ouvir nessa area. O estado acessivel de reproducao e os nomes dos botoes permanecem corretos.

Metadados publicos de streaming passam a ser consultados pelo provider compartilhado ao abrir a pagina e a cada 15 s enquanto a aba esta visivel, mesmo pausada; aba oculta nao faz consultas e aborta requisicao pendente. Retorno a aba atualiza os dados. Nao ha novo polling do Gestao, Neon ou PostgreSQL, nem reproducao automatica ou evento de escuta por buscar titulo. Essa regra substitui a condicao anterior de atualizar metadados apenas durante reproducao. Sem dados ou com titulo generico da estacao, permanece Radio 88 FM. Falha de rede preserva o ultimo metadado recebido.

### Correcao de visibilidade em notebooks e mobile (13/11/2026)

O Docker ja continha a logica acima, mas `.mini-player-status` continuava com `display: none` ate 1536 px. Isso ocultava musica/cantor em notebooks, inclusive na nova pagina Anuncie; nao era uma falha da API nem uma reversao do provider.

- A partir de 1024 px: titulo visivel ao lado de play/pausa, limitado por reticencias para preservar os controles.
- Abaixo de 1024 px: o mesmo titulo aparece em uma linha compacta abaixo do programa, fora do link que abre Ouvir. Sem alterar alturas reservadas do player (120/80 px), lojas, volume ou grade do Plano 007.
- Ambas as disposicoes usam somente `trackName`, independente de `isPlaying`, com alternativa Radio 88 FM. A linha compacta e o texto ao lado dos controles sao mutuamente exclusivos no CSS.
- Testes de regressao cobrem dados antes do play, pausa, falha da API, metadado generico e regras CSS dos breakpoints. Sem novas requisicoes ou dependencias.
- BrowserOS MCP indisponivel nesta sessao; validacao visual interativa nao foi presumida a partir do JSDOM.
- Validacao final: 30 testes direcionados aprovados (mini player, breakpoints, ciclo de audio, Plano 007 e Anuncie), TypeScript e ESLint aprovados. Container institucional reconstruido, saudavel, com hashes de componente/CSS iguais ao checkout. Smoke HTTP confirma HTML compacto, regra de 1024 px no bundle CSS servido e pagina/download de Anuncie preservados. Nada publicado em Vercel.

### Posicao final solicitada: sempre ao lado do play/pausa (13/11/2026)

Esta regra substitui a linha compacta sob o programa descrita acima. Musica e artista ficam imediatamente a esquerda do play/pausa em todas as larguras, com uma unica ocorrencia do titulo no player. No mobile, o titulo usa ate duas linhas; no desktop, uma linha com reticencias. Arte e espacamentos do programa ficam menores abaixo de 480 px para acomodar texto e controles, sem remover volume, links das lojas, horario ou indicador No Ar. Alturas reservadas de 120/80 px preservadas. Metadados continuam independentes de play/pausa; na ausencia deles, Radio 88 FM.

Validacao direcionada: 25 testes de player, CSS, ciclo de audio e integracao Plano 007 aprovados; TypeScript e ESLint aprovados. O teste do componente agora verifica que o bloco da musica e irmao imediatamente anterior do botao de play e nao fica na identidade do programa. Reconstrucao somente do institucional Docker, sem publicacao hospedada.
