# Base local do Institucional no Docker

A referência para homologação local é o [Institucional em `127.0.0.1:8086`](http://127.0.0.1:8086/), no projeto Docker `radio88-feed`. É a base para evoluir o site, não um artefato aprovado para produção.

## Atualização de Conteúdos em 18/11/2026

- Apenas o serviço `institutional` foi reconstruído e substituído. A imagem anterior está identificada pela tag `radio88-feed-institutional:before-conteudos`. Os IDs e horários de início do painel, API e PostgreSQL não mudaram. O volume do site, o endereço, a rede, a configuração do webhook e o release ativo do Feed foram preservados.
- O Compose [do Institucional local](../compose.institutional-local.yaml) tornou reproduzível o serviço que antes dependia de um arquivo temporário. Seus pré-requisitos são a rede e o volume da stack existente, o arquivo `.env.feed-preview.compose` do Gestão que configurou o R2 Preview e `.env.institutional.local` do Institucional (ignorado pelo Git). Configure uma chave YouTube compatível somente no ambiente de runtime antes de subir o serviço.

```sh
export INSTITUTIONAL_LOCAL_ENV_FILE="$PWD/.env.institutional.local"
docker compose --env-file "$GESTAO_PREVIEW_COMPOSE_ENV" -f compose.institutional-local.yaml build institutional
docker compose --env-file "$GESTAO_PREVIEW_COMPOSE_ENV" -f compose.institutional-local.yaml up -d --no-deps --no-build --wait institutional
```

`GESTAO_PREVIEW_COMPOSE_ENV` aponta para o `.env.feed-preview.compose` do Gestão usado para essa stack. Se necessário, a imagem anterior pode ser reetiquetada como `radio88-feed-institutional:local` e iniciada com a mesma definição, sem rebuild e sem remover volumes.

## Base original conferida em 18/11/2026

| Serviço | Container | Acesso local |
| --- | --- | --- |
| Institucional | `radio88-feed-institutional-1` | `127.0.0.1:8086` → `8080` |
| Painel Gestão | `radio88-feed-panel-1` | `127.0.0.1:5181` → `80` |
| API Gestão | `radio88-feed-api-1` | `127.0.0.1:3012` → `3010` |
| PostgreSQL | `radio88-feed-postgres-1` | `127.0.0.1:55471` → `5432` |

- Os quatro serviços estavam `healthy`. A imagem em execução no Institucional era `radio88-feed-institutional:local`, ID `sha256:b8fefff504ad29006f89df9b520d8df9a43be382c44c38f9aa6741875ece7ad7`.
- A home foi conferida no BrowserOS com seção de programação, mini player com volume e links das lojas de aplicativos, e barra de redes sociais. `/`, `/programacao`, `/ouvir`, `/anuncie` e `/feed` responderam HTTP `200` com HTML; `/__preview/healthz` respondeu `200` com JSON. Isso não valida todas as integrações nem o conteúdo de todas as rotas.
- Na imagem original, o header ainda não tinha o menu Conteúdos, e `/api/debates` e `/api/youtube/content` retornavam `404`. Após a atualização acima, o [fluxo Conteúdos](integrations/conteudos-youtube.md) está instalado no site funcional.

## Preservação e próximas evoluções

1. Em caso de parada, use **Start** no grupo `radio88-feed` do Docker Desktop para iniciar os containers existentes. Isso mantém imagens, configuração e volumes, sem reconstruir a stack.
2. Use a definição Compose do Institucional acima, com os mesmos valores de Preview e sem versionar segredos. Antes de substituir a imagem em execução, identifique a versão anterior para retorno e valide o release candidato do Feed.
3. Para mudanças só no Institucional, atualize apenas esse serviço e preserve o painel, a API local e os volumes. Não use `docker compose down -v`. Na sequência, confira saúde e navegação em `8086`; valide também as integrações atingidas pela mudança, como feed, No Ar, enquetes ou player.
4. Trate a publicação como etapa separada: somente após aprovação no ambiente local, revisão das variáveis de produção e validação com os dados e serviços corretos. Não promova o container de homologação nem seus dados de teste.
