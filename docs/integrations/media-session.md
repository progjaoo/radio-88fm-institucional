# Controles de audio em background

O audio continua em uma unica instancia de HTMLAudioElement. Nao iniciar automaticamente e nao criar outro player para Safari.

- Metadata de sistema usa uma unica imagem PNG colorida de 512x512, servida por HTTPS em URL versionada para evitar depender do host local quando o Safari envia a arte ao Now Playing. BrowserOS confirmou que o arquivo oficial responde e decodifica como imagem 512x512.
- Fonte de musica continua sendo a VOX. Identificadores da propria emissora/intervalo/valor vazio recebem o titulo `Radio 88 FM - O Som do Ceu!` com acentuacao no codigo. Nomes reais de musicas nao sao alterados por essa normalizacao.
- Metadata e estado `playing` sao publicados sincronicamente no gesto de play, antes de iniciar o mesmo elemento de audio. Eventos play, playing, loadedmetadata, loadeddata, canplay, pause, pageshow e retorno da aba reaplicam os dados. A troca de faixa continua atualizando o titulo mesmo em pausa; polling em aba oculta continua suspenso.
- Play, pause e stop dos controles nativos usam o mesmo fluxo do site. Acoes/metadados nao suportados sao opcionais e nao interrompem streaming. Nao oferecer seek ficticio para uma radio ao vivo.

## Safari iPhone e rolagem

- O viewport declara `viewport-fit=cover`. Nas rotas `/ouvir` e `/assistir`, `html` e `body` acompanham o azul de transmissão e duas faixas fixas opacas permitem ao Safari 26 amostrar a cor nas bordas superior/inferior; elas só aparecem em navegadores WebKit para iOS. A meta `theme-color` acompanha a rota nas versões que ainda a respeitam. Nas outras páginas, o tema retorna ao branco.
- O mini player usa o mesmo azul sólido institucional `#1360E8` da área principal de transmissão, sem gradiente.
- O cabeçalho respeita a safe area superior mais uma faixa mínima de 12px; o mini player mantém `safe-area-inset-bottom`. As faixas de amostragem não recebem eventos de ponteiro.
- O recorte horizontal deixou de ser aplicado a `html`, `body` e `#root`; ficou restrito ao conteudo principal para evitar transformar o documento raiz em uma area de rolagem atipica no Safari.
- O shell usa `min-height: 100svh` com fallback `100vh`, sem altura fixa e sem `overflow-y` no documento. O mini player continua fixo, com o espacamento seguro existente.
- O titular relatou que, no Simulator aberto para a validacao, o titulo apareceu no controle do iOS, mas a logo nao. A correçao de arte tem uma URL HTTPS unica e versionada para o novo ciclo de validacao. Isso ainda nao e confirmacao de que a imagem apareceu no Now Playing do Simulator.

## Validacao

Testes cobrem titulo neutro, musica mesmo pausada, imagem PNG unica/HTTPS, publicacao sincrona no gesto de play, play/pause nativos, limpeza de handlers e falhas da API Media Session. BrowserOS confere o objeto de metadata, o estado e a disponibilidade/decodificacao da imagem; o teste nao simula a Ilha Dinamica.

No Simulator/iPhone, abrir o site HTTPS ou o container local em Safari: tocar play por gesto, enviar Safari ao background, conferir logo e titulo, pausar/retomar pelos controles do sistema e retornar sem duplicar audio. Testar primeiro sem musica/identificador da emissora e depois com musica. Tambem deslizar a pagina ate o rodape e voltar; a barra fixa nao deve impedir a rolagem do documento. BrowserOS/Chromium desktop nao prova o comportamento nativo do Safari iOS.

Safari iOS 26.1 no iPhone 17 Pro Max Simulator, rota local `/ouvir`: captura confirmou a faixa superior azul e a barra inferior azulada (nao branca). No BrowserOS, `/` permanece branco e `/ouvir` azul; as faixas ficam ocultas no Chromium. A capa do Now Playing e o gesto de scroll ainda nao foram validados manualmente.

## Referencias

- [Safari e Media Session, Apple WWDC21](https://developer.apple.com/videos/play/wwdc2021/10189/).
- [Especificacao Media Session, W3C](https://www.w3.org/TR/mediasession/).
