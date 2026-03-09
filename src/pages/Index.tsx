import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import LocutorCard from "@/components/LocutorCard";
import fundolocutores from "@/assets/fundolocutores.png";
import podcastBanner from "@/assets/podcastbanner.jpg";

// Assets Locutores
import uelison from "@/assets/locutores/uelison.png";
import jose from "@/assets/locutores/jose.png";
import geraldo from "@/assets/locutores/geraldo.png";
import favorito from "@/assets/locutores/favorito1.png";
import favorito2 from "@/assets/locutores/favorito2.png";
import leandro from "@/assets/locutores/leandro.png";
import miq from "@/assets/locutores/miqueias.png";
import geraldoalb from "@/assets/locutores/geraldoalbert.png";
import betin from "@/assets/locutores/betinho.png";
import leticia from "@/assets/locutores/leticia.png";
import dario from "@/assets/locutores/dario.png";
import lualves from "@/assets/locutores/lualves.png";
import fato1 from "@/assets/locutores/fato1.png";
import fato2 from "@/assets/locutores/fato2.png";
import fato3 from "@/assets/locutores/fato3.png";
import fato4 from "@/assets/locutores/fato4.png";

// Interface para as notícias da API
interface PostDestaque {
  id: number;
  titulo: string;
  conteudo: string;
  editorial: string;
  imagem: string;
  link?: string;
}

const locutores = [
  { image: uelison }, { image: jose }, { image: geraldo }, { image: favorito },
  { image: favorito2 }, { image: leandro }, { image: miq }, { image: geraldoalb },
  { image: betin }, { image: leticia }, { image: dario }, { image: lualves },
  { image: fato1 }, { image: fato2 }, { image: fato3 }, { image: fato4 },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/radio88oficial/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/radio88fm", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@radio88oficial", label: "YouTube" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/radio-88-fm", label: "LinkedIn" },
];

// Componente de Card Ajustado para os campos da API
const PortalNewsCard = ({ titulo, imagem, editorial, id, large = false }: { titulo: string; imagem: string; editorial: string; id: number; large?: boolean }) => {
  const content = (
    <>
      <div className={large ? "absolute inset-0" : "relative aspect-[4/3] overflow-hidden"}>
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        {!large && (
          <span className="absolute bottom-2 left-2 bg-radio-blue text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            {editorial}
          </span>
        )}
      </div>
      <div className={large 
        ? "relative z-10 flex flex-col justify-end h-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4" 
        : "p-3"}>
        {large && (
          <span className="self-start bg-radio-blue text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
            {editorial}
          </span>
        )}
        <h3 className={`font-display font-bold leading-tight group-hover:text-primary transition-colors ${large ? "text-white text-xl md:text-2xl" : "text-sm text-foreground line-clamp-3"}`}>
          {titulo}
        </h3>
      </div>
    </>
  );

  return (
    <a 
      href={`#noticia/${id}`} 
      className={`group overflow-hidden rounded-lg ${large ? "relative block h-full min-h-[350px]" : "block bg-card shadow-sm hover:shadow-md transition-shadow"}`}
    >
      {content}
    </a>
  );
};

