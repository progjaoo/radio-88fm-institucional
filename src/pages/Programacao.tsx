import { Clock, Mic } from "lucide-react";
import { useEffect, useState } from "react";

interface Programa {
  id?: number;
  nomePrograma: string;
  apresentador: string;
  descricao: string;
  horaInicio: string;
  horaFim: string;
  diaSemana?: number;
  imagem?: string;
  ativo?: boolean;
}

// Defina a base URL aqui para facilitar a manutenção
const API_BASE_URL = "http://localhost:5091"; 
const API_ENDPOINT = `${API_BASE_URL}/api/programacao/emissora/1/buscarTodos`;

const Programacao = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  const formatarHora = (hora: string) => hora.substring(0, 5);

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const res = await fetch(API_ENDPOINT);
        if (!res.ok) throw new Error("Erro na resposta da API");
        
        const data: Programa[] = await res.json();
        // Filtra ativos e atualiza o estado
        setProgramas(data.filter(p => p.ativo !== false));
      } catch (error) {
        console.error("Erro ao buscar programação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramas();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ... seu header ... */}
      <section className="py-12">
        <div className="container max-w-4xl">
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Carregando programação...</div>
          ) : (
            <div className="space-y-4">
              {programas.map((prog, index) => (
            <div
              key={prog.id || index}
              className="bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-2 text-primary shrink-0">
                <Clock size={18} />
                <span className="font-display font-bold text-sm">
                  {formatarHora(prog.horaInicio)} - {formatarHora(prog.horaFim)}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {prog.nomePrograma}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {prog.descricao}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Mic size={14} className="text-primary" />
                  <span className="text-primary text-xs font-semibold">
                    {prog.apresentador}
                  </span>
                </div>
              </div>

              {/* {prog.imagem && (
                <div className="hidden md:block w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img
                    src={`${API_BASE_URL}${prog.imagem}`}
                    alt={prog.nomePrograma}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )} */}
            </div>
          ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Programacao;
