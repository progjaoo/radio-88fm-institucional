# Plano de robustez do reconhecimento de capas

Data: 16/11/2026. Escopo: levantar falsos negativos e falsos positivos entre metadados VOX e iTunes; orientar correcoes incrementais. Nao altera o contrato publico nem autoriza rollout.

## Estado observado

O pipeline atual divide `musica_atual` pelo ultimo ` - `, normaliza acentos/pontuacao, remove sufixos de versao e exige artista creditado. O caso recente `Meu Abrigo - Davi Sacer` falhava porque iTunes retorna `Meu Abrigo (feat. Veronica Sacer) [Ao Vivo]`. Foi corrigida a normalizacao para remover apenas creditos feat/ft entre parenteses/colchetes, preservando outros parenteses. O matcher continua exigindo o artista principal e rejeitando playback. Teste real no container confirmou VOX, titulo exibido, resultado iTunes e imagem 600x600 correspondentes.

### Canção e Louvor e troca de faixa (18/11/2026)

- O iTunes retornou `Eu Cuido de Ti` no EP de `Canção e Louvor` já na consulta original ao catálogo BR, com ID `1160393550`. O matcher anterior descartava a faixa por dividir o crédito VOX `Cancao & Louvor` em dois artistas. O nome verificado agora é tratado como um único crédito; `&` continua separando colaboradores nos demais casos.
- Quando a capa ainda pertence a outra faixa ou a consulta falha temporariamente, o navegador faz até três novas tentativas em 5, 20 e 35 segundos a partir da primeira resposta, além do tempo de cada requisição. Um `not_found` da faixa correta encerra a busca; trocar de música cancela a tentativa anterior. Sem correspondência, continua a logo.
- A URL da capa 600×600 do EP respondeu `200 image/jpeg`. A seleção também foi exercitada com seis outras faixas conhecidas do catálogo real, sem copiar dados ou imagens do myTuner.

## Matriz de cenarios e tratamento

| Cenario | Exemplo | Risco | Regra recomendada | Teste |
| --- | --- | --- | --- | --- |
| feat./featuring/ft. em parenteses ou colchetes | `Meu Abrigo (feat. Veronica) [Ao Vivo]` | Falso negativo | Remover somente o segmento explicito de credito; manter artista principal obrigatorio | feat., featuring, ft., ambos os delimitadores |
| colaborador no campo de artista | `Davi Sacer & Veronica Sacer` | Falso negativo/credito incompleto | Tokenizar creditos por delimitadores e exigir cada artista VOX; aliases apenas em lista controlada | ordem variada, colaborador faltando |
| titulo com separador ` - ` | `Nome - Parte 2 - Artista` | parser pode dividir incorretamente | Continuar usando ultimo separador; testar titulo com hifen e artista composto | hifen ASCII/en dash/em dash |
| artista com hifen, ampersand ou virgula | `A-B`, `A & B`, `Sobrenome, Nome` | separacao ambigua | Nao adivinhar; manter separadores documentados e adicionar excecao apenas com evidencia do VOX | fixtures por formato |
| pontuacao/apostrofo, acentos, caixa | `Tu és`, `Tu es`, `D'Ávila` | Falso negativo | Normalizacao Unicode somente para comparacao; exibir texto VOX | diacriticos e Unicode composto |
| versao ao vivo/acustica/remaster | `Ao Vivo`, `Acoustic Session` | Falso negativo | Remover apenas qualificadores aprovados no fim; nunca qualquer parentetico | sufixo versus palavra no meio |
| traducao, medley ou subtitulo semantico | `Counting My Blessings`, `A / B` | Falso positivo por base ampla | Preservar texto semantico; exigir igualdade integral do titulo-base | negativos de titulo parcial |
| titulos repetidos por mesmo artista | duas faixas `Meu Mundo` | Capa de outra gravacao | Escolher somente entre resultados de titulo-base completo e artista valido; nao confiar na primeira posicao | candidatos ordenados aleatoriamente |
| cover/tributo/karaoke/playback/instrumental | mesmo titulo/artista | Capa associada a versao errada | Bloquear termos proibidos em titulo/album/artista; se conflito ou ambiguidade, logo | varias grafias/idiomas |
| artista VOX abreviado/alias | `Thalles` vs `Thalles Roberto` | Falso negativo ou homonimo | Equivalencia explicita, revisada e testada; nunca prefixo generico | alias permitido e homonimo rejeitado |
| busca retorna artista/album errado | titulo parecido | Falso positivo | Exigir artista principal e titulo-base; colaboradores nao substituem artista principal | artista substring, artista no album |
| URL ausente/host inesperado | `artworkUrl100` invalida | conteudo remoto inseguro | HTTPS e allowlist host Apple; cair para logo | URLs malformadas, host enganoso |
| imagem grande falha | URL 600 quebrada | imagem em branco | fallback 100, depois logo | erro de cada etapa |
| VOX sem faixa, locucao ou metadata malformado | campo vazio/identificacao da radio | capa antiga ou falsa | retornar not_found, limpar capa anterior, logo; limitar tamanho | transicao musica->locucao |
| troca rapida de faixa/cache | faixa A vira B | capa atrasada | associar resposta ao `trackKey`; abortar/ignorar resposta antiga | corrida A/B e cache TTL |
| iTunes 429/timeout/5xx | limite ou indisponibilidade | saturacao/repeticao | timeout, backoff, cache negativo curto e fallback; nao retry em cascata | fake timers e Retry-After |
| faixa com versao desconhecida | `Radio Version`, `Demo`, `Acapella` | aceitar variante indesejada | nao remover qualifier desconhecido automaticamente; retornar logo ate revisao | catalogo de qualificadores allowlist |

## Etapas de correcao

1. Cobrir os cenarios de parser e titulo com fixtures locais, sem chamadas de rede em testes unitarios.
2. Extrair uma funcao de comparacao explicita que retorne motivo e score (`exact`, `version`, `featured-title`, `alias`, `reject`) para facilitar diagnostico sem expor dados a visitantes.
3. Acrescentar alias somente com prova de metadados e teste negativo para homonimos; exigir revisao manual para qualquer novo alias.
4. Manter fallback conservador: ambiguidade, credito incompleto ou qualificacao desconhecida resultam em logo, nunca em uma capa apenas aproximada.
5. Executar a mesma faixa em tres fontes: VOX ao vivo, resposta iTunes armazenada/test fixture e DOM do `/ouvir`; registrar titulo, artista, trackKey, motivo da decisao, URL/dimensoes e fallback.
6. A cada regressao real, adicionar fixture e atualizar este documento/progress; executar testes Node, frontend e verificacao Docker/BrowserOS pontual.

## Monitoramento

Nao existe monitoramento continuo por esta sessao. A integracao consulta VOX no request do site e o cache e em memoria por processo. Para monitoramento operacional futuro, criar tarefa/servico separado com polling moderado, limite de chamadas, armazenamento de amostras minimizadas, retencao curta, alerta de miss-rate e sem gravar audio, letras ou identificadores pessoais. Nao colocar `setInterval` em funcao serverless. Antes de implementar, aprovar executor persistente, custo, retencao e acesso aos logs.

## Criterios de aceite

- Casos acima possuem testes positivos e negativos, em especial titulo semantico, colaborador, alias, playback e artista semelhante.
- Uma resposta atrasada nunca mostra capa da faixa anterior.
- Falha/ambiguidade sempre usa fallback, sem travar audio/titulo.
- Relatorio de validacao diferencia resposta iTunes disponivel, matcher aceitou, imagem carregou e verificacao visual real.
- Nao afirmar monitoramento continuo sem executor e telemetria ativos.
