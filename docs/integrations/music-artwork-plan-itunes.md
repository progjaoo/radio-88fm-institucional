# Plano 008 - Capas musicais dinamicas com iTunes Search API

Atualizado em 16/11/2026. Status: integracao reconstruida e validada ao vivo no Docker local; 14 testes Node aprovados. VOX/tela: `Meu Abrigo - Davi Sacer`; API `matched` e capa renderizada em 600x600 no `/ouvir`, sem link Apple. Sem deploy. Condicoes de uso publico e quota global continuam pendentes.

Este documento substitui a prioridade anterior TheAudioDB/Spotify. O nome historico do arquivo e mantido para preservar links. Evidencias e entradas antigas do progresso permanecem como historico, nao como decisao vigente.

## 1. Decisao de produto

- Usar iTunes Search API como unica fonte ativa de capas nesta entrega.
- Aceitar outra versao da MESMA musica pelo MESMO artista: ao vivo, live, session e acustico nao invalidam o resultado. Nao e necessario identificar o album ou gravacao exatos transmitidos.
- Nao aceitar outra musica do artista, cover de terceiro, tributo, karaoque ou playback instrumental como substituto da interpretacao do artista. Participacoes adicionais sao aceitas quando o artista informado pelo VOX esta explicitamente creditado como artista da faixa retornada.
- Sem cadastro manual, bucket R2 proprio, Spotify ou login Apple do ouvinte. Consulta publica de catalogo, nao reproducao de audio Apple.
- Deezer permanece alternativa futura ja testada; NAO adicionar fallback Deezer implicitamente nesta migracao. TheAudioDB deixa de ser fonte ativa apos homologacao local iTunes.
- VOX segue como fonte do titulo exibido e audio continua no stream atual. Foto do programa no mini player, No Ar, enquetes, feed, banners e demais entregas do Plano007 devem ser preservados.

## 2. Evidencias e limites

Relatorios locais no institucional:

- docs/integrations/theaudiodb-gospel-validation-2026-11-16.md: TheAudioDB retornou track:null para as 12 faixas da amostra, mesmo com variacoes.
- docs/integrations/itunes-deezer-gospel-validation-2026-11-16.md e JSON associado: iTunes e Deezer retornaram candidatos relacionados com capa para 12/12; 24 URLs selecionadas responderam HEAD HTTP200 image/jpeg.
- O matcher novo aceitou 12/12 candidatos relacionados na amostra armazenada; isso nao e uma nova consulta a API, nem transforma a cobertura em 100% do repertorio.
- O BrowserOS confirmou HTTP 200 para as variantes `600x600bb` das 12 URLs selecionadas. A URL `artworkUrl100` original fica como fallback em caso de erro da imagem maior.

O TheAudioDB nao e mais fonte ativa. A integracao iTunes esta implementada no endpoint Node do institucional; as consultas de matching da amostra usaram respostas publicas iTunes previamente registradas. Uma consulta real anterior pelo container retornou capa para a faixa entao detectada pela VOX.

Na verificacao ao vivo, a VOX apresentou `Meu Mundo - Thalles`. O endpoint inicialmente devolveu `not_found`: iTunes cataloga a mesma musica como `Meu Mundo (Ao Vivo) - Thalles Roberto`. Foi adicionada a equivalencia explicita `Thalles` <-> `Thalles Roberto`, sem regra de prefixo generico; o novo teste unitario passou e o container foi reconstruido. A URL 600x600 dessa capa especifica respondeu HTTP 200 no BrowserOS. Apos o rebuild, a VOX ja nao retornava uma faixa identificada; a pagina nova mostrou logo de fallback, sem link Apple. A verificacao visual da capa real carregada fica pendente para a proxima faixa identificada.

## 3. API, uso das imagens e apresentacao

Referencia oficial: https://performance-partners.apple.com/search-api

Endpoint correto: GET https://itunes.apple.com/search, nao apple.com. Parametros iniciais: term=ARTISTA TITULO, entity=song, media=music, country=BR, limit=10. Nao usar previewUrl, audio, SDK, trackViewUrl ou autorizacao de usuario. Extrair apenas trackName, artistName, collectionName, trackId e artworkUrl100. Nenhum segredo novo e necessario.

