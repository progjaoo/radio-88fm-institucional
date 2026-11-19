import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent, setAnalyticsConsent, type AnalyticsConsentState } from "@/services/analytics/consent";

const contact = "comercial@grupogtf.com.br";
const linkStyle = "font-semibold text-radio-blue underline underline-offset-4 hover:text-radio-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
const email = <a className={linkStyle} href={`mailto:${contact}`}>{contact}</a>;
const sections: { id: string; title: string; content: ReactNode }[] = [
  { id: "responsavel", title: "Quem é responsável", content: <>
    <p>A Rádio 88 FM, identificada pelo CNPJ <strong>31.232.747/0001-07</strong>, é responsável pelas decisões sobre o tratamento de dados pessoais nas atividades descritas nesta política. Nosso endereço é Rua Moacyr de Paula Lobo, 104, Limoeiro, Volta Redonda – RJ.</p>
    <p>O canal de contato para assuntos de privacidade é {email}.</p>
  </> },
  { id: "dados", title: "Dados e finalidades", content: <>
    <ul className="list-disc pl-5">
      <li><strong>Navegação e áudio:</strong> dados técnicos de conexão, como endereço IP, navegador, dispositivo, data e horário das requisições, podem ser tratados para entregar páginas e transmissões, diagnosticar falhas e proteger os serviços.</li>
      <li><strong>Cadastro e campanhas:</strong> nome, telefone, cidade e bairro, conforme os campos e regras de cada formulário, permitem registrar a participação, reconhecer o cadastro e realizar contatos operacionais relacionados à ação escolhida.</li>
      <li><strong>Enquetes:</strong> alternativa escolhida, opinião enviada, identificação opcional quando disponível, data e horário do envio e registros técnicos necessários à integridade da participação.</li>
      <li><strong>Atendimento:</strong> informações que você fornecer por e-mail, telefone ou WhatsApp são usadas para responder à solicitação.</li>
      <li><strong>Métricas:</strong> páginas acessadas, interações e desempenho podem ser tratados para avaliar e melhorar o site, respeitando as preferências disponíveis nesta página.</li>
    </ul>
    <p>Conforme a finalidade, o tratamento pode se apoiar no consentimento, na execução de uma relação solicitada por você, no cumprimento de obrigações legais, no exercício regular de direitos ou em interesses legítimos, observadas as exigências da Lei Geral de Proteção de Dados (LGPD). Aceitar uma participação não significa autorizar toda forma de uso dos seus dados.</p>
    <p>O recebimento de novidades ou mensagens de marketing depende de uma escolha específica, quando oferecida. Você pode não autorizá-las e ainda assim participar de ações que não dependam dessa autorização.</p>
  </> },
  { id: "enquetes", title: "Enquetes e participações", content: <>
    <p>Quando a enquete permitir, você pode votar sem informar nome ou telefone. A identificação opcional serve para vincular a participação ao cadastro; campos obrigatórios e condições são indicados antes do envio. Uma participação sem identificação não equivale à ausência de registros técnicos de segurança.</p>
    <p>Opiniões enviadas pelo formulário ficam disponíveis à equipe autorizada e não são publicadas automaticamente no site. A participação pode ser avaliada para uso editorial no programa, inclusive leitura no ar; evite incluir documentos, informações sensíveis ou dados de outras pessoas no texto.</p>
    <p>O registro em uma enquete não representa inscrição automática em sorteios nem autorização para marketing. Ações e sorteios, quando oferecidos, têm regras próprias. Encerrar uma enquete interrompe novos envios, mas não apaga automaticamente o histórico.</p>
  </> },
  { id: "alexa", title: "Rádio 88 FM na Alexa", content: <>
    <p>A skill da Rádio 88 FM na Alexa apenas reproduz a transmissão ao vivo. Essa função não exige criar um cadastro de ouvinte na rádio, vincular uma conta ou fornecer nome, telefone, e-mail ou endereço à rádio por meio da skill.</p>
    <p>Os comandos de voz e o uso do dispositivo Alexa são tratados pela Amazon segundo suas configurações e políticas de privacidade. O serviço de transmissão pode tratar dados técnicos de conexão necessários à entrega do áudio. Ouvir a rádio pela Alexa não cadastra o ouvinte automaticamente em enquetes, campanhas ou sorteios.</p>
    <p>Consulte também as <a className={linkStyle} href="https://www.amazon.com.br/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ" target="_blank" rel="noopener noreferrer">informações de privacidade da Alexa (nova aba)</a>.</p>
  </> },
  { id: "publicidade", title: "Publicidade na programação", content: <p>A Rádio 88 FM veicula comerciais de empresas que pagam para anunciar na rádio.</p> },
  { id: "cookies", title: "Cookies e preferências", content: <>
    <p>O site usa armazenamento do navegador para preferências de privacidade, controle de exibição de formulários e identificadores técnicos que ajudam a reconhecer o dispositivo e evitar participações duplicadas. Os campos de nome, telefone, cidade, bairro e opinião dos formulários não são persistidos por esses controles do site no navegador.</p>
    <p>Quando habilitados, o Google Analytics e as métricas da Vercel ajudam a avaliar o uso e o desempenho do site. O Google Analytics utiliza eventos e identificadores de navegação. Os campos pessoais do cadastro e o texto das opiniões não fazem parte dos eventos de Analytics implementados no site. Identificadores técnicos não devem ser confundidos com dados necessariamente anônimos.</p>
    <p>Você pode permitir ou recusar novas medições opcionais abaixo. A escolha vale para este navegador e não interfere na reprodução da rádio nem na participação em enquetes. Para remover cookies já armazenados, use também as configurações do navegador. Limpar o armazenamento pode remover a preferência e o reconhecimento do cadastro neste dispositivo.</p>
    <p>Vídeos e serviços incorporados de terceiros podem usar seus próprios cookies e identificadores, segundo as respectivas políticas e controles.</p>
  </> },
  { id: "servicos", title: "Serviços externos e compartilhamento", content: <>
    <p>A operação envolve fornecedores de hospedagem, banco de dados, armazenamento, segurança, e-mails, transmissão de áudio e métricas. Informações necessárias a essas finalidades podem ser tratadas por esses prestadores e pela equipe autorizada. Dados também podem ser fornecidos quando houver obrigação legal ou necessidade de exercício de direitos.</p>
    <p>Vídeos do YouTube, redes sociais, lojas de aplicativos, WhatsApp e serviços da Amazon estão sujeitos às políticas desses serviços. Para localizar capas musicais, a integração consulta título e artista da faixa; isso não exige uma conta musical do ouvinte.</p>
    <p>Prestadores podem operar infraestrutura fora do Brasil. O tratamento e eventuais transferências internacionais devem observar os requisitos aplicáveis da LGPD. Você pode solicitar informações sobre o compartilhamento relacionado aos seus dados pelo canal de privacidade.</p>
  </> },
  { id: "seguranca", title: "Segurança e conservação", content: <>
    <p>Adotamos controles de acesso por permissão, autenticação administrativa e medidas técnicas para limitar o acesso às pessoas autorizadas. Nenhum serviço conectado à internet é totalmente livre de riscos.</p>
    <p>Os dados são conservados pelo período necessário à finalidade informada e às obrigações legais, à prevenção de fraude e ao exercício de direitos, quando aplicáveis. Não há um prazo único para todos os registros nem promessa de exclusão imediata. Você pode solicitar avaliação da necessidade de conservação e informações sobre os prazos aplicáveis ao seu caso.</p>
  </> },
  { id: "direitos", title: "Seus direitos", content: <>
    <p>Nos termos da LGPD, você pode solicitar confirmação e acesso aos dados, correção, informações sobre uso e compartilhamento, anonimização, bloqueio ou exclusão quando cabíveis, portabilidade conforme a regulamentação, oposição e revogação do consentimento. Também pode pedir informações sobre decisões exclusivamente automatizadas que afetem seus interesses, quando aplicável.</p>
    <p>O atendimento é gratuito. Poderemos solicitar apenas informações necessárias para verificar sua identidade e proteger seus dados contra pedidos indevidos. A análise considera os prazos legais e as hipóteses de conservação obrigatória. Se necessário, você pode recorrer à <a className={linkStyle} href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares" target="_blank" rel="noopener noreferrer">Agência Nacional de Proteção de Dados – ANPD (nova aba)</a>.</p>
  </> },
  { id: "criancas", title: "Crianças e adolescentes", content: <p>O tratamento de dados de crianças e adolescentes deve observar seu melhor interesse e as exigências legais. Responsáveis podem usar o canal de privacidade para esclarecer dúvidas ou solicitar análise de dados enviados por menores. A participação em campanhas e sorteios depende das regras de elegibilidade de cada ação.</p> },
  { id: "contato", title: "Fale com a rádio", content: <>
    <p>Para dúvidas ou solicitações sobre seus dados, escreva para {email}, preferencialmente com o assunto “Privacidade – Rádio 88 FM”. Informe qual serviço ou participação está relacionado ao pedido, sem enviar senhas ou documentos desnecessários.</p>
    <p>Telefone: <a className={linkStyle} href="tel:+552433388820">(24) 3338-8820</a>.</p>
  </> },
  { id: "atualizacoes", title: "Atualizações desta política", content: <p>Esta política pode ser atualizada para refletir mudanças nos serviços e nas práticas de tratamento. A versão vigente e a data de atualização ficam disponíveis nesta página. Mudanças que exijam nova autorização devem ser apresentadas no fluxo correspondente.</p> },
];

