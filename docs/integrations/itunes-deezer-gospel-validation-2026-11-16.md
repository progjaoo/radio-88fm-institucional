# Plano 008 - teste iTunes e Deezer

Data: 16/11/2026. Teste de APIs independente do VOX; programacao sem musica nao interfere. Nenhum runtime alterado, sem deploy.

## Metodo e evidencias

Mesmas 12 musicas do teste TheAudioDB: 2 solicitadas + 10 da selecao Billboard de 14/11/2026. Fonte: https://billboard.com.br/gospel-10-musicas-mais-ouvidas-nesta-semana/

BrowserOS confirmou resposta JSON Deezer, controle Coldplay e busca textual Marcus Salles. A navegacao ao endpoint iTunes resultou em aba vazia (resposta oferecida como arquivo), portanto as consultas de API foram executadas pelo Node, nao por script injetado no navegador. Script reproduzivel: scripts/validation/check-artwork-providers.mjs. Metadados reduzidos e URLs estao em itunes-deezer-gospel-results-2026-11-16.json. Nenhum audio, letra ou arquivo de capa foi baixado.

iTunes: GET https://itunes.apple.com/search?term=ARTISTA+TITULO&entity=song&country=BR&limit=10. Deezer: GET https://api.deezer.com/search?q=ARTISTA+TITULO&limit=10. As 12 buscas Deezer iniciais com artist:"..." track:"..." vieram vazias nesta execucao; as 12 buscas textuais encontraram candidatos. Nao concluir ausencia de catalogo usando apenas a consulta estruturada.

36 consultas iniciais no Node (12 iTunes + 24 Deezer), alem dos controles exploratorios BrowserOS. 24 verificacoes HEAD de URLs selecionadas: todas HTTP200 image/jpeg. iTunes: artworkUrl100 original, sem substituir tamanho na URL. Deezer: album.cover_xl (URL 1000x1000). HEAD confirma disponibilidade/tipo, nao correção visual nem direitos de uso.

## Resultado

| Musica | Artista | iTunes titulo/artista exatos | Deezer titulo/artista exatos | Candidato relacionado com URL em ambos |
| --- | --- | --- | --- | --- |
| A mão de Deus | Marcus Salles | Sim | Sim | Sim |
| Um novo dia | Get Worship | Nao: revisar versao/credito | Nao: revisar versao/credito | Sim |
| Ah, Jesus / Coração Igual ao Teu | Julliany Souza | Sim | Sim | Sim |
| Quem É Esse? | Julliany Souza | Sim | Nao: revisar versao/credito | Sim |
| A Casa É Sua | Casa Worship | Sim | Nao: revisar versao/credito | Sim |
| Bondade de Deus | Isaias Saad | Sim | Sim | Sim |
| Bênçãos Que Não Têm Fim (Counting My Blessings) | Isadora Pompeo | Sim | Sim | Sim |
| É Tudo Sobre Você / Ser Mudado | Morada | Nao: revisar versao/credito | Nao: revisar versao/credito | Sim |
| Santo Pra Sempre | Fernandinho | Nao: revisar versao/credito | Nao: revisar versao/credito | Sim |
| Tu És + Águas Purificadoras (Ao Vivo) | fhop music | Nao: revisar versao/credito | Sim | Sim |
| Deus de Obras Completas | Kemilly Santos | Nao: revisar versao/credito | Nao: revisar versao/credito | Sim |
| Terra Seca | Fraternidade São João Paulo II | Sim | Sim | Sim |

Cobertura de candidatos: 12/12 em ambos. Correspondencia estrita normalizada: iTunes 7/12; Deezer 6/12. Isso nao e taxa de capa correta em producao: ate titulos iguais podem apontar para albuns/versoes diferentes.

A Mao de Deus: ambos possuem Faz Mais Uma Vez e Acoustic Session, alem de Ao Vivo; nao escolher album pelo primeiro resultado. Um Novo Dia: ambos retornam Live/Ao Vivo/Session. Outros exemplos de cautela: Santo Pra Sempre (Ao Vivo no Mineirao) vs Acustico; Deus de Obras Completas ao vivo/acustico/playback; fhop inclui Hamilton Rabelo no credito Apple. Covers e resultados de outros artistas tambem aparecem e devem ser rejeitados.

## Recomendacao tecnica

Avaliar iTunes primario -> Deezer secundario -> logo, com matching conservador, timeout e cache compartilhado. Consultar secundario so em ausencia, indisponibilidade ou candidato rejeitado; nao alternar capas aleatoriamente. Se houver candidatos ambiguos nos dois, manter logo. ISRC/album/versao estruturados da automacao aumentariam a certeza. O teste comprova viabilidade de busca e URL, nao autoriza automaticamente o uso comercial das imagens. Revalidar termos/credito/link antes do rollout. Nao foi substituida a integracao TheAudioDB nesta tarefa.

Fontes tecnicas: https://performance-partners.apple.com/search-api e respostas publicas api.deezer.com presentes no JSON. A redundancia continua proposta, nao implementada.