A documentacao limita imagens a promocao de conteudo da loja e exige proximidade com badge da loja. O usuario pediu para remover o link visivel Apple; portanto, mesmo com sucesso tecnico local, Preview publico/Production nao estao autorizados ate resolver a atribuicao/badge exigida e confirmar adequacao de uso. Manter esta condicao distinta da homologacao tecnica.

Apresentacao implementada: capa sem sobreposicoes e sem link Apple visivel, conforme solicitacao de 16/11/2026. O titulo principal permanece exatamente o texto VOX. Em caso de ausencia de correspondencia, erro de URL grande e URL original ou erro de ambas: logo branca da Radio 88.

Qualidade: `artworkUrl100` e a origem documentada. A transformacao restrita do sufixo `/100x100bb` para `/600x600bb` foi verificada por BrowserOS nas 12 URLs da amostra (HTTP 200) e na URL especifica de `Meu Mundo (Ao Vivo)` (600x600). O bundle com a allowlist foi reconstruido, mas a VOX nao retornava mais a faixa quando a pagina foi carregada novamente; portanto, a inspecao visual da capa dentro do `/ouvir` permanece pendente. A URL original e fallback. A transformacao so opera no host Apple permitido e nunca recebe URL do visitante.

## 4. Fluxo e arquitetura

1. AudioPlayerContext recebe musica_atual do VOX, mesmo pausado e antes do primeiro play.
2. useMusicArtwork solicita o endpoint proprio GET /api/music/artwork ao mudar a faixa.
3. O backend consulta VOX com cache curto, extrai titulo/artista e usa chave validada da faixa corrente. Nenhuma query livre Spotify/iTunes nem URL enviada pelo visitante.
4. Cache por chave normalizada -> adaptador iTunes -> comparacao de titulo-base e credito de artista -> selecao deterministica -> imagem 600x600 e fallback 100x100.
5. Frontend aceita somente resposta com trackKey da faixa que ainda esta exibida. Troca de A para B limpa capa A imediatamente, aborta requisicao antiga e ignora resposta atrasada.
6. Sem candidato seguro, metadado generico, locucao, vinheta, falha ou quota: logo. Audio e titulo nao dependem da busca de capa.

Reutilizar server/music-artwork.mjs, api/music/artwork.js e o servidor Docker scripts/feed-preview-server.mjs. Nao criar um segundo backend no Gestao para esta mesma funcao; endpoint ja reside no institucional. Sem SQL, migrations, historico de ouvintes ou upload R2.

## 5. Correspondencia tolerante a versoes, rigorosa com identidade

Normalizacao apenas para comparacao: case, acentos, espacos e pontuacao. Preservar texto original para exibicao e trackKey. Criar normalizador de titulo-base separado da chave de faixa, para nao deixar uma capa antiga passar pelo controle de concorrencia.

- Remover somente qualificadores conhecidos de versao, em grupos/sufixos: Ao Vivo, Live, Live in ..., Ao Vivo no ..., Acoustic/Acustico, Acoustic Session, Session, Radio Edit, Remastered. Registrar testes para cada regra; nunca remover qualquer texto entre parenteses indiscriminadamente.
- Preservar partes de medleys, traducoes e conteudo semantico. Exemplo: Counting My Blessings em Bencaos Que Nao Tem Fim nao e um qualificador de versao a descartar genericamente. Preservar titulos compostos como Ah Jesus / Coracao Igual ao Teu.
- Aceitar titulo-base igual e artista igual, ou artista como membro completo dos creditos separados por delimitadores conhecidos (&, virgula, feat.). Nao usar substring simples: Get nao equivale a Get Worship; artista no nome do album nao equivale a credito de artista.
- Creditos abreviados da VOX e nomes canonicos do catalogo so podem ser ligados por allowlist explicita. Caso observado: `Thalles` <-> `Thalles Roberto`; nao usar prefixo parcial como regra geral.
- Se metadados VOX tiverem mais de um artista, exigir correspondencia dos artistas informados ou devolver logo; nao ignorar arbitrariamente colaboradores.
- Preferir titulo literal + artista literal; depois titulo-base + artista literal; depois titulo-base + artista creditado com colaboradores. Versoes diferentes da mesma identidade podem desempatar sem rejeicao.
- Para multiplos candidatos equivalentes, escolher ordem deterministica por score e trackId. Nao depender apenas da ordem da busca nem popularidade nao retornada pelo contrato.
- Resultados de outra musica, artista, cover/karaoque/tributo/playback devem ser descartados. Se nenhuma identidade segura restar, logo. Se a mesma identidade tiver varios albuns/versoes, escolher um deles e permitido pela decisao aprovada.