export default function Privacidade() {
  const [consent, setConsent] = useState<AnalyticsConsentState>("unknown");
  useEffect(() => {
    const sync = () => setConsent(getAnalyticsConsent());
    sync();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, sync);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, sync);
  }, []);
  return <article className="container max-w-5xl py-10 md:py-16">
    <header className="max-w-3xl">
      <Link to="/" className={linkStyle}>Voltar à rádio</Link>
      <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight sm:text-4xl">Política de Privacidade da Rádio 88 FM</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">Saiba como tratamos informações ao navegar no site, ouvir a programação e participar das ações da rádio.</p>
      <p className="mt-3 text-sm text-muted-foreground">Última atualização: <time dateTime="2026-11-19">19 de novembro de 2026</time>.</p>
    </header>
    <nav aria-label="Nesta política" className="my-8 border-l-2 border-radio-blue pl-5">
      <p className="mb-3 text-sm font-bold">Nesta política</p>
      <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">{sections.map(({ id, title }) => <li key={id}><a href={`#${id}`} className={linkStyle}>{title}</a></li>)}</ol>
    </nav>
    <div className="max-w-3xl space-y-8 text-base leading-7 text-foreground/85 [&_li]:mt-2">
      {sections.map(({ id, title, content }, index) => <section key={id} id={id} className="scroll-mt-28 space-y-3 border-t border-border pt-7">
        <h2 className="font-display text-xl font-extrabold text-foreground sm:text-2xl">{index + 1}. {title}</h2>
        {content}
        {id === "cookies" && <>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setAnalyticsConsent("denied")} className="min-h-11 rounded-lg border border-radio-blue px-4 text-sm font-bold text-radio-blue hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Recusar métricas opcionais</button>
            <button type="button" onClick={() => setAnalyticsConsent("granted")} className="min-h-11 rounded-lg bg-radio-blue px-4 text-sm font-bold text-white hover:bg-radio-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Permitir métricas opcionais</button>
          </div>
          <p role="status" className="text-sm text-muted-foreground">{consent === "denied" ? "Métricas opcionais recusadas neste navegador." : consent === "granted" ? "Métricas opcionais permitidas neste navegador." : "Nenhuma preferência específica foi salva neste navegador."}</p>
        </>}
      </section>)}
    </div>
  </article>;
}
