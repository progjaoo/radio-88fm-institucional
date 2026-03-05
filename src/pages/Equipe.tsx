import locutor1 from "@/assets/locutor-1.jpg";
import locutor2 from "@/assets/locutor-2.jpg";
import locutor3 from "@/assets/locutor-3.jpg";
import locutor4 from "@/assets/locutor-4.jpg";
import locutor5 from "@/assets/locutor-5.jpg";
import locutor6 from "@/assets/locutor-6.jpg";

const equipe = [
  { name: "Edson Albertassi", funcao: "Diretor / Locutor", programa: "Bom Dia 88", setor: "Diretoria", image: locutor1 },
  { name: "Ana Paula", funcao: "Locutora", programa: "Temperatura Gospel", setor: "Programação", image: locutor2 },
  { name: "Pastor Marcos", funcao: "Apresentador", programa: "Fato Popular", setor: "Jornalismo", image: locutor3 },
  { name: "DJ Samuel", funcao: "Locutor / DJ", programa: "Favorito", setor: "Programação", image: locutor4 },
  { name: "Cintia Souza", funcao: "Apresentadora", programa: "Receitas da Cintia", setor: "Programação", image: locutor5 },
  { name: "Roberto Silva", funcao: "Locutor", programa: "Programa Especial", setor: "Programação", image: locutor6 },
];

const Equipe = () => {
  return (
    <div>
      <section className="radio-gradient py-16">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground">NOSSA EQUIPE</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipe.map((member) => (
              <div key={member.name} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-foreground">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mt-1">{member.funcao}</p>
                  <p className="text-muted-foreground text-sm mt-1">🎙️ {member.programa}</p>
                  <span className="inline-block mt-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {member.setor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Equipe;
