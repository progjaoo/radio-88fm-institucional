# Capas musicais do player

Atualizado em 16/11/2026. Integracao iTunes Search API implementada no codigo e container Docker local. Nenhum deploy.

## Decisao vigente

- O iTunes Search API e a unica fonte ativa nesta implementacao. Deezer e TheAudioDB nao sao fallback automatico.
- A tela nao exibe link para Apple Music/iTunes, conforme pedido. Nenhuma URL de loja e devolvida pelo endpoint.
- O titulo mostrado ao ouvinte e o texto recebido do VOX; o stream de audio continua sendo o stream atual.
- A busca aceita gravacoes diferentes da mesma musica pelo mesmo artista, incluindo Ao Vivo/Live, Session, Acustico, Radio Edit e Remastered. Nao aceita titulo parecido, artista diferente, cover, tributo, karaoke, playback ou instrumental.
- Creditos abreviados da VOX so podem ser expandidos por equivalencias explicitas. Caso observado: `Thalles` -> `Thalles Roberto`; nao ha regra generica de prefixo.
- Ausencia de resultado, indisponibilidade, limite de chamadas ou falha de imagem mantem a logo branca da Radio 88 FM. O mini player, foto do programa, No Ar e fluxo de participacao do Plano 007 permanecem independentes.

## Fluxo implementado

1. A pagina `/ouvir` continua consultando o endpoint proprio `GET /api/music/artwork`, sem receber query de busca nem URL do visitante.
2. O backend consulta a faixa atual do VOX e faz uma unica busca no iTunes BR (`entity=song`, `media=music`, `limit=10`). A consulta normalmente usa artista e titulo; para rotulos finais de radiodifusao conhecidos, usa titulo-base e artista. O titulo exibido e a chave da faixa continuam derivados do metadado original.
3. A selecao normaliza acentos, caixa, pontuacao e espacos; remove somente sufixos de versao conhecidos e compara `&` isolado no titulo como `e` (inclui `é` apos normalizar os acentos). Nomes entre parenteses so equivalem a convidados quando o resultado os credita na faixa. Exige titulo-base igual e os artistas solicitados; nao usa similaridade aproximada.
4. A selecao e deterministica: titulo literal e artista literal, depois titulo-base com artista literal, depois titulo literal com colaborador creditado, e por fim titulo-base com colaborador creditado; desempate pelo `trackId` e URL.
5. Para URLs Apple aprovadas, o servidor troca o sufixo `100x100bb` por `600x600bb`; conserva a URL original como fallback. Nao retorna corpo bruto, preview de audio, link de loja ou URL arbitraria.
6. O frontend exige `trackKey` da faixa atual e HTTPS no host de imagem `is<number>-ssl.mzstatic.com`. Se a imagem de 600 px falhar, tenta `artworkUrl100`; se ambas falharem, mostra a logo.

## Cache, protecoes e operacao

- Cache local por processo: metadados VOX 15 s; capa encontrada 1 h; ausencia 10 min; erro 1 min; maximo 256 faixas; requisicoes concorrentes para a mesma faixa compartilham a busca.
- O limite local e de 10 buscas iTunes/minuto por processo (Apple documenta aproximadamente 20/minuto, sujeito a mudanca). `429` respeita `Retry-After` entre 1 minuto e 1 hora. Timeout externo: 3 s. Sem retries imediatos.
- `MUSIC_ARTWORK_ENABLED=false` desliga a busca e retorna `disabled`, preservando musica, titulo e logo.
- A cache em memoria nao coordena multiplas instancias serverless. Antes de Preview publico/Production, ainda e necessario resolver cache e rate limit global compartilhados, revisar a adequacao de uso/atribuicao das imagens e aprovar qualquer custo de infraestrutura.
- O link Apple foi removido por solicitacao. A documentacao da Apple condiciona o uso promocional da capa a promocao do item da loja e a proximidade de badge/link oficial; ate resolver essa condicao, esta implementacao e apenas local e nao deve ser publicada.
- O iTunes e consultado apenas no servidor com metadados atuais do VOX. Imagens nao sao baixadas, transformadas ou armazenadas pela Radio 88.

