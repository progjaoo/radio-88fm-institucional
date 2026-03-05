import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import LocutorCard from "@/components/LocutorCard";
import NewsCard from "@/components/NewsCard";
import podcastBanner from "@/assets/podcast-banner.jpg";
import locutor1 from "@/assets/locutor-1.jpg";
import locutor2 from "@/assets/locutor-2.jpg";
import locutor3 from "@/assets/locutor-3.jpg";
import locutor4 from "@/assets/locutor-4.jpg";
import locutor5 from "@/assets/locutor-5.jpg";
import locutor6 from "@/assets/locutor-6.jpg";

const locutores = [
  { name: "Edson Albertassi", image: locutor1, programa: "Bom Dia 88" },
  { name: "Ana Paula", image: locutor2, programa: "Temperatura Gospel" },
  { name: "Pastor Marcos", image: locutor3, programa: "Fato Popular" },
  { name: "DJ Samuel", image: locutor4, programa: "Favorito" },
  { name: "Cintia Souza", image: locutor5, programa: "Receitas da Cintia" },
  { name: "Roberto Silva", image: locutor6, programa: "Programa Especial" },
];

const portalNews = [
  {
    title: "Luto na música gospel: cantor Ron Kenoly morre aos 81 anos",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "The Send reúne 300 mil pessoas em cinco capitais brasileiras",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "'Minha Casa' para renda de até R$ 12 mil começa em maio, diz ministro",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    category: "RECEITAS DA CINTIA",
    link: "http://localhost:8082/radio88fm",
  },
  {
    title: "Como interpretar a Bíblia de forma correta. Dicas para um aprendizado a partir delas.",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&h=300&fit=crop",
    category: "ENQUETE",
    link: "http://localhost:8082/radio88fm",
  },
];

const fatoPopularNews = [
  {
    title: "Dólar sobe 3% e Ibovespa cai 3% após retaliação da China a tarifaço de Trump",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
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
      <section className="bg-secondary py-2">
        <div className="container">
          <div className="bg-radio-dark rounded-lg overflow-hidden border-2 border-radio-yellow h-20 md:h-24 flex items-center justify-center">
            <p className="text-primary-foreground font-display text-sm text-center px-4">
              📢 Espaço para banners gerenciados pelo Content Weaver
            </p>
          </div>
        </div>
      </section>

      {/* Locutores */}
      <section className="radio-gradient py-8 md:py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {locutores.map((loc) => (
              <LocutorCard key={loc.name} {...loc} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-primary-foreground text-xs uppercase tracking-wider mb-1">Programação o dia todo</p>
              <p className="font-display text-xl md:text-2xl font-extrabold text-radio-yellow leading-tight">
                PARA ESTAR<br />SEMPRE COM VOCÊ!
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-primary-foreground">FATO POPULAR</h3>
              <ul className="text-primary-foreground/80 text-sm space-y-1 mt-2">
                <li className="font-bold text-primary-foreground">BOM DIA 88</li>
                <li>TEMPERATURA GOSPEL</li>
                <li>FAVORITO</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Portal 88 FM */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-8 bg-radio-blue rounded-full" />
            <h2 className="font-display text-2xl font-extrabold text-foreground">PORTAL 88 FM</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {portalNews.map((news, i) => (
              <NewsCard key={i} {...news} />
            ))}
          </div>
          <div className="mt-6">
            <a
              href="http://localhost:8082/radio88fm"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center radio-gradient font-display font-bold text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Ver mais
            </a>
          </div>
        </div>
      </section>

      {/* Fato Popular News */}
      <section className="py-10 bg-muted">
        <div className="container">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fatoPopularNews.map((news, i) => (
                <NewsCard key={i} {...news} />
              ))}
            </div>
          </div>
          <div className="mt-6">
            <a
              href="http://localhost:8082/fatopopular"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center radio-gradient-accent font-display font-bold text-accent-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
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
