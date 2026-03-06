import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import LocutorCard from "@/components/LocutorCard";
import logo from "@/assets/logosvg.svg";
import fundolocutores from "@/assets/fundolocutores.png";
import podcastBanner from "@/assets/podcast-banner.jpg";

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
 


const locutores = [
  { image: uelison},
  { image: jose },
  { image: geraldo },
  { image: favorito},
  { image: favorito2},
  { image: leandro},
  { image: miq},
  { image: geraldoalb},
  { image: betin},
  { image: leticia},
  { image: dario},
  { image: lualves },
  { image: fato1 },
  { image: fato2 },
  { image: fato3 },
  { image: fato4 },
];

const portalNews = [
  { id: 1, title: "Como interpretar a Bíblia de forma correta. Dicas para um aprendizado a partir delas.", image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=600&fit=crop", category: "ENQUETE", link: "#" },
  { id: 2, title: "Luto na música gospel: cantor Ron Kenoly morre aos 81 anos", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
  { id: 3, title: "The Send reúne 300 mil pessoas em cinco capitais brasileiras", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
  { id: 4, title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
  { id: 5, title: "Letra, ritmo e uso de termos populares levaram parte do público gospel a questionar a canção Aue", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
  { id: 11, title: "Torta de limão é a pedida mais rápida e prática para esse feriado de calor", image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
  { id: 12, title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", category: "RECEITAS DA CINTHIA", link: "#" },
];

const fatoPopularNews = [
  { id: 6, title: "Dólar sobe 3% e Ibovespa cai 3% após retaliação da China a tarifaço de Trump", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=600&fit=crop", category: "NEGÓCIOS", link: "#" },
  { id: 7, title: "Correios apontam que receita diminuiu R$ 2,2 bilhões em taxa", image: "https://images.unsplash.com/photo-1586339949216-35c2747cc36d?w=400&h=300&fit=crop", category: "NEGÓCIOS", link: "#" },
  { id: 8, title: "PIX: BC vai disponibilizar parcelado em setembro e sistema para devolução", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", category: "NEGÓCIOS", link: "#" },
  { id: 9, title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", category: "NEGÓCIOS", link: "#" },
  { id: 10, title: "Ex-presidente do BC diz que tarifaço talvez 'machuque menos Brasil'", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop", category: "NEGÓCIOS", link: "#" },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/radio88oficial/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/radio88fm", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@radio88oficial", label: "YouTube" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/radio-88-fm", label: "LinkedIn" },
];

const PortalNewsCard = ({ title, image, category, link, large = false }: { title: string; image: string; category: string; link: string; large?: boolean }) => {
  if (large) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-lg h-full">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-end h-full bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
          <span className="self-start bg-radio-blue text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">{category}</span>
          <h3 className="font-display font-bold text-white leading-tight text-lg md:text-xl">{title}</h3>
        </div>
      </a>
    );
  }
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute bottom-2 left-2 bg-radio-blue text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{category}</span>
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm font-bold leading-tight text-foreground line-clamp-3 group-hover:text-primary transition-colors">{title}</h3>
      </div>
    </a>
  );
};

const Index = () => {
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
            <a href="https://play.google.com/store/apps/details?id=com.radio88fm&hl=pt_BR&pli=1" target="_blank" rel="noopener noreferrer" className="underline text-foreground">Android</a> ou para{" "}
            <a href="https://apps.apple.com/br/app/r%C3%A1dio-88-fm-o-som-do-c%C3%A9u/id1587595590?l=en-GB" target="_blank" rel="noopener noreferrer" className="underline text-foreground">IOS</a>
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* 
        CARROSSEL INSTITUCIONAL 
      */}

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
                  <img
                    src={fundolocutores}
                    alt="88FM"
                    className="w-full object-contain"
                  />
                </div>
              </div>

            </div>
          </section>

      {/* Programming Section */}
      <section className="bg-radio-blue py-14 md:py-5 rounded-[40px] top-0 z-50 mx-4 xl:mx-140 max-w-[2400px] mb-14">
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

          {/* Grid Principal: 3 colunas (1 para o grande, 2 para o bloco dos pequenos) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. CARD GRANDE (Coluna 1, Ocupa 2 linhas) */}
            <div className="md:col-span-1 md:row-span-2 h-[380px] md:h-[520px]">
              <PortalNewsCard {...portalNews[0]} large />
            </div>

            {/* 2. CONTAINER DOS 4 CARDS PEQUENOS (Colunas 2 e 3) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-[252px]">
                <PortalNewsCard {...portalNews[1]} />
              </div>
              <div className="h-[252px]">
                <PortalNewsCard {...portalNews[2]} />
              </div>
              <div className="h-[252px]">
                <PortalNewsCard {...portalNews[3]} />
              </div>
              <div className="h-[252px]">
                <PortalNewsCard {...portalNews[4]} />
              </div>
            </div>
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
          {/* Coluna Esquerda: Card Grande */}
          <div className="md:col-span-1 md:row-span-2 h-[380px] md:h-[520px]">
            <PortalNewsCard {...fatoPopularNews[0]} large />
          </div>

          {/* Coluna Direita: Grid 2x2 para 4 cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fatoPopularNews.slice(1).map((news) => (
              <div key={news.id} className="h-[252px]">
                <PortalNewsCard {...news} />
              </div>
            ))}
          </div>
        </div>

        {/* Botão Ver Mais */}
            <div className="mt-10 max-w-sm mx-auto">
              <a
                href="http://localhost:8082/fatopopular"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-radio-blue font-display font-bold text-white py-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-lg">
                  Ver mais
                </a>
              </div>
            </div>

        </section>

      {/* Podcast Banner */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${podcastBanner})` }}
          />
          <div className="relative bg-radio-dark/90 py-12 md:py-16">
            <div className="container">
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
                VEM FAZER SEU<br />
                <span className="text-radio-yellow">PODCAST</span> COM<br />
                A GENTE!
              </h2>
              <a
                href="https://wa.me/5524998680088"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 radio-gradient-accent font-display text-white font-bold text-accent-foreground px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                FALE CONOSCO NO WHATSAPP
              </a>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Index;
