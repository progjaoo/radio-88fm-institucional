import { Radio, Mic, Clock, Users } from "lucide-react";

const planos = [
  {
    nome: "Spots",
    descricao: "Veiculação de spot em horários estratégicos da programação.",
    icon: Radio,
  },
  {
    nome: "Patrocínio de Programa",
    descricao: "Patrocine um programa da grade e tenha sua marca associada ao conteúdo.",
    icon: Mic,
  },
  {
    nome: "Pacote Mensal",
    descricao: "Inserções distribuídas ao longo do mês com cobertura em todos os horários.",
    icon: Clock,
  },
  {
    nome: "Eventos e Ações",
    descricao: "Participação em eventos e ações promocionais organizadas pela rádio.",
    icon: Users,
  },
];

const Anuncie = () => {
  return (
    <div >
      <section className="bg-radio-brand-blue py-16 mt-5">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground">ANUNCIE NA 88 FM</h1>
          <p className="text-primary-foreground/80 mt-2 max-w-lg mx-auto bg-radio-brand-blue">
            Alcance milhares de ouvintes fiéis no Sul Fluminense. Fale com nosso departamento comercial.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {planos.map((plano, index) => (
              <div
                key={plano.nome}
                className="group animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-radio-blue/40 hover:shadow-[0_22px_55px_rgba(19,96,232,0.16)]"
                style={{ animationDelay: `${index * 90}ms`, animationFillMode: "both" }}
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-radio-brand-blue/10 text-radio-brand-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-radio-brand-blue group-hover:text-white">
                  <plano.icon size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{plano.nome}</h3>
                <p className="text-muted-foreground text-sm mt-2">{plano.descricao}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://wa.me/5524998680088"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-[linear-gradient(120deg,#1360E8_0%,#0497D8_45%,#E83C25_100%)] bg-[length:220%_100%] bg-[position:0%_0%] px-10 py-4 font-display text-lg font-bold text-white shadow-[0_18px_45px_rgba(19,96,232,0.25)] transition-all duration-500 hover:-translate-y-1 hover:bg-[position:100%_0%] hover:shadow-[0_24px_60px_rgba(232,60,37,0.28)]"
            >
              FALAR COM O COMERCIAL
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Anuncie;
