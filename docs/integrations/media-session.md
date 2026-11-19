# Controles de audio em background

O audio continua em uma unica instancia de HTMLAudioElement. Nao iniciar automaticamente e nao criar outro player para Safari.

- Metadata de sistema usa logo colorida PNG de mesma origem, com dimensoes declaradas 512, 192 e 180. SVG removido dessa lista. Favicons/touch icon existentes preservados.
- Fonte de musica continua sendo a VOX. Identificadores da propria emissora/intervalo/valor vazio recebem o titulo `Radio 88 FM - O Som do Ceu!` com acentuacao no codigo. Nomes reais de musicas nao sao alterados por essa normalizacao.
- Eventos loadedmetadata, playing, pageshow e retorno da aba reaplicam a metadata. Estado playing/paused segue eventos reais do audio. Dados publicos continuam atualizando antes do primeiro play; polling em aba oculta continua suspenso para economizar recursos.
- Play, pause e stop dos controles nativos usam o mesmo fluxo do site. Acoes/metadados nao suportados sao opcionais e nao interrompem streaming. Nao oferecer seek ficticio para uma radio ao vivo.

## Validacao

Testes cobrem titulo neutro, musica mesmo pausada, raster artwork, play/pause nativos, limpeza de handlers e falhas da API Media Session. Conferir no BrowserOS a metadata real e a troca de estado sem criar duas instancias.

No iPhone fisico, abrir o site HTTPS publicado em Safari e Chrome: tocar play por gesto, voltar a tela inicial/bloquear, conferir logo e titulo, pausar/retomar pelos controles do sistema e retornar ao site sem duplicar audio. Testar primeiro sem musica/identificador da emissora e depois com musica. O sistema operacional decide a apresentacao final; teste no Chromium desktop nao prova o comportamento fisico do Safari iOS.

## Referencias

- [Safari e Media Session, Apple WWDC21](https://developer.apple.com/videos/play/wwdc2021/10189/).
- [Especificacao Media Session, W3C](https://www.w3.org/TR/mediasession/).