A Mao de Deus/Marcus Salles: tanto Faz Mais Uma Vez quanto Acoustic Session ou Ao Vivo sao aceitaveis se a identidade for conferida. Um Novo Dia/Get Worship: Live, Ao Vivo ou Session sao aceitaveis. Testar explicitamente as duas.

## 6. Contrato e protecoes

Manter endpoint sem parametros de busca publica. Resposta proposta:

```json
{
  "status": "matched",
  "trackKey": "a mao de deus marcus salles",
  "artwork": {
    "source": "itunes",
    "imageUrl": "https://is1-ssl.mzstatic.com/.../600x600bb.jpg",
    "fallbackImageUrl": "https://is1-ssl.mzstatic.com/.../100x100bb.jpg",
    "trackName": "A Mao de Deus",
    "artistName": "Marcus Salles",
    "albumName": "Faz Mais Uma Vez"
  }
}
```

Alternativas: not_found, unavailable ou disabled, com artwork:null. Campos nao sao prova da gravacao exata. Metodo diferente de GET -> 405. Nao repassar corpo bruto do fornecedor.

Validar HTTPS e hosts de imagem Apple por allowlist (`is<number>-ssl.mzstatic.com`), sem aceitar hosts com sufixo enganoso. Link de loja nao e exposto no endpoint. Sem proxy/download arbitrario, cookies de ouvintes ou tokens. Frontend valida origem e formato, nao confia apenas em `artwork.source`.

Timeout externo inicial 3s; no maximo uma busca por chave por tentativa. Sem retentativas em cascata; respeitar Retry-After/429, falhas 5xx e circuito de indisponibilidade. Evitar carregar letras/descritivos e previews nao usados.

## 7. Cache, quota e serverless

Apple publica limite aproximado de 20 chamadas/minuto, sujeito a mudanca; nao planejar uma chamada por visitante. Orcamento local conservador de ate 10 buscas/minuto por processo, com cache VOX 15s, positivo 1h, negativo 10min e falha 1min como valores tecnicos iniciais a confirmar com termos vigentes. Memoria limitada a 256 chaves e single-flight por faixa.

Cache L1 em memoria e suficiente para o experimento Docker de uma instancia, NAO para garantir quota global no Vercel. Antes de Preview publico/Production: escolher cache compartilhado e trava distribuida com TTL, limiter global por fornecedor/radio, isolamento de ambientes e observabilidade de hit/miss/429. Nova infraestrutura requer aprovacao de custo; nenhuma criada por este plano. s-maxage de 15s ajuda, mas nao substitui limite global.

Nao consultar Neon ou gravar capas no R2. Sem cron, setInterval ou background apos resposta em funcao serverless.

## 8. Etapas executaveis e arquivos

### A - Adaptador backend

Alterar server/music-artwork.mjs: cliente iTunes, campos, allowlist, matcher de versoes/artistas, prioridade deterministica e flag de desativacao. Preservar validacao da faixa atual VOX, limites/cache/deduplicacao e fallback. Ajustar server/music-artwork.test.mjs com fixtures sinteticas e casos reais reduzidos. Nenhuma chamada externa nos testes unitarios.

Aceite: respostas seguras, 405, tratamento de indisponibilidade e cache; mesmos resultados em Docker e funcao api/music/artwork.js; nenhuma referencia ativa TheAudioDB no resolvedor migrado.

### B - Frontend e fallback de imagem

Alterar src/hooks/useMusicArtwork.ts e testes para source itunes e allowlists; retornar objeto com URL 600x600 e fallback original. Ajustar src/pages/Ouvir.tsx sem link Apple visivel, conforme solicitacao do usuario. Preservar src/components/TrackArtwork.tsx e tentar o fallback 100x100 antes da logo; retirar efeitos/sobreposicoes da arte, sem alterar o restante do layout.

Aceite: funciona antes do play/pausado; sem corrida A/B; imagem 600x600; falha na imagem maior tenta URL original; falha de ambas usa logo. Nenhum link Apple na interface. MiniPlayer e Plano007 intactos.

### C - Testes locais Docker

