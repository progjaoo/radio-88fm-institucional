# Enquetes publicas - validacao local

Decisao de produto em 11/11/2026: mensagens pertencem a uma enquete, nao a um modulo independente. Sem fila obrigatoria de aprovacao e sem bloqueio lexical automatico; a equipe autorizada decide o que le no ar. O original continua privado e imutavel; essa decisao nao habilita mural publico.

## Formatos

- vote: alternativas, sem mensagem.
- message: participacao textual obrigatoria, sem voto artificial.
- mixed: voto em alternativa e mensagem opcional.

Na Home, apenas o CTA do componente No Ar passa de OUVIR AO VIVO para PARTICIPE DO PROGRAMA quando existe enquete disponivel para o programa atual. Header e player nao mudam. A arte enviada pelo usuario fica em public/polls/enquete-doramas.png, exclusivamente no candidato local; sem alteracao de producao.

## Cadastro e privacidade

Identificacao opcional conforme configuracao. Quem se identifica preenche nome/bairro/cidade/telefone e confirma aviso de privacidade; dados sao gravados na API, nao no armazenamento do navegador. O identificador opaco do dispositivo existente e reutilizado. Reconhecimento ocorre por acao do usuario, nao por polling ou ao visitar paginas. Telefone conhecido sozinho nao autentica, nao expõe dados nem faz merge entre pessoas. Recuperacao em outro aparelho exige evolucao separada de prova de identidade; nao esta resolvida por procurar telefone.

Voto anonimo nao cria perfil de ouvinte nem autoriza marketing. Aceite de envio nao e opt-in de newsletter. Formularios mantem texto somente em memoria; o mesmo recibo e reaproveitado em retry incerto, sem disparar nova intencao. Dados pessoais e opiniao nao vao a analytics. O endpoint publico deve validar janela/estado/modo/alternativa e idempotencia no servidor, mesmo com pagina antiga aberta.

## Operacao local

Painel: http://127.0.0.1:5181/enquetes. Institucional: http://127.0.0.1:8086/. API:3012, PostgreSQL Docker do projeto radio88-feed. Nenhum deploy/Neon nesta entrega. A publicacao local de snapshot deve ser explicita; leitura publica nao consulta SQL. O snapshot local e ponte de teste, nao infraestrutura de release serverless pronta.

QA: testar cadastro novo, reconhecimento pelo mesmo dispositivo, envio anonimo, mensagem sem voto, voto+mensagem, repeticao do mesmo envio, conflito de payload, janela fechada e alternativa de outra enquete. Abrir resultados no painel e conferir nome/bairro/texto e agregados reais. A fixture de demonstracao usa a arte e pergunta fornecidas, sem afirmar que este tema pertence oficialmente a determinado programa. O programa do teste e escolhido exclusivamente para a janela local vigente.

Limitacoes de regressao: a suite do institucional tinha teste SEO esperando logo padrao em todas as rotas, mas artigos Feed usam suas imagens; este teste continua falhando e nao foi alterado para esconder o problema. Novo formulario tem testes de mensagem sem voto, cadastro reconhecido e idempotencia do retry; dispositivos fisicos e outros navegadores exigem validacao manual antes de release.
