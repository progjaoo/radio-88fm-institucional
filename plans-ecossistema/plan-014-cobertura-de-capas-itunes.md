# Plano 014 - Cobertura de capas no player

**Estado:** diagnóstico concluído, ajuste implementado e homologado no Docker local (`8086`). Sem deploy em produção.

## Resultado e decisão

| Estratégia | Correspondências na amostra |
| --- | ---: |
| Busca original, 10 candidatos | 33/50 |
| Busca original, 25 candidatos | 33/50 |
| Busca original, 50 candidatos | 33/50 |
| Uma consulta com normalização seletiva | 38/50 |

- Amostra de 50 faixas distintas realmente transmitidas pela estação: 3 obtidas diretamente da VOX/histórico Shoutcast, 47 do [histórico público espelhado](https://radoxo.com/brazil/radio-88-fm/playlist). O espelho fornece somente título/crédito e horário para o diagnóstico; não é dependência do player. O conjunto não é um export de 50 respostas brutas da VOX.
- A busca de 50 forneceu o ranking completo, com recortes top 10/25 para todas as faixas. Os recortes foram confrontados com chamadas de limite explícito nos três controles e nas 17 falhas. A consulta com título-base foi medida nas falhas, não repetida nas faixas já reconhecidas. O p95 da consulta ampla de 50 foi 1,441 s; o p95 das oito reexecuções dirigidas do resolvedor final foi 0,774 s, sem incluir os HEAD das imagens. As amostras de latência não são comparáveis como teste controlado.
- A consulta continua limitada a 10 resultados e uma chamada de catálogo por faixa fora do cache. Para rótulos finais como `(Antiga)`, `[Versão antiga]` e `(MAIS TOCADA EM 2025)`, consulta diretamente título-base + artista em vez de gastar uma chamada com o rótulo. Convidados entre parênteses só equivalem a créditos verificados no resultado. `&` isolado no título é equivalente a `e/é` na comparação, sem alterar o crédito do artista, o texto exibido ou a chave da faixa.
- Cinco das 17 ausências originais foram recuperadas. Os 33 acertos originais foram preservados na amostra; os cinco novos resultados foram verificados com o iTunes real, título/créditos e imagens 600/100 px (`200 image/jpeg`). As 12 restantes continuam com logo; não há base para afirmar que todas correspondam a gravações disponíveis no catálogo. O teste não mede cobertura de todo o repertório.
- Caso adicional fora da amostra: a VOX publicou `Grande & O Senhor - Adhemar De Campos`. A consulta literal já continha a faixa oficial de Adhemar, mas o comparador a rejeitava. Com o novo comparador, a mesma consulta resolve `Grande É o Senhor`; as duas imagens responderam 200. A reprodução do metadado no resolvedor instalado no Docker também passou. O BrowserOS viu a capa da faixa ao vivo da Valesca Mayssa sem iniciar o áudio.
- Para Sued Silva, a grafia registrada na transmissão foi `Reacende a Chama`, que encontrou a capa em uma única chamada. A grafia `Reacendo a Chama` não foi convertida por aproximação. O [myTuner credita o monitoramento à ACRCloud](https://mytuner-radio.com/radio/radio-88-fm-438326/), que [oferece reconhecimento por áudio](https://www.acrcloud.com/audio-fingerprinting/); não foi confirmado o método usado nessa música específica.
- 22 testes Node, 207 Vitest, typecheck, lint dirigido e build Docker passaram. API, painel, PostgreSQL, volume e release do Feed foram preservados; tag de retorno `radio88-feed-institutional:before-artwork-plan014`. Nenhuma publicação. As condições de uso das imagens da Apple seguem como gate antes de uso público.
- [Evidência por faixa](../docs/integrations/itunes-query-benchmark-2026-11-18.json): fonte, horário, limites explícitos ou derivados e validações dos resultados recuperados.

## Piloto do diagnóstico

| Faixa | Literal 10 / 25 / 50 | Título-base + artista, 25 |
| --- | --- | --- |
| Acima das Estrelas (Antiga) - Shirley Carvalhaes | 0 / 0 / 0 | 17 candidatos; o comparador com título-base aceitou a faixa de Shirley Carvalhaes, sem comprovar a edição exata |
| Reacendo a Chama - Sued Silva | 0 / 0 / 0 | 0 candidatos no BR; não comprova ausência da faixa no catálogo |

O JSON da VOX só traz a faixa atual. O histórico público do stream retornou cinco registros no primeiro levantamento. O script `scripts/validation/compare-itunes-queries.mjs` fornece coleta direta limitada e comparação a partir de amostras, com pelo menos 6,1 s entre chamadas. O piloto não foi contado como origem; os títulos presentes na amostra foram obtidos de registros da transmissão. O diagnóstico não aplica mudanças automaticamente.

## Diagnóstico

`server/music-artwork.mjs` consulta `artist + title` no catálogo BR, com `entity=song`, `media=music` e `limit=10`. A limpeza usada na consulta não é toda a normalização aplicada na comparação. O título-base não reconhece `(Antiga)`. Em “Acima das Estrelas (Antiga)”, isso pode eliminar um resultado correto mesmo que a consulta o devolva. A [Apple lista mais de uma gravação de Shirley Carvalhaes](https://music.apple.com/us/song/1101909767); preservar a preferência pela versão antiga quando houver evidência, sem deduzir que qualquer data do catálogo seja a data da gravação. “Reacendo a Chama”, de Sued Silva, entra na amostra sem causa presumida. A capa no myTuner é referência visual, não prova da estratégia dele.

## Execução

1. **Medir antes de alterar.** Montar amostra revisada de pelo menos 50 faixas reais do VOX, incluindo acertos, falhas, títulos curtos, versões, colaborações e homônimos. Para cada faixa, separar: metadado inválido, resultado ausente, correto fora do top 10, resultado rejeitado, imagem indisponível, resposta atrasada e erro do provedor. Marcar no catálogo a faixa esperada ou “sem correspondência confirmada”. Guardar fixtures reduzidas e executar a estratégia atual como controle.
2. **Comparar consultas.** Testar os limites 10, 25 e 50 na mesma consulta. Comparar com `título-base + artista` no BR: remover apenas rótulos comprovadamente editoriais no fim do título, inicialmente testar `(Antiga)` e `(Versão antiga)`; preservar subtítulos e a informação de versão para ranquear. Medir variantes sem acentos/pontuação. Testar outro país apenas no diagnóstico; só usar em produção se houver ganho relevante comprovado e revisão das condições de uso.
3. **Aplicar a menor cascata eficaz.** Começar com uma consulta; permitir no máximo uma segunda, com a variante vencedora, apenas quando não houver correspondência segura. Deduplicar parâmetros e resultados. Exigir título-base completo e artistas compatíveis, inclusive convidados explícitos; rejeitar playback, tributo e cover não correspondente. Preferir título/versão exatos quando disponíveis; se o resultado permanecer ambíguo, manter a logo. Não adicionar exceções por música.
4. **Controlar custo e falhas.** Contabilizar cada chamada no orçamento de 10/min por processo já existente; manter deduplicação concorrente e backoff em HTTP 429. Não fazer a segunda busca após timeout, 429 ou erro do provedor. Distinguir cache negativo de indisponibilidade e medir latência p95 e chamadas por faixa. Sem consultas de catálogo pelo navegador nem uso do myTuner como fornecedor.
5. **Homologar.** Rodar testes backend/frontend, comparar resultados com o controle e validar o Docker em `8086/ouvir` com áudio pausado, metadado reproduzido e troca de faixa. Conferir 600/100 px, fallback da logo e ausência da capa anterior. Antes de qualquer publicação, revisar as [condições de uso de arte da Apple](https://performance-partners.apple.com/search-api).

## Critérios de aceite

- Recuperar pelo menos metade das falhas com correspondência confirmada na amostra revisada, sem regredir acertos nem aceitar artista incorreto ou resultado de playback nos casos revisados. Informar numerador e denominador; não prometer cobertura total.
- Registrar a variação de cobertura, falsos positivos, chamadas por faixa e latência p95. Se a segunda consulta não gerar ganho relevante, manter apenas a primeira.
- Separar resultados reais do catálogo, teste com metadado reproduzido e confirmação no player. Manter a logo para faixas sem correspondência segura.
