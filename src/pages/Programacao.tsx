import { Clock } from "lucide-react";

const programas = [
  { nome: "Fato Popular", horario: "04:00 - 09:00", descricao: "Notícias do Brasil e do mundo com análise e opinião.", locutor: "Carlos Alberto Albertassi e Betinho Albertassi" },
  { nome: "Bom Dia 88", horario: "09:00 - 12:00", descricao: "Comece o dia com os melhores louvores e enquetes para abençoar sua manhã.", locutor: "Dário Ferreira e Letícia Dantas" },
  { nome: "Temperatura Gospel", horario: "13:00 - 15:00", descricao: "As músicas gospel mais quentes do momento com uma programação especial.", locutor: "Luciana Alves" },
  { nome: "Favorito", horario: "15:00 - 17:00", descricao: "Seus louvores favoritos em sequência, sem parar. Humor e diversão!", locutor: "Régias e Cinthia Miranda" },
];

const Programacao = () => {
  return (
    <div>
      <section className="radio-gradient py-16 mt-5">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xlnt-extrabold text-primary-foreground">PROGRAMAÇÃO</h1>
          <p className="text-primary-foreground/80 mt-2">Programação completa da Rádio 88 FM</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="space-y-4">
            {programas.map((prog) => (
              <div
                key={prog.nome}
                className="bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2 text-primary shrink-0">
                    <Clock size={18} />
                    <span className="font-display font-bold text-sm">{prog.horario}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground">{prog.nome}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{prog.descricao}</p>
                    <p className="text-primary text-xs font-semibold mt-1">🎙️ {prog.locutor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programacao;