## Validacao

### Conferencia ao vivo concluida em 16/11/2026

VOX e titulo do `/ouvir`: `Meu Abrigo - Davi Sacer`. iTunes: `Meu Abrigo (feat. Veronica Sacer) [Ao Vivo]`, artista `Davi Sacer`, album `Meu Abrigo - Ao Vivo`. A comparacao agora remove somente creditos parenteticos explicitos feat./featuring/ft. do titulo-base, sem descartar parenteses semanticos. Artista principal continua obrigatorio; playback continua rejeitado. Os 14 testes Node passaram e o container institucional foi reconstruido com sucesso. BrowserOS confirmou API `matched`, trackKey `meu abrigo davi sacer`, imagem renderizada com naturalWidth/naturalHeight 600x600 e ausencia do link Apple. Esta verificacao substitui a pendencia visual anterior; nao representa deploy ou homologacao de uso publico.

- `server/music-artwork.test.mjs`: parser, versoes, identidade, artista colaborador, selecao deterministica, dominios, cache, deduplicacao, erros, quota e kill switch.
- Faixa ao vivo `Meu Mundo - Thalles`: iTunes retorna `Meu Mundo (Ao Vivo) - Thalles Roberto`; a URL 600x600 respondeu HTTP 200, o alias restrito tem teste unitario e o container foi reconstruido. A VOX deixou de retornar faixa identificada antes da verificacao visual final; a pagina mostrou o fallback logo sem link Apple.
- `src/hooks/useMusicArtwork.test.tsx` e `src/components/TrackArtwork.test.tsx`: validacao de resposta, corrida entre faixas e fallback 600 -> 100 -> logo.
- Reexecucao do matcher nos candidatos iTunes previamente consultados para 12 faixas: `docs/integrations/itunes-matcher-results-2026-11-16.json`. Sao evidencias de matching sobre respostas armazenadas da API, nao uma nova contagem de consultas iTunes.
- BrowserOS: variantes `600x600bb` responderam HTTP 200 para 12/12 URLs selecionadas e para a capa de `Meu Mundo (Ao Vivo)`. A pagina segue sem link Apple. A capa real ainda nao foi vista renderizada apos o rebuild porque a VOX ja nao retornava uma faixa atual; o fallback exibido foi a logo.
- Relatorios comparativos e limites da amostra: [validacao iTunes/Deezer](itunes-deezer-gospel-validation-2026-11-16.md) e [teste TheAudioDB](theaudiodb-gospel-validation-2026-11-16.md). A referencia oficial do endpoint e [iTunes Search API](https://performance-partners.apple.com/search-api).

## Arquivos

- Backend: `server/music-artwork.mjs`, teste `server/music-artwork.test.mjs`.
- Vercel Node: `api/music/artwork.js`.
- Servidor Docker local: `scripts/feed-preview-server.mjs`.
- Hook e apresentacao: `src/hooks/useMusicArtwork.ts`, `src/pages/Ouvir.tsx`, `src/components/TrackArtwork.tsx`.

## Limites conhecidos

- Uma versao aceita pelo matcher nao prova que e a gravacao exata transmitida pela radio; VOX nao fornece identificador de album/gravacao.
- A amostra de 12 faixas e pequena e inclui conteudo gospel; nao mede a cobertura de todo o repertorio.
- `artworkUrl100` continua como fallback. A versao maior e solicitada pela transformacao documentada do caminho Apple; se nao existir, usa a URL original.
- Sucesso tecnico em Docker nao e aprovacao de rollout publico. O link foi intencionalmente removido e falta decidir como cumprir a condicao de badge/link oficial da Apple, alem de proteger quota entre instancias.
- Vite isolado nao serve `/api/music/artwork`; validar o endpoint no servidor Docker ou funcao Node, nao apenas em `npm run dev`.
