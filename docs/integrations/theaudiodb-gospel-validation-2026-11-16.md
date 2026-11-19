# TheAudioDB - validacao de repertorio gospel

Data: 16/11/2026. Execucao real pelo MCP BrowserOS neo. Sem alteracao de runtime, Docker, dados ou deploy nesta rodada.

## Amostra e fonte

Duas faixas solicitadas pelo usuario + dez da selecao semanal Billboard Brasil publicada em 14/11/2026 (semana de 10 de novembro): https://billboard.com.br/gospel-10-musicas-mais-ouvidas-nesta-semana/

E uma selecao publicada, nao um levantamento proprio nem ranking absoluto de todas as plataformas. A fonte inclui musica catolica na selecao gospel.

## Metodo

GET https://www.theaudiodb.com/api/v1/json/123/searchtrack.php?s=ARTISTA&t=TITULO via navegacao BrowserOS. 12 consultas originais, 12 variacoes diagnosticas e 1 controle positivo: 25 consultas. Cada consulta gospel devolveu JSON {"track":null}, nao apenas uma imagem ausente. Nao foi observado erro de quota nessas respostas. Nao remover qualificadores automaticamente em producao: variantes aqui sao diagnostico, nao candidatos aprovados.

| Musica | Artista | Titulo alternativo testado | Resultado original e alternativo |
| --- | --- | --- | --- |
| A mão de Deus | Marcus Salles | A Mao de Deus (Marcus Salles) | track:null |
| Um novo dia | Get Worship | Um Novo Dia (Get Worship) | track:null |
| Ah, Jesus / Coração Igual ao Teu | Julliany Souza | Coracao Igual ao Teu (Julliany Souza) | track:null |
| Quem É Esse? | Julliany Souza | Quem E Esse (Julliany Souza) | track:null |
| A Casa É Sua | Casa Worship | A Casa E Sua (Casa Worship) | track:null |
| Bondade de Deus | Isaias Saad | Bondade de Deus (Isaías Saad) | track:null |
| Bênçãos Que Não Têm Fim (Counting My Blessings) | Isadora Pompeo | Bencaos Que Nao Tem Fim (Isadora Pompeo) | track:null |
| É Tudo Sobre Você / Ser Mudado | Morada | E Tudo Sobre Voce (Morada) | track:null |
| Santo Pra Sempre | Fernandinho | Santo Pra Sempre (Ao Vivo) (Fernandinho) | track:null |
| Tu És + Águas Purificadoras (Ao Vivo) | fhop music | Tu Es (fhop music) | track:null |
| Deus de Obras Completas | Kemilly Santos | Deus de Obras Completas (Ao Vivo) (Kemilly Santos) | track:null |
| Terra Seca | Fraternidade São João Paulo II | Terra Seca (Fraternidade Sao Joao Paulo II) | track:null |

Controle Yellow - Coldplay: strTrack=Yellow, strArtist=Coldplay, strAlbum=Parachutes; strTrackThumb=https://r2.theaudiodb.com/images/media/track/thumb/syswqy1340354244.jpg. Isto comprova retorno de URL, nao uma auditoria visual/licenciamento da imagem.

## Conclusao

0/12 faixas gospel com registro; 0/12 com URL de imagem. Nenhuma correspondencia a validar visualmente. As variantes nao melhoraram o resultado. O controle retornou faixa e imagem. Conclusao limitada: TheAudioDB nao atende a ESTA amostra e nao deve ser aprovado como unica fonte para o repertorio da radio. Nao prova ausencia definitiva no catalogo nem cobertura zero de todo gospel.

Proximo passo recomendado no Plano008: testar iTunes com a mesma amostra e validar titulo/artista/versao/imagem, antes de substituir o adaptador. Nao foi feita nenhuma consulta iTunes nesta rodada, nem troca automatica do fornecedor. O endpoint correto e https://itunes.apple.com/search; nao apple.com. Confirmar condicoes de exibicao e atribuicao do fornecedor antes do rollout publico.

