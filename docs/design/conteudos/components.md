# Conteúdos - Proposta Visual

Estado: protótipo para aprovação, não conectado à API. Plano: [012](../../../plans-ecossistema/plan-012-conteudos-youtube.md). Registro: [progress.md](../../../progress.md).

## Direção

Preservar Montserrat para títulos/navegação e Archivo para leitura, header preto arredondado, fundo branco, azul institucional, CTAs vermelho/amarelo e mini player azul. A seção é editorial, não um dashboard; separação por espaço e linhas leves, sem caixa envolvendo cada grupo.

O header mantém **INÍCIO, NOSSA RÁDIO, CONTEÚDOS, FEED e EQUIPE** e os três botões atuais. Apenas DEBATE vira CONTEÚDOS. Ordem dos cinco links está representada no protótipo para aprovação.

## Componentes

| Componente | Proposta | Acessibilidade/estados |
| --- | --- | --- |
| Header e Conteúdos | Header fixo de 64 px, com logo e CTAs do padrão; `NavigationMenu` existente com painel de 336 px, ícones e rótulos | Hover 150 ms, clique, teclado e Escape; ativo azul; sem deslocar conteúdo; mobile expande por toque |
| Categorias | Tabs segmentado compacto do shadcn/Radix; Archivo, hover em azul suave e aba ativa no mesmo azul de Anuncie, com texto branco | `TabsList`, `TabsTrigger` e `TabsContent` associados; setas movem o foco, Enter ou Espaço selecionam; 32 px com mouse e 44 px em telas de toque. O branco sobre esse azul tem contraste de aproximadamente 3,7:1, abaixo de 4,5:1 para texto pequeno. |
| Busca | Input 44 px, ícone e label visível | Teclado, foco, busca sem acento; preserva categoria |
| Ano/Mês/Dia | `Select` existente com `SelectGroup`, rótulos, ícones Lucide e hover azul. Nenhuma caixa em volta dos filtros | Calendário válido; Dia desabilitado até Ano/Mês; opções em portal, com foco e navegação por teclado |
| Mais assistido | Miniatura 16:9 à esquerda, informação/CTA à direita | Empilha no mobile; somente reproduz por ação na implementação; protótipo usa aviso acessível, nunca alert nativo |
| Grade | Seis itens elegíveis quando disponíveis, em 3/2/1 colunas; abaixo, **Ver mais no YouTube** abre a playlist da categoria | Título não truncado; miniaturas decorativas quando o botão tem nome; foco e estado vazio; filtros restritos não são completados com itens fora da seleção |
| Elementos persistentes | `Footer`, `SocialRail`, botão de WhatsApp, ícone de microfone e `AppDownloadLinks` reutilizados; representação do player com as classes institucionais | O player real não foi editado; nenhuma transmissão é iniciada pelo protótipo |

## Escala e Responsividade

- Conteúdo máximo de 1440 px; margem de segurança para a barra social no desktop e margem interna de 16 px no celular.
- Título de 36 a 48 px, título do destaque de 20 a 30 px, cards de 16 px.
- Espaçamentos 8/12/16/24/32 px, `Input` e `Select` de 44 px, dropdown 336 px. Controles usam `--input`, `--ring`, `--radius` e cores institucionais.
- Navegação desktop cede ao menu mobile quando os cinco links e os CTAs não cabem; validar 1024 e 1366 px, sem apertar excessivamente os textos.
- Animação discreta nas miniaturas e menu; respeitar `prefers-reduced-motion`; texto normal usa azul escuro legível sobre branco, sem alterar os tokens globais do site nesta etapa.

## Dados Demonstrativos

Os títulos e IDs de miniaturas foram observados no canal público durante a preparação da proposta. Datas, duração e visualizações do protótipo são amostras de interface, não uma aferição da API ou ranking real. A nota fica no fim da página, fora do topo. O clique em Assistir informa que o protótipo não reproduz vídeos. Não copiar esses fixtures para o catálogo funcional.

## Aprovação

Validar dropdown, permanência de Feed/Equipe, ordem da navegação, barra de categorias, filtros de data e destaque/grade. Depois da aprovação, conectar a implementação conforme gates do plano, com credenciais somente no servidor e testes no Docker local.
