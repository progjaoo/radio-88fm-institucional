import { ArrowDownToLine, ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADVERTISING_CONTACT, MEDIA_KIT } from "@/config/advertising";
import { Analytics } from "@/services/analytics/analytics";
import mediaKitCover from "@/assets/anuncie/midia-kit-capa.jpg";
import radioHeadquarters from "@/assets/anuncie/sede-radio88.jpg";
import "./Anuncie.css";

const cities = [
  "Volta Redonda", "Barra Mansa", "Barra do Piraí", "Piraí", "Resende",
  "Itatiaia", "Porto Real", "Valença", "Vassouras", "Pinheiral",
];

const formats = [
  {
    title: "Inserções na programação",
    description: "Apresente sua marca, produto ou oferta em uma campanha alinhada ao período e aos objetivos do seu negócio. Duração e frequência são definidas na proposta.",
  },
  {
    title: "Patrocínio de programas",
    description: "Avalie associar sua marca a um programa e ao contexto editorial que faz sentido para a sua campanha.",
  },
  {
    title: "Ações digitais",
    description: "Converse sobre possibilidades nos canais digitais da rádio e as entregas disponíveis para o período da sua campanha.",
  },
  {
    title: "Projetos especiais",
    description: "Apresente sua ideia para eventos, ações e conteúdos. Nossa equipe avalia a viabilidade e as condições para colocá-la em prática.",
  },
];

const steps = [
  { title: "Conte o que sua marca precisa.", description: "Apresente seu negócio, a região de interesse e o período da campanha." },
  { title: "Conheça as possibilidades.", description: "Nossa equipe avalia os formatos e a programação disponíveis para o seu objetivo." },
  { title: "Receba uma proposta.", description: "Alinhe as entregas, o período e o investimento antes de iniciar a campanha." },
];

function MediaKitDownload({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <Button asChild variant="outline" className={`anuncie-button ${highlighted ? "anuncie-button-yellow" : "anuncie-button-outline"}`}>
      <a href={MEDIA_KIT.path} download={MEDIA_KIT.filename}>
        <ArrowDownToLine aria-hidden="true" /> Baixar mídia kit
        <span className="sr-only"> (PDF, {MEDIA_KIT.sizeLabel})</span>
      </a>
    </Button>
  );
}

function CommercialContact({ location, children }: { location: string; children: React.ReactNode }) {
  return (
    <Button asChild className="anuncie-button anuncie-button-primary">
      <a
        href={ADVERTISING_CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => Analytics.track("whatsapp_click", { location, current_page: "/anuncie" })}
      >
        {children} <ArrowUpRight aria-hidden="true" />
        <span className="sr-only"> (nova aba)</span>
      </a>
    </Button>
  );
}

