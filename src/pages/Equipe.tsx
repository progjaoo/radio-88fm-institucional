import fotoinicial from "@/assets/fotos-equipe/fotoinicial.png";
import leticia from "@/assets/fotos-equipe/leticia.png";
import dario from "@/assets/fotos-equipe/dario.png";
import miqueias from "@/assets/fotos-equipe/miqueias.svg";
import lualves from "@/assets/fotos-equipe/lualves.svg";
import regiscintia from "@/assets/fotos-equipe/regiscintia.png";
import geraldojose from "@/assets/fotos-equipe/geraldojose.png";
import proposito from "@/assets/fotos-equipe/proposito.png";
import geraldoalbertassi from "@/assets/fotos-equipe/geraldoalbertassi.png";
import cristoemnos from "@/assets/fotos-equipe/cristoemnos.png";
import betinhoalb from "@/assets/fotos-equipe/betinhoalb.svg";
import teko from "@/assets/fotos-equipe/teko.svg";
import somdoceu from "@/assets/fotos-equipe/somdoceu.png";
import amado from "@/assets/fotos-equipe/amado.svg";
import leandro from "@/assets/fotos-equipe/leandro.svg";
import vogel from "@/assets/fotos-equipe/vogel.svg";
import familiafato from "@/assets/fotos-equipe/familiafato.svg";
import lugomes from "@/assets/fotos-equipe/lugomes.svg";
import radio88final from "@/assets/fotos-equipe/radio88final.svg";

interface EquipeCard {
  src: string;
  alt: string;
  wide?: boolean;
}

const gallery: EquipeCard[] = [
  { src: leticia, alt: "Leticia" },
  { src: dario, alt: "Dario" },
  { src: miqueias, alt: "Miqueias" },
  { src: lualves, alt: "Lu Alves" },
  { src: regiscintia, alt: "Regis e Cintia" },
  { src: geraldojose, alt: "Geraldo e Jose" },
  { src: proposito, alt: "O proposito que nos une", wide: true },
  { src: geraldoalbertassi, alt: "Geraldo Albertassi" },
  { src: cristoemnos, alt: "Cristo em nos" },
  { src: betinhoalb, alt: "Betinho Albertassi" },
  { src: teko, alt: "Teko" },
  { src: somdoceu, alt: "O som do ceu", wide: true },
  { src: amado, alt: "Amado" },
  { src: leandro, alt: "Leandro" },
  { src: vogel, alt: "Vogel" },
  { src: familiafato, alt: "Familia Fato" },
  { src: lugomes, alt: "Lu Gomes" },
  { src: radio88final, alt: "Radio 88 FM" },
];

const Equipe = () => {
  return (
    <div className="bg-white">
      <section className="py-8 md:py-12">
        <div className="mx-auto w-full max-w-[1300px] px-4">
          <img
            src={fotoinicial}
            alt="Conheca todos que fazem da nossa radio um lugar unico"
            className="block w-full left-2 rounded-[28px]"
          />

          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {gallery.map((item) => (
              <div
                key={item.alt}
                className={`transform-gpu overflow-hidden rounded-[10px] transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] md:hover:-translate-y-1.5 ${
                  item.wide ? "col-span-2 aspect-[823/507]" : "aspect-[406/507]"
                }`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Equipe;
