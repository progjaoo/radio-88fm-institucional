import { Clock } from "lucide-react";

const programas = [
  { nome: "Bom Dia 88", horario: "06:00 - 09:00", descricao: "Comece o dia com as melhores notícias e louvores para abençoar sua manhã.", locutor: "Edson Albertassi" },
  { nome: "Temperatura Gospel", horario: "09:00 - 12:00", descricao: "As músicas gospel mais quentes do momento com uma programação especial.", locutor: "Ana Paula" },
  { nome: "Fato Popular", horario: "12:00 - 14:00", descricao: "Notícias do Brasil e do mundo com análise e opinião.", locutor: "Pastor Marcos" },
  { nome: "Favorito", horario: "14:00 - 17:00", descricao: "Seus louvores favoritos em sequência, sem parar. Peça a sua música!", locutor: "DJ Samuel" },
  { nome: "Receitas da Cintia", horario: "17:00 - 18:00", descricao: "Dicas de receitas deliciosas para o dia a dia da família.", locutor: "Cintia Souza" },
  { nome: "Programa Especial", horario: "18:00 - 20:00", descricao: "Programação especial com os melhores momentos do dia.", locutor: "Roberto Silva" },
  { nome: "Louvor da Noite", horario: "20:00 - 00:00", descricao: "Louvores para encerrar o dia com paz e gratidão.", locutor: "Programação Automática" },
  { nome: "Madrugada com Deus", horario: "00:00 - 06:00", descricao: "Música e meditação para as horas da madrugada.", locutor: "Programação Automática" },
];

const Programacao = () => {
  return (
    <div>
      <section className="radio-gradient py-16">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground">PROGRAMAÇÃO</h1>
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
