import { useEffect, useMemo, useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, Radio, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import LocutorCard from "@/components/LocutorCard";
import YoutubeSection from "@/components/YoutubeSection";
import fundolocutores from "@/assets/fundolocutores.png";
import { useYoutubeContent } from "@/hooks/useYoutubeContent";
import { Analytics } from "@/services/analytics/analytics";
import podcastbanner from "@/assets/podcastbanner.png";
import podcastBannerMobile from "@/assets/podcastbannermobile.png";
import podcastBanner from "@/assets/podcastbanner.jpg";
import programacaoImg from "@/assets/programacao.png";
import programacaoMobileImg from "@/assets/programacaomobile.png";
import uelison from "@/assets/locutores-atual/uelison.png";
import jose from "@/assets/locutores-atual/geraldojose1.png";
import jose2 from "@/assets/locutores-atual/geraldojose2.png";
import favorito from "@/assets/locutores-atual/cintia.png";
import favorito2 from "@/assets/locutores-atual/regis.png";
import leandro from "@/assets/locutores-atual/leandro.png";
import miq from "@/assets/locutores-atual/miqueias.png";
import geraldoalb from "@/assets/locutores-atual/geraldoalb.png";
import betin from "@/assets/locutores-atual/betinho.png";
import leticia from "@/assets/locutores-atual/leticia.png";
import dario from "@/assets/locutores-atual/dario.png";
import lualves from "@/assets/locutores-atual/lualves.png";
import fato1 from "@/assets/locutores-atual/amado.png";
import fato2 from "@/assets/locutores-atual/vogel.png";
import fato3 from "@/assets/locutores-atual/teko.png";
import fato4 from "@/assets/locutores-atual/marli.png";

interface PostDestaque {
  id: number;
  titulo: string;
  conteudo: string;
  editorial: string;
  imagemCapaUrl: string;
  link?: string;
}

interface BannerInstitucional {
  id: number;
  titulo: string;
  midiaUrl: string;
  linkUrl: string;
  novaAba: boolean;
  posicao: string;
  ordem: number;
}

type HeroSlide =
  | { type: "static"; id: "hero-static" }
  | ({ type: "banner" } & BannerInstitucional);

interface ProgramaCard {
  id: number;
  nomePrograma: string;
  apresentador?: string;
  descricao?: string;
  horaInicio: string;
  horaFim: string;
  diaSemana: number;
  imagem?: string;
  ativo?: boolean;
}

const locutores = [
  { image: uelison }, { image: jose }, { image: jose2 }, { image: favorito },
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
const PortalNewsCard = ({ titulo, imagemCapaUrl, editorial, id, large = false }: { titulo: string; imagemCapaUrl: string; editorial: string; id: number; large?: boolean }) => {
  const content = (
    <>
      <div className={large ? "absolute inset-0" : "relative aspect-[4/3] overflow-hidden"}>
        <img 
          src={imagemCapaUrl} 
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
      target="_blank"
      href={`http://localhost:8083/noticia/${id}`} 
      className={`group overflow-hidden rounded-lg ${large ? "relative block h-full min-h-[350px]" : "block bg-card shadow-sm hover:shadow-md transition-shadow"}`}
    >
      {content}
    </a>
  );
};

const Index = () => {
  // Substituído por YouTubeCarouselSection. Manter para rollback se necessário.
  // const [portalNews, setPortalNews] = useState<PostDestaque[]>([]);
  // const [fatoPopularNews, setFatoPopularNews] = useState<PostDestaque[]>([]);
  const [banners, setBanners] = useState<BannerInstitucional[]>([]);
  // Programacao dinamica preservada para rollback futuro da secao via API.
  // const [programas, setProgramas] = useState<ProgramaCard[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  // const [loading, setLoading] = useState(true);
  const {
    videos: youtubeVideos,
    shorts: youtubeShorts,
    loading: youtubeLoading,
    error: youtubeError,
  } = useYoutubeContent(6);

  // const formatarHora = (hora: string) => hora?.substring(0, 5) || "--:--";
  const heroSlides = useMemo<HeroSlide[]>(
    () => [{ type: "static", id: "hero-static" }, ...banners.map((banner) => ({ ...banner, type: "banner" as const }))],
    [banners]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const resBanners = await fetch("http://localhost:5091/api/banner-institucional/ativos?emissoraId=1&posicao=home");

        if (resBanners.ok) setBanners(await resBanners.json());
        // Programacao dinamica substituida temporariamente por imagem estatica do Designer.
        // Para rollback, reativar o state `programas`, `formatarHora`, este fetch e a secao JSX preservada abaixo.
        // const resProgramacao = await fetch("http://localhost:5091/api/programacao/emissora/1/buscarTodos");
        // if (resProgramacao.ok) {
        //   const data: ProgramaCard[] = await resProgramacao.json();
        //   setProgramas(data.filter((programa) => programa.ativo !== false).slice(0, 3));
        // }
      } catch (error) {
        console.error("Erro ao buscar dados institucionais:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (youtubeError) {
      console.warn("Erro ao carregar vídeos do YouTube:", youtubeError);
    }
  }, [youtubeError]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [heroSlides]);

  useEffect(() => {
    if (activeBanner <= heroSlides.length - 1) return;
    setActiveBanner(0);
  }, [activeBanner, heroSlides.length]);

  const currentSlide = heroSlides[activeBanner];
  const previousSlide = heroSlides[(activeBanner - 1 + heroSlides.length) % heroSlides.length];
  const nextSlide = heroSlides[(activeBanner + 1) % heroSlides.length];

  const renderHeroSlide = (slide: HeroSlide) => {
    if (slide.type === "static") {
      return (
        <div className="relative min-h-[420px] bg-white px-4 py-10 md:min-h-[560px] md:px-12 md:py-14 lg:px-20">
          <div className="relative mx-auto flex min-h-[340px] max-w-4xl flex-col items-center justify-center text-center md:min-h-[410px]">
            <p className="font-display text-[clamp(2.1rem,12vw,4.8rem)] font-light uppercase leading-[0.95] tracking-[-0.04em] text-foreground">
              VOCÊ ESTÁ NA <span className="font-extrabold">88FM</span>,
            </p>
            <p className="mt-2 font-display text-[clamp(2.15rem,12.5vw,5.2rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.05em] text-foreground">
              A RÁDIO QUE TOCA
              <br />
              O SOM DO CÉU!
            </p>

            <div className="mt-7 flex w-full max-w-sm flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4 md:mt-8">
              <Link
                to="/ouvir"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-radio-red px-7 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:scale-[1.02] sm:w-auto"
              >
                <Radio size={18} />
                Ouvir ao vivo
              </Link>
              <Link
                to="/assistir"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-radio-yellow px-7 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-radio-dark transition-transform hover:scale-[1.02] sm:w-auto"
              >
                <Video size={18} />
                Assistir ao vivo
              </Link>
            </div>

            <p className="mt-8 text-base text-foreground/85 md:mt-10 md:text-xl">
              Ou baixe nosso App para{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.sentinel4.radio88&hl=pt_BR"
                onClick={() => Analytics.track("download_app", { platform: "android", location: "hero" })}
                className="font-semibold underline underline-offset-4"
                target="_blank"
              >
                Android
              </a> ou para{" "}
              <a
                href="https://apps.apple.com/br/app/r%C3%A1dio-88-fm-o-som-do-c%C3%A9u/id1587595590"
                onClick={() => Analytics.track("download_app", { platform: "ios", location: "hero" })}
                className="font-semibold underline underline-offset-4"
                target="_blank"
              >
                Apple
              </a>
            </p>

            <div className="mt-5 flex items-center gap-3 md:mt-6 md:gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-sm transition-colors hover:border-radio-blue hover:text-radio-blue md:h-12 md:w-12 md:rounded-2xl"
                  aria-label={label}
                >
                  <Icon size={21} />
                </a>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const bannerImage = (
      <div className="relative min-h-[420px] bg-muted md:min-h-[560px]">
        <img
          src={slide.midiaUrl || podcastBanner}
          alt={slide.titulo || "Carrossel institucional"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );

    if (slide.linkUrl) {
      return (
        <a
          href={slide.linkUrl}
          target={slide.novaAba ? "_blank" : "_self"}
          rel="noreferrer"
          onClick={() =>
            Analytics.track("hero_banner_click", {
              banner_id: slide.id,
              banner_title: slide.titulo,
            })
          }
          className="block h-full w-full"
          aria-label={slide.titulo || "Banner institucional"}
        >
          {bannerImage}
        </a>
      );
    }

    return bannerImage;
  };

  const renderHeroPeek = (slide: HeroSlide, side: "left" | "right") => {
    if (slide.type === "static") {
      return <div className="h-full w-full bg-white" />;
    }

    return (
      <div className="relative h-full w-full bg-muted">
        <img
          src={slide.midiaUrl || podcastBanner}
          alt={slide.titulo || "Prévia do carrossel"}
          className="h-full w-full object-cover"
          style={{ objectPosition: side === "left" ? "center center" : "center center" }}
        />
      </div>
    );
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="overflow-x-hidden bg-background py-4 md:py-8">
        <div className="container">
          <div className="relative min-h-[420px] md:min-h-[560px]">
            <div className="pointer-events-none absolute inset-y-0 -left-40 z-0 hidden w-[540px] -translate-x-[500px] overflow-hidden rounded-[20px] lg:block xl:w-[520px] xl:-translate-x-[500px]">
              <div
                key={`peek-left-${previousSlide.type === "static" ? previousSlide.id : previousSlide.id}`}
                className="h-full w-full animate-in fade-in duration-400 ease-out"
              >
                {renderHeroPeek(previousSlide, "left")}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 -right-40 z-0 hidden w-[540px] translate-x-[500px] overflow-hidden rounded-[20px] lg:block xl:w-[520px] xl:translate-x-[500px]">
              <div
                key={`peek-right-${nextSlide.type === "static" ? nextSlide.id : nextSlide.id}`}
                className="h-full w-full animate-in fade-in duration-400 ease-out"
              >
                {renderHeroPeek(nextSlide, "right")}
              </div>
            </div>

            <div className="relative z-10 overflow-hidden rounded-[18px] bg-white lg:mx-[90px] xl:mx-[0px]">
              <div
                key={`hero-center-${currentSlide.type === "static" ? currentSlide.id : currentSlide.id}`}
                className="animate-in fade-in duration-500 ease-out"
              >
                {renderHeroSlide(currentSlide)}
              </div>
            </div>

            {heroSlides.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveBanner(index)}
                  className={`h-1.5 transition-all duration-300 ${
                  index === activeBanner
                    ? "w-8 rounded-sm bg-radio-blue"
                    : "w-4 rounded-sm bg-border"
                }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Locutores */}
      <section className="hidden bg-background py-1 lg:block">
        <div className="container">
          <div className="relative">
            <div className="absolute -top-[145px] left-0 w-full z-10">
              <div className="flex items-end justify-start overflow-hidden -space-x-10"> 
                {locutores.map((loc, i) => (
                  <LocutorCard key={i} image={loc.image} />
                ))}
              </div>
            </div>
            <div className="relative mt-10">
              <img src={fundolocutores} alt="88FM" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Programming Section - substituida por imagem estatica do Designer */}
      <section className="py-5 md:py-10">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <img
            src={programacaoImg}
            alt="Programacao o dia todo para estar sempre com voce"
            className="hidden h-auto w-full rounded-[28px] object-cover sm:block"
            loading="lazy"
          />
          <img
            src={programacaoMobileImg}
            alt="Programacao o dia todo para estar sempre com voce"
            className="h-auto w-full rounded-[18px] object-cover sm:hidden"
            loading="lazy"
          />
        </div>
      </section>

      {/* Programming Section dinamica preservada para rollback.
          Foi substituida temporariamente por imagem estatica do Designer.
          Quando a programacao voltar a ser gerenciada pela API, reativar este bloco e a logica relacionada.
      <section className="bg-radio-blue py-14 md:py-5 rounded-[40px] mx-4 xl:mx-140 max-w-[2400px] mb-14">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div className="text-white">
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                PROGRAMAÇÃO O DIA TODO<br />
                <span className="text-white font-bold">PARA ESTAR</span><br />
                <span className="text-white font-bold">SEMPRE COM VOCÊ!</span>
              </h2>
            </div>
            <div className="text-white">
              <h3 className="font-display text-3xl md:text-5xl font-extrabold mb-6">NO AR NA 88 FM</h3>
              {programas.length > 0 ? (
                <div className="space-y-3">
                  {programas.map((programa) => (
                    <div
                      key={programa.id}
                      className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-xl font-bold text-white">{programa.nomePrograma}</p>
                          {programa.apresentador && (
                            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-white/70">
                              {programa.apresentador}
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          {formatarHora(programa.horaInicio)} - {formatarHora(programa.horaFim)}
                        </span>
                      </div>
                      {programa.descricao && (
                        <p className="mt-3 text-sm leading-6 text-white/80 line-clamp-2">{programa.descricao}</p>
                      )}
                    </div>
                  ))}
                  <a
                    href="/programacao"
                    className="inline-flex items-center rounded-md border border-white/30 px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-radio-blue"
                  >
                    Ver programação completa
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-sm text-white/80 backdrop-blur-sm">
                  {loading ? "Carregando programação..." : "Nenhum programa ativo cadastrado no momento."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* --- SEÇÃO PORTAL 88 FM antiga, substituída por YouTube Data API v3. Mantida para rollback.
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
            <a href="http://localhost:8082/radio88fm" target="_blank" className="block w-full text-center bg-radio-blue font-display font-bold text-white py-2 rounded-md hover:opacity-90 transition-opacity uppercase tracking-widest text-lg">
              Ver mais
            </a>
          </div>
        </div>
      </section>
      */}
      {/* --- SEÇÃO FATO POPULAR antiga, substituída por Shorts do YouTube. Mantida para rollback.
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
            <a href="http://localhost:8082/fatopopular" target="_blank" className="block w-full text-center bg-radio-blue font-display font-bold text-white py-2 rounded-md hover:opacity-90 transition-opacity uppercase tracking-widest text-lg">
              Ver mais
            </a>
          </div>
        </div>
      </section>
      */}
      <YoutubeSection
        videos={youtubeVideos}
        shorts={youtubeShorts}
        loading={youtubeLoading}
        moreHref="https://www.youtube.com/@radio88oficial"
      />

      {/* Podcast Banner */}
      {/* <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50"
          style={{ backgroundImage: `url(${podcastBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient from-radio-dark via-transparent to-transparent" />
        <div className="relative bg-radio-dark/80 py-12 md:py-16">
          <div className="container">
            <div className="container">
              <h2 className="font-display ml-8 text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
                VENHA FAZER SEU<br /><span className="text-radio-yellow">PODCAST</span> COM<br />A GENTE!
              </h2>
              <a href="https://wa.me/5524998680088" target="_blank" className="inline-block mt-6 radio-gradient-accent font-display text-white font-bold px-8 py-3 rounded-md hover:opacity-90 transition-opacity">
                FALE CONOSCO NO WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </section> */}
      <section className="py-5 md:py-10">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <a
            href="https://wa.me/5524998680088"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fale conosco no WhatsApp"
            onClick={() => Analytics.track("podcast_click", { location: "home" })}
            className="block"
          >
            <img
              src={podcastbanner}
              alt="Venha fazer seu podcast com a gente"
              className="hidden h-auto w-full cursor-pointer rounded-[28px] object-cover sm:block"
              loading="lazy"
            />
            <img
              src={podcastBannerMobile}
              alt="Venha fazer seu podcast com a gente"
              className="h-auto w-full cursor-pointer rounded-[18px] object-cover sm:hidden"
              loading="lazy"
            />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Index;