Rebuild apenas institutional no radio88-feed, com compose.plan007-local.yaml atual. Nao reiniciar/recriar banco ou alterar programas para simular musica. Usar fixtures em testes e consultas pontuais de catalogo durante programacao falada. Nao expor override de faixa ao publico.

Rodar testes Node backend, hook/UI, typecheck, lint direcionado, mini player/Plano007, build client/SSR/prerender/SEO. Validar no BrowserOS neo: /ouvir desktop e mobile, fallback durante locucao, play/pausa/volume, navegacao e ausencia de cortes. Uma resposta HEAD imagem nao equivale a QA visual.

Amostra obrigatoria: as mesmas 12 faixas dos relatorios, com resultado do matcher novo e URL de capa disponivel. Nao afirmar 12/12 aprovadas antes dessa execucao. Adicionar casos negativos: outro artista, titulo parecido, tribute, falha API, imagem quebrada, zero resultados e quota.

### D - Operacao e rollout posterior

Atualizar docs/integrations/music-artwork.md com estado real implementado e limites; anexar relatorio novo; registrar cada entrega em docs/progress.md do ecossistema. Preview somente apos aceite local, adequacao de exibicao e protecao de quota global. Production somente com autorizacao explicita posterior. Rollback via flag desligada: logo, audio e titulo continuam funcionando.

## 9. Responsabilidades

Backend/seguranca: adaptador, matching, quotas e allowlists. Frontend institucional: hook, capa, atribuicao e preservacao do design. QA/mobile: 12 faixas, concorrencia, fallback e regressao Plano007. Documentacao: contratos, evidencias e progresso. Papeis de trabalho, nao declaracao de subagentes executados.

## 10. Checklist de aceite

- [x] iTunes e unica fonte ativa; nenhum Spotify/R2 manual/Deezer automatico.
- [x] Live, Ao Vivo, Session e Acustico aceitos para mesma musica/artista.
- [x] Outro artista/outra musica/karaoque/tributo/playback nao aceitos.
- [x] Escolha deterministica entre albuns equivalentes; sem dependencia da ordem da busca.
- [x] 12 candidatos reavaliados e matcher aceita 12/12; 12 imagens 600x600 respondem HTTP 200.
- [x] Capa correta com radio pausado/antes do play; falhas de imagem e troca A/B cobertas por testes.
- [x] O credito VOX `Thalles` corresponde somente ao artista canonico iTunes `Thalles Roberto`, coberto por teste unitario.
- [x] Foto do programa no mini player, No Ar, enquetes, feed e banners preservados por regressao Plano007.
- [x] Build, testes focados e QA BrowserOS no Docker local registrados.
- [x] Rebuild Docker com allowlist `Thalles`/`Thalles Roberto`; URL 600x600 da faixa respondeu HTTP 200.
- [x] BrowserOS confirmou VOX, API e capa 600x600 renderizada no `/ouvir` para `Meu Abrigo - Davi Sacer`.
- [ ] Adequacao de uso/atribuicao e cache/limite global homologados antes do rollout publico. Link Apple removido conforme pedido; decidir alternativa de badge/atribuicao.
- [x] Progresso desta entrega registrado; nenhum deploy automatico.

## 11. Historico desta revisao

16/11/2026, conferencia cruzada: o titulo iTunes `Meu Abrigo (feat. Veronica Sacer) [Ao Vivo]` exigiu remover credito parentetico explicito feat./featuring/ft. apenas na comparacao do titulo-base. Artista principal e rejeicao de playback preservados; 14 testes Node passaram. Rebuild Docker concluido. BrowserOS confirmou VOX/titulo iguais, API matched e imagem natural 600x600 carregada, sem link Apple. A pendencia visual geral foi resolvida nesta faixa; o teste anterior de Thalles permanece historico.

16/11/2026: decisao do usuario para iTunes e versoes alternativas da mesma musica/artista. Implementacao base concluiu backend, matcher, hook, fallback 600/100, remocao do link, testes e QA Docker. O alias VOX `Thalles`/iTunes `Thalles Roberto` foi coberto por teste e incluido no rebuild Docker. URL de capa 600x600 validada; a VOX deixou de fornecer faixa identificada antes da verificacao visual final na pagina. Nenhum deploy. Link/badge Apple permanece condicao pendente para uso publico.
