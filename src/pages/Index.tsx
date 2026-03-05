import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import LocutorCard from "@/components/LocutorCard";
import logo from "@/assets/logosvg.svg";
import fundolocutores from "@/assets/fundolocutores.png";
import podcastBanner from "@/assets/podcast-banner.jpg";
import locutor14 from "@/assets/locutor-14.png";
import locutor15 from "@/assets/locutor-15.png";
import locutor16 from "@/assets/locutor-16.png";
import locutor1 from "@/assets/locutor-1.png";
import locutor2 from "@/assets/locutor-2.png";
import locutor3 from "@/assets/locutor-3.png";
import locutor4 from "@/assets/locutor-4.png";
import locutor5 from "@/assets/locutor-5.png";
import locutor6 from "@/assets/locutor-6.png";
import locutor7 from "@/assets/locutor-7.png";
import locutor8 from "@/assets/locutor-8.png";
import locutor9 from "@/assets/locutor-9.png";
import locutor10 from "@/assets/locutor-10.png";
import locutor11 from "@/assets/locutor-11.png";
import locutor12 from "@/assets/locutor-12.png";
import locutor13 from "@/assets/locutor-13.png";


const locutores = [
  { image: locutor14},
  { image: locutor15 },
  { image: locutor16   },
  { image: locutor1 },
  { image: locutor2},
  { image: locutor3 },
  { image: locutor4},
  { image: locutor5},
  { image: locutor6},
  { image: locutor7},
  { image: locutor8 },
  { image: locutor9},
  { image: locutor10 },
  { image: locutor11 },
  { image: locutor12 },
  { image: locutor13 },
];

const portalNews = [
  {
    title: "Como interpretar a Bíblia de forma correta. Dicas para um aprendizado a partir delas.",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=600&fit=crop",
    category: "ENQUETE",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "Luto na música gospel: cantor Ron Kenoly morre aos 81 anos",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "The Send reúne 300 mil pessoas em cinco capitais brasileiras",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "Letra, ritmo e uso de termos populares levaram parte do público gospel a questionar a canção Aue",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "Torta de limão é a pedida mais rápida e prática para esse feriado de calor",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTHIA",
    link: "http://localhost:8082/radio88fm",
  },
];

const fatoPopularNews = [
  {
    title: "Dólar sobe 3% e Ibovespa cai 3% após retaliação da China a tarifaço de Trump",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=600&fit=crop",
    category: "NEGÓCIOS",
    link: "http://localhost:8082/fatopopular",
  },
  {
    title: "Correios apontam que receita diminuiu R$ 2,2 bilhões em taxa",
    image: "https://images.unsplash.com/photo-1586339949216-35c2747cc36d?w=400&h=300&fit=crop",
    category: "NEGÓCIOS",
    link: "http://localhost:8082/fatopopular",
  },
  {
    title: "PIX: BC vai disponibilizar parcelado em setembro e sistema para devolução",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    category: "NEGÓCIOS",
    link: "http://localhost:8082/fatopopular",
  },
  {
    title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    category: "NEGÓCIOS",
    link: "http://localhost:8082/fatopopular",
  },
  {
    title: "Ex-presidente do BC diz que tarifaço talvez 'machuque menos Brasil'",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
    category: "NEGÓCIOS",
    link: "http://localhost:8082/fatopopular",
  },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/radio88oficial/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/radio88fm", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@radio88oficial", label: "YouTube" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/radio-88-fm", label: "LinkedIn" },
];

const PortalNewsCard = ({ title, image, category, link, large = false }: { title: string; image: string; category: string; link: string; large?: boolean }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={`group relative block overflow-hidden rounded-lg ${large ? "row-span-2" : ""}`}
  >
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 absolute inset-0"
    />
    <div className="relative z-10 flex flex-col justify-end h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
      <span className="self-start bg-radio-blue text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
        {category}
      </span>
      <h3 className={`font-display font-bold text-white leading-tight ${large ? "text-lg md:text-xl" : "text-sm"}`}>
        {title}
      </h3>
    </div>
  </a>
);

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-background text-center py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight text-foreground mb-2">
            VOCÊ ESTÁ NA <span className="text-radio-yellow">88FM</span>,
          </h1>
          <p className="font-display text-2xl md:text-4xl font-extrabold text-foreground">
            A RÁDIO QUE TOCA<br />O SOM DO CÉU!
          </p>

          <p className="mt-6 text-muted-foreground text-sm">
            Ou baixe nosso App para{" "}
            <a href="#" className="underline text-foreground">Android</a> ou para{" "}
            <a href="#" className="underline text-foreground">IOS</a>
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

      {/* Carousel placeholder - managed by CMS */}
{/*       <section className="bg-secondary py-2">
        <div className="container">
          <div className="bg-radio-dark rounded-lg overflow-hidden border-2 border-radio-yellow h-20 md:h-24 flex items-center justify-center">
            <p className="text-primary-foreground font-display text-sm text-center px-4">
              📢 Espaço para banners gerenciados pelo Content Weaver
            </p>
          </div>
        </div>
      </section> */}      
      {/* Locutores */}
          <section className="py-16 bg-background">
            <div className="container">

              <div className="relative">

                {/* FAIXA DOS LOCUTORES */}
               <div className="absolute -top-[92px] left-0 w-110 z-10">
                <div className="flex items-end justify-center overflow-hidden">
                  {locutores.map((loc, i) => (
                    <LocutorCard key={i} image={loc.image} />
                  ))}
                </div>
              </div>

                <div className="relative mt-20">
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
      <section className="bg-radio-blue py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
                PROGRAMAÇÃO O DIA<br />
                TODO <span className="text-white">PARA ESTAR</span><br />
                <span className="text-white">SEMPRE COM VOCÊ!</span>
              </h2>
            </div>
            <div className="text-white">
              <h3 className="font-display text-3xl md:text-5xl font-extrabold mb-6">FATO POPULAR</h3>
              <ul className="text-white/70 font-display text-2xl md:text-4xl font-extrabold space-y-2">
                <li className="text-white">BOM DIA 88</li>
                <li>TEMPERATURA GOSPEL</li>
                <li>FAVORITO</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Portal 88 FM - Layout like reference */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-8 bg-radio-blue rounded-full" />
            <h2 className="font-display text-2xl font-extrabold text-foreground uppercase">PORTAL 88 FM</h2>
          </div>

          {/* Grid: 1 large left + 4 small right (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card spanning 2 rows on the left */}
            <div className="md:col-span-1 md:row-span-2 h-[380px] md:h-[500px]">
              <PortalNewsCard {...portalNews[0]} large />
            </div>

            {/* Right side: 2x2 grid for 4 small cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...portalNews[1]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...portalNews[2]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...portalNews[3]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...portalNews[4]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fato Popular News - Layout: 1 large left + 4 small right */}
      <section className="py-10 bg-muted">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card on the left */}
            <div className="md:col-span-1 md:row-span-2 h-[380px] md:h-[500px]">
              <PortalNewsCard {...fatoPopularNews[0]} large />
            </div>
            {/* 4 small cards on the right (2x2) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...fatoPopularNews[1]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...fatoPopularNews[2]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...fatoPopularNews[3]} />
              </div>
              <div className="h-[180px] md:h-[242px]">
                <PortalNewsCard {...fatoPopularNews[4]} />
              </div>
            </div>
          </div>
          <div className="mt-10 max-w-sm mx-auto">
            <a
              href="http://localhost:8082/fatopopular"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-radio-blue font-display font-bold text-white py-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-lg"
            >
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
              className="inline-block mt-6 radio-gradient-accent font-display font-bold text-accent-foreground px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
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