const Anuncie = () => (
  <div className="anuncie-page">
    <section className="anuncie-wrap anuncie-hero" aria-labelledby="anuncie-title">
      <div>
        <p className="anuncie-eyebrow">Sua marca na Rádio 88 FM</p>
        <h1 id="anuncie-title">Sua marca na conversa de quem vive o <span>Sul Fluminense.</span></h1>
        <p className="anuncie-lead">Conecte sua campanha a uma rádio presente na rotina da região, com jornalismo, música, entretenimento e canais digitais.</p>
        <p>Nossa equipe ajuda a avaliar os formatos e a programação adequados para o seu objetivo.</p>
        <div className="anuncie-actions">
          <CommercialContact location="anuncie_hero">Quero anunciar na 88</CommercialContact>
          <MediaKitDownload />
        </div>
        <p className="anuncie-file-info">PDF · {MEDIA_KIT.pages} páginas · {MEDIA_KIT.sizeLabel} · sem cadastro</p>
      </div>
      <a href={MEDIA_KIT.path} download={MEDIA_KIT.filename} className="anuncie-kit-preview" aria-label="Baixar mídia kit da Rádio 88 FM (PDF, aproximadamente 10 MB)">
        <img src={mediaKitCover} alt="Capa azul do mídia kit da Rádio 88 FM" width={1200} height={675} decoding="async" />
        <span>Conheça as possibilidades para sua marca <ArrowDownToLine aria-hidden="true" size={18} /></span>
      </a>
    </section>

    <section className="anuncie-wrap anuncie-section anuncie-region" aria-labelledby="anuncie-region-title">
      <div>
        <p className="anuncie-eyebrow">Conexão com a região</p>
        <h2 id="anuncie-region-title">Sua campanha perto<br />de quem importa.</h2>
        <p>De Volta Redonda para o Sul Fluminense, a 88 faz parte de conversas, histórias e momentos da região. Sua marca também pode fazer parte dessa rotina.</p>
      </div>
      <div>
        <ul className="anuncie-cities" aria-label="Cidades mencionadas no mídia kit">
          {cities.map(city => <li key={city}>{city}</li>)}
        </ul>
        <p className="anuncie-caption">Localidades informadas no mídia kit. Consulte nossa equipe sobre a praça de interesse da sua campanha.</p>
      </div>
    </section>

    <section className="anuncie-muted-section anuncie-section" aria-labelledby="anuncie-formats-title">
      <div className="anuncie-wrap">
        <p className="anuncie-eyebrow">Um formato para cada objetivo</p>
        <h2 id="anuncie-formats-title">Como sua marca pode<br />estar na 88.</h2>
        <p>Para tornar sua marca mais conhecida, divulgar uma oferta ou se conectar a um programa: comece pelo objetivo da sua campanha.</p>
        <div className="anuncie-formats">
          {formats.map(format => (
            <article key={format.title}>
              <h3>{format.title}</h3>
              <p>{format.description}</p>
            </article>
          ))}
        </div>
        <p className="anuncie-caption">Formatos, disponibilidade e entregas são confirmados pela equipe comercial em cada proposta.</p>
      </div>
    </section>

    <section className="anuncie-wrap anuncie-section anuncie-digital" aria-labelledby="anuncie-digital-title">
      <div>
        <p className="anuncie-eyebrow">Na programação e além dela</p>
        <h2 id="anuncie-digital-title">A conversa continua<br />em outros canais.</h2>
      </div>
      <div>
        <p>A presença da 88 também passa pelo site, pelo aplicativo e pelas redes sociais. Converse com nossa equipe sobre como esses canais podem complementar sua campanha no rádio.</p>
        <p className="anuncie-channel-list">Instagram · Facebook · YouTube · TikTok</p>
      </div>
    </section>

    <section className="anuncie-wrap anuncie-section anuncie-studio" aria-labelledby="anuncie-studio-title">
      <img src={radioHeadquarters} alt="Identidade da Rádio 88 FM na sede, com logo em uma parede de madeira" width={1920} height={1080} loading="lazy" decoding="async" />
      <div>
        <p className="anuncie-eyebrow">Conheça nossa estrutura</p>
        <h2 id="anuncie-studio-title">Uma rádio feita de<br />conteúdo e conexão.</h2>
        <p>Estúdios, produção e presença audiovisual fazem parte da estrutura da 88. No mídia kit, você conhece mais sobre nossa rádio e suas possibilidades.</p>
        <a href="#anuncie-contato" className="anuncie-text-link">Vamos conversar sobre sua ideia <ArrowUpRight aria-hidden="true" size={18} /></a>
      </div>
    </section>

    <section className="anuncie-muted-section anuncie-section" aria-labelledby="anuncie-steps-title">
      <div className="anuncie-wrap">
        <p className="anuncie-eyebrow">Vamos começar?</p>
        <h2 id="anuncie-steps-title">Do seu objetivo à proposta.</h2>
        <ol className="anuncie-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="anuncie-step-number" aria-hidden="true">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="anuncie-wrap anuncie-section" aria-labelledby="anuncie-download-title">
      <div className="anuncie-download">
        <div>
          <h2 id="anuncie-download-title">Conheça melhor a 88.</h2>
          <p>Baixe o mídia kit com a apresentação da rádio, sua presença regional e estrutura.</p>
          <p className="anuncie-file-info">PDF · {MEDIA_KIT.pages} páginas · {MEDIA_KIT.sizeLabel} · sem cadastro</p>
        </div>
        <MediaKitDownload highlighted />
      </div>
    </section>

    <section id="anuncie-contato" className="anuncie-wrap anuncie-section anuncie-contact" aria-labelledby="anuncie-contact-title">
      <div>
        <p className="anuncie-eyebrow">Fale com o comercial</p>
        <h2 id="anuncie-contact-title">Vamos colocar sua marca<br />nessa conversa?</h2>
        <p>Conte seu objetivo e converse sobre uma campanha na Rádio 88 FM.</p>
        <CommercialContact location="anuncie_footer">Conversar pelo WhatsApp</CommercialContact>
      </div>
      <address className="anuncie-contact-details">
        <p>Departamento comercial</p>
        <a href={ADVERTISING_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => Analytics.track("whatsapp_click", { location: "anuncie_contact_details", current_page: "/anuncie" })}>
          <MessageCircle aria-hidden="true" size={20} /> {ADVERTISING_CONTACT.phoneLabel}<span className="sr-only"> (WhatsApp, nova aba)</span>
        </a>
        <a href={`mailto:${ADVERTISING_CONTACT.email}`}><Mail aria-hidden="true" size={20} /><span>{ADVERTISING_CONTACT.email}</span></a>
      </address>
    </section>
  </div>
);

export default Anuncie;
