# Programacao / No Ar - validacao local (09/11/2026)

Painel: http://127.0.0.1:5181/programas
Institucional: http://127.0.0.1:8086/
Grade: http://127.0.0.1:8086/programacao

Projeto Docker radio88-feed, servico institucional-1. Integracao com R2 de Preview, PostgreSQL Docker e API 3012; nenhuma configuracao de producao alterada.

1. Salvar programa com nome, descricao, nomes publicos e imagem (recomendado 1920x1080, 16:9, ate 10 MiB).
2. Criar dias/horarios com vigencia; conflitos sao recusados. Vincular contas separadamente para conceder escopo de programa.
3. Se necessario, criar excecao: outro programa ou interrupcao em intervalo determinado.
4. Clicar Publicar grade. Salvar nao altera o snapshot publico automaticamente. Se falhar, usar retry.
5. Conferir secao No Ar abaixo do card azul e pagina Programacao. Transicoes respeitam America/Sao_Paulo. No horario vazio/expirado/erro, estado neutro; player continua disponivel. Por ajuste solicitado em 09/11, o botao do Header permanece somente OUVIR AO VIVO, sem nome/horario do programa, no desktop e no menu mobile.

Fixture sintetica publicada localmente: Programa de homologacao local, nomes Locutor de teste e Apresentadora de teste; segunda 05:00-09:30 e segunda-sexta 14:00-18:00 entre 09-13/11/2026. Imagem de estudio enviada pelo painel ao bucket radio88-feed-preview-public. Nao migrar fixture para producao.

Provider compartilhado usa GET publico R2-backed, sem consulta PostgreSQL, refetch visivel a cada 60 s e cache HTTP 30 s/memoria API 15 s. O snapshot expira em 30 dias; republicar antes. Flags VITE_ON_AIR_ENABLED e VITE_PROGRAMMING_API_URL devem constar no build Docker; desligadas por padrao. Nunca colocar credenciais R2 no frontend.

## Integracao do mini player (12/11/2026)

O servidor de conferencia isolada do mini player na porta 8093 tinha sido iniciado com VITE_ON_AIR_ENABLED=false. Isso ocultava o card No Ar e acionava o estado neutro da barra. O componente e as rotas do Plano 007 nao foram removidos.

- Executar `npm run dev:plan007` neste checkout para a conferencia integrada em http://127.0.0.1:8093/. Requer API Docker na porta 3012. O config local habilita a grade e encaminha somente `/api/public/programming` e `/api/public/polls` pela mesma origem, sem ampliar CORS da API. Nao usar esse config para build ou deploy.
- O container institucional do projeto radio88-feed usa `compose.plan007-local.yaml` deste checkout como ultimo override, com `INSTITUTIONAL_PLAN007_SOURCE` apontando para o checkout atual. O override passa as flags como argumentos de build e como ambiente de runtime. Somente ambiente em runtime nao altera as flags incorporadas pelo Vite.
- O comando Compose continua exigindo o arquivo privado de ambiente e os overrides locais existentes do Gestao. A variavel FEED_PREVIEW_IMAGE_ID tambem precisa ser definida ao interpretar o Compose-base.
- Institucional Docker permanece em http://127.0.0.1:8086/, API em 3012 e painel em 5181. Nao recriar API/PostgreSQL/painel para alterar apenas a interface institucional.
- Card No Ar e mini player compartilham o mesmo ProgrammingProvider. Com grade valida, ambos mostram o programa/horario atual; sem grade confiavel, nao inventam um programa.
- O microfone da barra usa vermelho/azul em 1,4 s. Com preferencia de movimento reduzido, troca somente a cor em 2,8 s, sem pulsar opacidade nem deslocar elementos.
- Ajuste visual final: icone de 24 px no desktop/20 px no mobile; rotulo de 10/8 px e vermelho mais vivo #ff172b, sem mudar a altura da barra.
- A imagem Docker local passa a copiar os arquivos com propriedade node:node, evitando uma segunda camada com chown recursivo de toda a aplicacao. Isso preserva o usuario nao privilegiado e reduz escrita/cache em rebuilds.
- O botao PARTICIPE DO PROGRAMA pertence ao card e aparece somente com enquete aberta no periodo correto. A enquete de demonstracao anterior estava encerrada; nao foi reaberta automaticamente.
- Validacao automatizada adicional: 3 testes de integracao para programa compartilhado, CTA de enquete aberta e rejeicao de enquete expirada. Total direcionado 29/29, incluindo formulario publico e ciclo de audio.

Nenhuma configuracao de producao, banco Neon ou dado de ouvintes foi alterado nesta integracao.

Conferencia final no BrowserOS: portas 8093 e 8086 mostrando Favorito, 15:00 as 17:00, no card e na barra. Rotulo NO AR e microfone de 24 px, vermelho rgb(255,23,43) alternando com azul rgb(3,137,226); preferencia de movimento reduzido identificada e ciclo de 2,8 s confirmado. Container institucional-1 reconstruido e iniciado com o candidato integrado, preservando API/painel/PostgreSQL. Falha inicial de snapshot do cache Docker resolvida por rebuild sem cache, sem prune ou remocao de volumes. Nao havia enquete aberta para Favorito; aguardando autorizacao do usuario para criar demonstracao separada, sem reabrir a enquete anterior ou criar votos.

Validacao: novos testes No Ar 8/8; typecheck e build/prerender/SEO aprovados. Suite institucional 159/160: falha preexistente seoConfig.test.ts:34, reproduzida no checkout anterior. QA mobile/Safari, ociosidade de 15 minutos e topologia hospedada permanecem gates. Nao houve commit/push/deploy/Neon.
