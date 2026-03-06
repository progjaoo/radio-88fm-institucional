import { Radio, Mic, Clock, Users } from "lucide-react";

const planos = [
  {
    nome: "Spot 30s",
    descricao: "Veiculação de spot de 30 segundos em horários estratégicos da programação.",
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
    <div>
      <section className="radio-gradient py-16 mt-5">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground">ANUNCIE NA 88 FM</h1>
          <p className="text-primary-foreground/80 mt-2 max-w-lg mx-auto">
            Alcance milhares de ouvintes fiéis no Sul Fluminense. Fale com nosso departamento comercial.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {planos.map((plano) => (
              <div key={plano.nome} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                <plano.icon size={32} className="text-primary mb-3" />
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
              className="inline-block radio-gradient-accent font-display font-bold text-white px-10 py-4 rounded-full text-lg hover:opacity-90 transition-opacity"
            >
              FALAR COM O COMERCIAL
            </a>
            <p className="text-muted-foreground text-sm mt-4">
              Dep. Comercial: (24) 3338-8820 | comercialvpd@gmail.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Anuncie;