const Index = () => {
  const [portalNews, setPortalNews] = useState<PostDestaque[]>([]);
  const [fatoPopularNews, setFatoPopularNews] = useState<PostDestaque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [res88, resFato] = await Promise.all([
          fetch("http://localhost:5091/api/posts/destaques88fm"),
          fetch("http://localhost:5091/api/posts/destaquesFatoPopular")
        ]);

        if (res88.ok) setPortalNews(await res88.json());
        if (resFato.ok) setFatoPopularNews(await resFato.json());
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-background text-center py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight text-foreground mb-2">
            VOCÊ ESTÁ NA <span className="text-radio-blue">88FM</span>,
          </h1>
          <p className="font-display text-2xl md:text-4xl font-extrabold text-foreground">
            A RÁDIO QUE TOCA<br />O SOM DO CÉU!
          </p>
          <p className="mt-6 text-muted-foreground text-sm">
            Ou baixe nosso App para{" "}
            <a href="#" className="underline text-foreground">Android</a> ou para{" "}
            <a href="#" className="underline text-foreground">IOS</a>
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Locutores */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="relative">
            <div className="absolute -top-[145px] left-0 w-full z-10">
              <div className="flex items-end justify-start overflow-hidden -space-x-10"> 
                {locutores.map((loc, i) => (
                  <LocutorCard key={i} image={loc.image} />
                ))}
              </div>
            </div>
            <div className="relative mt-24">
              <img src={fundolocutores} alt="88FM" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Programming Section */}
      <section className="bg-radio-blue py-14 md:py-5 rounded-[40px] mx-4 xl:mx-140 max-w-[2400px] mb-14">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-40 items-center">
            <div className="text-white">
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                PROGRAMAÇÃO O DIA TODO<br />
                <span className="text-white font-bold">PARA ESTAR</span><br />
                <span className="text-white font-bold">SEMPRE COM VOCÊ!</span>
              </h2>
            </div>
            <div className="text-white">
              <h3 className="font-display text-3xl md:text-5xl font-extrabold mb-6">FATO POPULAR</h3>
              <ul className="text-white/70 font-display text-2xl md:text-4xl space-y-2">
                <li className="text-white opacity-90">BOM DIA 88</li>
                <li className="text-white opacity-60">TEMPERATURA GOSPEL</li>
                <li className="text-white opacity-40">FAVORITO</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO PORTAL 88 FM --- */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-8 bg-radio-blue rounded-full" />
            <h2 className="font-display text-2xl font-extrabold text-foreground uppercase">PORTAL 88 FM</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {portalNews.length > 0 ? (
              <>
                <div className="md:row-span-2">
                  <PortalNewsCard {...portalNews[0]} large />
                </div>
                {portalNews.slice(1, 7).map((news) => (
                  <PortalNewsCard key={news.id} {...news} />
                ))}
              </>
            ) : (
              <div className="col-span-4 text-center py-10 text-muted-foreground">
                {loading ? "Carregando notícias..." : "Nenhuma notícia disponível no momento."}
              </div>
            )}
          </div>

          <div className="mt-8 max-w-lg mx-auto">
            <a href="http://localhost:8082/radio88fm" target="_blank" className="block w-full text-center bg-radio-blue font-display font-bold text-white py-2 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-lg">
              Ver mais
            </a>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO FATO POPULAR --- */}
      <section className="py-10 bg-muted">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-8 bg-radio-blue rounded-full" />
            <h2 className="font-display text-2xl font-extrabold text-foreground uppercase">FATO POPULAR</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fatoPopularNews.length > 0 ? (
              <>
                <div className="md:row-span-2">
                  <PortalNewsCard {...fatoPopularNews[0]} large />
                </div>
                {fatoPopularNews.slice(1, 5).map((news) => (
                  <PortalNewsCard key={news.id} {...news} />
                ))}
              </>
            ) : (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                {loading ? "Carregando notícias..." : "Nenhuma notícia disponível no momento."}
              </div>
            )}
          </div>

          <div className="mt-8 max-w-lg mx-auto">
            <a href="http://localhost:8082/fatopopular" target="_blank" className="block w-full text-center bg-radio-blue font-display font-bold text-white py-2 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-lg">
              Ver mais
            </a>
          </div>
        </div>
      </section>

      {/* Podcast Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${podcastBanner})` }} />
        <div className="relative bg-radio-dark/90 py-12 md:py-16">
          <div className="container">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
              VEM FAZER SEU<br /><span className="text-radio-yellow">PODCAST</span> COM<br />A GENTE!
            </h2>
            <a href="https://wa.me/5524998680088" target="_blank" className="inline-block mt-6 radio-gradient-accent font-display text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
              FALE CONOSCO NO WHATSAPP
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;