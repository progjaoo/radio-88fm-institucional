import HistoryTimeline from "@/components/HistoryTimeline";
import { historicoLogos } from "@/data/historicoLogos";
import edsonAlbertassi from "@/assets/nossa-radio/edson.jpeg";
const pageContainer = "mx-auto w-full max-w-[1500px] px-6 sm:px-6 lg:px-10 xl:px-12";

const NossaRadio = () => {
  return (
    <main className="bg-white text-foreground">
        {/* TIMELINE */}
       <section className="py-10 md:py-16">
        <div className={pageContainer}>
          <div className="mb-8 max-w-3xl md:mb-10">
            <p className="font-display text-sm font-extrabold uppercase tracking-[0.28em] text-radio-blue">
              Linha do tempo
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-radio-dark md:text-6xl">
              As marcas que contam a nossa história
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Cinco identidades visuais registram fases importantes da Rádio 88 FM.
            </p>
          </div>

          <HistoryTimeline items={historicoLogos} />
        </div>
      </section>
      {/* HISTÓRIA */}
      <section className="pb-10 md:pb-14">
        <div className={pageContainer}>
          <div className="mx-auto max-w-[860px]">
            <p className="font-display text-xl font-extrabold uppercase leading-tight text-radio-blue md:text-2xl">
              "Damos graças a Deus pelo que passou, pelo dia de hoje e pelo dia que virá."
            </p>
            {/* TODO: confirmar com a equipe se atualiza "30 anos" para "32 anos" ou mantem o texto historico original. */}
            <p className="mt-7 text-lg leading-8 text-foreground/78 md:text-xl md:leading-9">
              A Rádio 88 FM foi fundada em 1986, em Volta Redonda, porém, a história da emissora
              começou, de fato, em primeiro de agosto de 1994, quando passou a ser administrada pelo
              então operador de áudio Edson Albertassi, se tornou genuinamente evangélica e passou a
              transmitir canções e palavras de amor e paz. Em 30 anos de existência, a emissora
              cresceu, conquistando a maior audiência do Sul do Estado. A 88 FM é hoje referência em
              qualidade de programação e responsabilidade social.
            </p>
          </div>
        </div>
      </section>
    {/* IDEALIZADOR */}
      <section className="py-8 md:py-12">
        <div className={pageContainer}>
          <div className="grid items-center gap-8 rounded-[28px] bg-[#F5F8FC] p-6 md:grid-cols-[260px_1fr] md:p-10 lg:p-12">
            <img
              src={edsonAlbertassi}
              alt="Edson Albertassi, idealizador da Rádio 88 FM"
              className="mx-auto w-full max-w-[260px] rounded-[28px]"
            />
            <div>
              <p className="font-display text-sm font-extrabold uppercase tracking-[0.26em] text-radio-red">
                Nosso Idealizador
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-none text-radio-dark md:text-6xl">
                Edson Albertassi
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">
                Em 1994, assumiu a administração da emissora e conduziu a transformação que marcou a
                identidade evangélica da Rádio 88 FM, levando canções e palavras de amor e paz ao Sul
                do Estado.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NossaRadio;
