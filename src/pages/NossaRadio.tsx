import fotoinicial from "@/assets/fotos-nossaradio/fotoinicial.png";
import leticia from "@/assets/fotos-nossaradio/leticia.png";
import dario from "@/assets/fotos-nossaradio/dario.png";
import miqueias from "@/assets/fotos-nossaradio/miqueias.svg";
import lualves from "@/assets/fotos-nossaradio/lualves.svg";
import regiscintia from "@/assets/fotos-nossaradio/regiscintia.png";
import geraldojose from "@/assets/fotos-nossaradio/geraldojose.png";
import proposito from "@/assets/fotos-nossaradio/proposito.png";
import geraldoalbertassi from "@/assets/fotos-nossaradio/geraldoalbertassi.png";
import cristoemnos from "@/assets/fotos-nossaradio/cristoemnos.png";
import betinhoalb from "@/assets/fotos-nossaradio/betinhoalb.svg";
import teko from "@/assets/fotos-nossaradio/teko.svg";
import somdoceu from "@/assets/fotos-nossaradio/somdoceu.png";
import amado from "@/assets/fotos-nossaradio/amado.svg";
import leandro from "@/assets/fotos-nossaradio/leandro.svg";
import vogel from "@/assets/fotos-nossaradio/vogel.svg";
import familiafato from "@/assets/fotos-nossaradio/familiafato.svg";
import lugomes from "@/assets/fotos-nossaradio/lugomes.svg";
import radio88final from "@/assets/fotos-nossaradio/radio88final.svg";

interface NossaRadioCard {
  src: string;
  alt: string;
  wide?: boolean;
}

const gallery: NossaRadioCard[] = [
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

const NossaRadio = () => {
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
                className={`overflow-hidden rounded-[10px] bg-radio-blue ${
                  item.wide ? "col-span-2 aspect-[823/507]" : "aspect-[406/507]"
                }`}
              >
                <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NossaRadio;
