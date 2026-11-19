import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Calendar, CalendarCheck, CalendarDays, Check, ChevronDown, ChevronRight, CirclePlay, ExternalLink, Eye, Menu, MessageCircle, Mic, Play, Search, Users, Video, Volume2, X, type LucideIcon } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../../../src/components/ui/navigation-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../src/components/ui/tabs";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import Footer from "../../../src/components/Footer";
import SocialRail from "../../../src/components/SocialRail";
import FloatingWhatsAppButton from "../../../src/components/FloatingWhatsAppButton";
import AppDownloadLinks from "../../../src/components/AppDownloadLinks";
import MicrophoneIcon from "../../../src/components/MicrophoneIcon";
import { MemoryRouter } from "react-router-dom";
import "../../../src/index.css";
import "./proposta.css";
import logoWhite from "../../../src/assets/logoheadsvg.svg";
import logoColor from "../../../src/assets/logoheadsvgcolor.svg";

const categories = [
  { id: "debate-88", name: "Debate 88", description: "Para mais de 1 milhão de amigos", icon: Mic, playlist: "PLWmzVwopd1_UaDR64PfoC7LOvTq0PCwuf" },
  { id: "altar-88", name: "Altar 88", description: "Um culto em seu lar", icon: BookOpen, playlist: "PLWmzVwopd1_VpfAHf80JhyfQFpex4rwrx" },
  { id: "encerramento-enquete-88", name: "Encerramento Enquete 88", description: "Pense com Prof. Miquéias", icon: MessageCircle, playlist: "PLWmzVwopd1_WexoQ1Zq5OVX-wEFSvpRTL" },
  { id: "cristo-em-nos", name: "Cristo em Nós", description: "Convidados Especiais e muita música", icon: Users, playlist: "PLWmzVwopd1_XoRX--CGuvsEUkXUjFFLBM" },
];
const categoryTabs = [{ id: "todos", name: "Todos os conteúdos" }, ...categories];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
// Os vídeos são das playlists oficiais; datas e métricas são dados de demonstração.
const samples = [
  { id: "rXh6N6r07ng", category: "debate-88", title: "Violência em Volta Redonda: qual é o papel da igreja nessa realidade?", number: "#104", date: "2026-11-13", duration: "1:22:35", views: 12800 },
  { id: "_1zHTzpae5c", category: "altar-88", title: "Desça a casa do oleiro | Pastor Marcos Lengruber", date: "2026-11-17", duration: "14:58", views: 3200 },
  { id: "F1lZ8kA3pdo", category: "encerramento-enquete-88", title: "O problema é espiritualizar o que seria prático | Miquéias Nechaeff", date: "2026-11-17", duration: "12:23", views: 6800 },
  { id: "JhK2LCQ5IN4", category: "cristo-em-nos", title: "Teologia de John Wesley | Programa Cristo em Nós", number: "#050", date: "2026-11-14", duration: "2:23:32", views: 5200 },
  { id: "wHasj-cXIas", category: "altar-88", title: "Exercitando a fé | Pastora Adriana", date: "2026-11-16", duration: "30:11", views: 2600 },
  { id: "3TBwKkn4e68", category: "encerramento-enquete-88", title: "Você desaprendeu a ser evangélico | Miquéias Nechaeff", date: "2026-11-16", duration: "14:26", views: 4300 },
  { id: "nHiPodv0GT8", category: "debate-88", title: "Submissão da mulher: onde termina o ensino bíblico e começa o machismo?", number: "#090", date: "2025-10-24", duration: "1:09:00", views: 7400 },
  { id: "eUP9iZoYGUo", category: "cristo-em-nos", title: "Fé e milagres | Programa Cristo em Nós", number: "#048", date: "2026-10-31", duration: "2:01:33", views: 2900 },
  { id: "Aj1yXCi3RW4", category: "debate-88", title: "Tempo da ignorância: Deus desconsidera o pecado cometido sem conhecimento?", date: "2026-10-30", duration: "1:05:00", views: 4500 },
  { id: "KMdEm6KboOw", category: "debate-88", title: "Quais são os desafios de ensinar a Bíblia às crianças hoje?", number: "#101", date: "2026-10-23", duration: "1:02:00", views: 3900 },
  { id: "ff0F1Q2qmNQ", category: "debate-88", title: "Renovação no louvor: renovação saudável ou etarismo?", number: "#100", date: "2026-10-16", duration: "1:00:00", views: 5200 },
  { id: "TPf9mvDE58Y", category: "debate-88", title: "Eleições: a fé do candidato deve influenciar o voto do cristão?", number: "#099", date: "2026-10-09", duration: "1:13:00", views: 7100 },
  { id: "O3AOYVfOtIA", category: "debate-88", title: "Conservadorismo: quando a sociedade muda, o que o cristão deve preservar?", number: "#098", date: "2026-10-02", duration: "1:07:00", views: 4800 },
  { id: "CFwGGvGUyWU", category: "altar-88", title: "Cuide dos seus filhos ensinando a Palavra | Pastor Márcio", date: "2026-11-13", duration: "22:00", views: 2350 },
  { id: "slO7pfeCaG0", category: "altar-88", title: "Mananciais | Pastor Marcos Rogério", date: "2026-11-12", duration: "29:00", views: 1910 },
  { id: "IN1JvpiV0vE", category: "altar-88", title: "Características da Igreja do Deus vivo | Apóstolo Robson Lara", date: "2026-11-11", duration: "26:00", views: 2280 },
  { id: "E2YO1VBOdJA", category: "altar-88", title: "Um Deus de ordem | Pastor Sidney", date: "2026-11-10", duration: "28:00", views: 2030 },
  { id: "x0WoFV8xowA", category: "altar-88", title: "Tire a pedra do caminho | Pastora Elza", date: "2026-11-09", duration: "32:00", views: 2100 },
  { id: "I1CwZSmJFmU", category: "encerramento-enquete-88", title: "Músicos da igreja devem receber pagamento? | Miquéias Nechaeff", date: "2026-11-13", duration: "13:09", views: 3750 },
  { id: "rj6HI1At9Iw", category: "encerramento-enquete-88", title: "É uma falácia lógica e isso não pode ser considerado | Miquéias Nechaeff", date: "2026-11-12", duration: "9:28", views: 3230 },
  { id: "m_qTj67yi2M", category: "encerramento-enquete-88", title: "A liderança religiosa não tem poder para amaldiçoar ninguém | Miquéias Nechaeff", date: "2026-11-11", duration: "8:30", views: 3600 },
  { id: "TBG3Wn2rsg4", category: "encerramento-enquete-88", title: "É preciso ouvir a voz de Deus | Miquéias Nechaeff", date: "2026-11-10", duration: "10:14", views: 2900 },
  { id: "M3UnQb5Wqzg", category: "encerramento-enquete-88", title: "Não é só agradecer | Miquéias Nechaeff", date: "2026-11-09", duration: "11:13", views: 2450 },
  { id: "3ES9q4ts9Lg", category: "cristo-em-nos", title: "Deus chama os improváveis", number: "#047", date: "2026-10-24", duration: "2:01:00", views: 3180 },
  { id: "vRHSZuFt0EY", category: "cristo-em-nos", title: "Pentecostalismo: estou no ministério pela razão certa?", number: "#046", date: "2026-10-17", duration: "1:54:00", views: 2770 },
  { id: "5N617iek4N4", category: "cristo-em-nos", title: "As verdadeiras missionárias do pentecostalismo clássico", number: "#045", date: "2026-10-10", duration: "1:57:00", views: 3050 },
  { id: "RvuzYxd6ng0", category: "cristo-em-nos", title: "Mulher solteira no ministério: respondendo às perguntas difíceis", number: "#044", date: "2026-10-03", duration: "2:16:00", views: 2850 },
  { id: "f0pG7p6m__I", category: "cristo-em-nos", title: "Por que ainda precisamos do círculo de oração?", number: "#043", date: "2026-09-26", duration: "1:59:00", views: 3150 },
];
type Sample = typeof samples[number];
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const dateLabel = (s: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(s + "T12:00:00Z"));

export function FilterSelect({ label, icon: Icon, value, onChange, options, disabled = false }: { label: string; icon: LucideIcon; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) {
  return (
    <div className="filter-field">
      <span className="field-label">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="prototype-select" aria-label={"Filtrar por " + label.toLowerCase()} aria-describedby={disabled ? "date-filter-hint" : undefined}>
          <span className="filter-trigger-value"><Icon aria-hidden="true" /><SelectValue /></span>
        </SelectTrigger>
        <SelectContent className="filter-options">
          <SelectGroup>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Proposal() {
  const params = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(() => categoryTabs.find(tab => tab.id === params.get("categoria"))?.id ?? "todos");
  const [query, setQuery] = useState(params.get("q") || "");
  const [year, setYear] = useState(params.get("ano") || "todos");
  const [month, setMonth] = useState(params.get("mes") || "todos");
  const [day, setDay] = useState(params.get("dia") || "todos");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [menuValue, setMenuValue] = useState("");
  const [notice, setNotice] = useState("");
  const validDays = year !== "todos" && month !== "todos" ? new Date(Number(year), Number(month), 0).getDate() : 0;

  useEffect(() => {
    const p = new URLSearchParams();
    for (const [key, value] of Object.entries({ categoria: category, q: query, ano: year, mes: month, dia: day })) {
      if (value && value !== "todos") p.set(key, value);
    }
    window.history.replaceState(null, "", window.location.pathname + (p.size ? "?" + p.toString() : ""));
  }, [category, query, year, month, day]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      document.getElementById("prototype-menu-trigger")?.focus();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileOpen]);

  const changeCategory = (value: string) => { setCategory(value); setMenuValue(""); setMobileOpen(false); };
  const changeDate = (type: "year" | "month", value: string) => {
    if (type === "year") setYear(value); else setMonth(value);
    const y = type === "year" ? value : year;
    const m = type === "month" ? value : month;
    if (y === "todos" || m === "todos" || Number(day) > new Date(Number(y), Number(m), 0).getDate()) setDay("todos");
  };
  const filtered = useMemo(() => samples.filter(v =>
    (category === "todos" || v.category === category) &&
    (year === "todos" || v.date.slice(0, 4) === year) &&
    (month === "todos" || Number(v.date.slice(5, 7)) === Number(month)) &&
    (day === "todos" || Number(v.date.slice(8)) === Number(day)) &&
    normalize(v.title + " " + (v.number || "")).includes(normalize(query))
  ).sort((a,b) => b.date.localeCompare(a.date)), [category, query, year, month, day]);
  const featured = [...filtered].sort((a, b) => b.views - a.views)[0];
  const remaining = filtered.filter(v => v.id !== featured?.id).slice(0, 6);
  const activeCategory = categories.find(c => c.id === category);
  const archiveUrl = activeCategory ? `https://www.youtube.com/playlist?list=${activeCategory.playlist}` : "https://www.youtube.com/@radio88oficial/playlists";
  const hasFilters = query || year !== "todos" || month !== "todos" || day !== "todos";
  const clear = () => { setQuery(""); setYear("todos"); setMonth("todos"); setDay("todos"); };
  const previewAction = () => setNotice("Este é um modelo visual para aprovação. O player e a API serão conectados na implementação.");
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name || "Conteúdos";
  const art = (video: Sample, big = false) => <button className="video-art" onClick={previewAction} aria-label={"Prévia de " + video.title}><img src={"https://i.ytimg.com/vi/" + video.id + "/hqdefault.jpg"} alt="" width={480} height={360} loading={big ? "eager" : "lazy"} {...(big ? { fetchpriority: "high" } : {})} /><span className="art-shade" /><span className="play-circle"><Play fill="currentColor" aria-hidden="true" /></span>{video.number && <span className="edition-number">{video.number}</span>}<span className="duration">{video.duration}</span></button>;

  const categoryPanel = <>
      <section className="content-filters" aria-label="Filtros de conteúdos">
        <label className="filter-field search-field"><span className="field-label">Buscar conteúdo</span><span className="search-wrap"><Search aria-hidden="true" /><Input type="search" name="q" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: fé, família, #104…" /></span></label>
        <FilterSelect label="Ano" icon={Calendar} value={year} onChange={v => changeDate("year", v)} options={[{value:"todos",label:"Todos"},{value:"2026",label:"2026"},{value:"2025",label:"2025"}]} />
        <FilterSelect label="Mês" icon={CalendarDays} value={month} onChange={v => changeDate("month", v)} options={[{value:"todos",label:"Todos"},...monthNames.map((m,i) => ({value:String(i+1),label:m}))]} />
        <FilterSelect label="Dia" icon={CalendarCheck} value={day} onChange={setDay} disabled={!validDays} options={[{value:"todos",label:"Todos"},...Array.from({length:validDays},(_,i) => ({value:String(i+1),label:String(i+1).padStart(2,"0")}))]} />
      </section>
      {!validDays && <p id="date-filter-hint" className={year !== "todos" || month !== "todos" ? "date-hint" : "sr-only"}>Escolha ano e mês para filtrar por dia.</p>}
      <div className={hasFilters ? "filter-summary" : "sr-only"}>
        <p aria-live="polite">{filtered.length} {filtered.length === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}</p>
        {hasFilters && <Button variant="ghost" size="sm" onClick={clear}><X aria-hidden="true" /> Limpar filtros</Button>}
      </div>
      {featured ? <>
        <section className="featured-section" aria-labelledby="featured-title"><div className="section-title"><h2 id="featured-title">Mais assistido na seleção</h2></div><article className="featured-content">{art(featured,true)}<div className="featured-copy"><span className="category-badge"><span />{categoryName(featured.category)}</span><h3>{featured.title}</h3><div className="metadata"><span><CalendarDays aria-hidden="true" />{dateLabel(featured.date)}</span><span><Eye aria-hidden="true" />{new Intl.NumberFormat("pt-BR",{notation:"compact",maximumFractionDigits:1}).format(featured.views)} visualizações</span></div><Button className="watch-button" size="lg" onClick={previewAction}><CirclePlay aria-hidden="true" /> Assistir conteúdo</Button></div></article></section>
        {remaining.length > 0 && (
          <section className="archive-section" aria-labelledby="archive-title">
            <div className="section-title"><h2 id="archive-title">{activeCategory ? `Mais de ${activeCategory.name}` : "Explore os conteúdos"}</h2></div>
            <div className="video-grid">{remaining.map(v => <article className="content-tile" key={v.id}>{art(v)}<p className="tile-category">{categoryName(v.category)}</p><h3>{v.title}</h3><div className="tile-meta"><time dateTime={v.date}>{dateLabel(v.date)}</time><span aria-hidden="true">•</span><span>{new Intl.NumberFormat("pt-BR",{notation:"compact",maximumFractionDigits:1}).format(v.views)} visualizações</span></div></article>)}</div>
          </section>
        )}
      </> : <section className="empty-selection"><Search aria-hidden="true" /><h2>Nenhum conteúdo nessa seleção</h2><p>Experimente outro tema ou ajuste a data.</p><Button variant="outline" onClick={clear}>Limpar busca e datas</Button></section>}
      <div className="archive-more"><Button asChild variant="outline" size="lg" className="archive-link"><a href={archiveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver mais ${activeCategory ? `de ${activeCategory.name} ` : ""}no YouTube (abre em nova aba)`}>Ver mais no YouTube <ExternalLink aria-hidden="true" /></a></Button></div>
      <p className="prototype-data-note">Dados ilustrativos nesta prévia.</p>
  </>;

  return <div className="radio-shell">
    <a href="#main-content" className="prototype-skip-link">Pular para o conteúdo</a>
    <header className="site-header"><a className="brand-logo" href="#inicio" onClick={e => {e.preventDefault();previewAction();}} aria-label="Rádio 88 FM"><img src={logoWhite} alt="Rádio 88 FM" width={40} height={40} /></a>
      <div className="desktop-links"><a href="#inicio" onClick={e => {e.preventDefault();previewAction();}}>INÍCIO</a><a href="#nossa-radio" onClick={e => {e.preventDefault();previewAction();}}>NOSSA RÁDIO</a>
        <NavigationMenu aria-label="Programas em Conteúdos" className="content-navigation" delayDuration={150} value={menuValue} onValueChange={setMenuValue}><NavigationMenuList><NavigationMenuItem value="conteudos"><NavigationMenuTrigger className="contents-trigger">CONTEÚDOS</NavigationMenuTrigger><NavigationMenuContent><div className="dropdown-panel"><p>ESCOLHA O SEU PROGRAMA</p>{categories.map(c => <NavigationMenuLink asChild key={c.id}><a className="category-link" href={"?categoria=" + c.id} onClick={e => {e.preventDefault();changeCategory(c.id);}}><span className="menu-icon"><c.icon aria-hidden="true" /></span><span><strong>{c.name}</strong><small>{c.description}</small></span><ChevronRight aria-hidden="true" /></a></NavigationMenuLink>)}</div></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>
        <a href="#feed" onClick={e => {e.preventDefault();previewAction();}}>FEED</a><a href="#equipe" onClick={e => {e.preventDefault();previewAction();}}>EQUIPE</a>
      </div>
      <div className="header-actions"><button className="button blue" onClick={previewAction}>ANUNCIE</button><button className="button red" onClick={previewAction}><span className="live-dot" /> OUVIR AO VIVO</button><button className="button yellow" onClick={previewAction}><Video aria-hidden="true" /> ASSISTIR</button></div>
      <button id="prototype-menu-trigger" className="mobile-toggle" aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      {mobileOpen && <nav id="mobile-menu" className="mobile-menu" aria-label="Navegação mobile"><a href="#inicio" onClick={e => {e.preventDefault();previewAction();}}>INÍCIO</a><a href="#nossa-radio" onClick={e => {e.preventDefault();previewAction();}}>NOSSA RÁDIO</a><button aria-expanded={contentsOpen} aria-controls="mobile-contents" onClick={() => setContentsOpen(!contentsOpen)}>CONTEÚDOS <ChevronDown /></button>{contentsOpen && <div id="mobile-contents">{categories.map(c => <a key={c.id} href={"?categoria=" + c.id} onClick={e => {e.preventDefault();changeCategory(c.id);}}><c.icon aria-hidden="true" />{c.name}</a>)}</div>}<a href="#feed" onClick={e => {e.preventDefault();previewAction();}}>FEED</a><a href="#equipe" onClick={e => {e.preventDefault();previewAction();}}>EQUIPE</a><div className="mobile-actions"><button className="button blue" onClick={previewAction}>ANUNCIE</button><button className="button red" onClick={previewAction}>OUVIR AO VIVO</button><button className="button yellow" onClick={previewAction}>ASSISTIR</button></div></nav>}
    </header>
    <main id="main-content" className="content-shell" tabIndex={-1}>
      <h1 className="page-title font-display text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">Conteúdos</h1>
      <Tabs value={category} onValueChange={changeCategory} activationMode="manual">
        <TabsList className="category-tabs" aria-label="Filtrar por programa">
          {categoryTabs.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="category-tab font-body">{tab.name}</TabsTrigger>)}
        </TabsList>
        {categoryTabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="category-panel">
            {category === tab.id ? categoryPanel : null}
          </TabsContent>
        ))}
      </Tabs>
    </main>
    <Footer />
    <section className="prototype-player radio-player radio-gradient" aria-label="Prévia visual do mini player">
      <div className="radio-player-controls mini-player-layout mx-auto w-full max-w-[1920px]">
        <div className="mini-player-program">
          <div className="mini-player-live" data-on-air={false}>
            <span>RÁDIO</span><div className="mini-player-mic-disc"><MicrophoneIcon /></div>
          </div>
          <div className="mini-player-program-link">
            <img src={logoColor} alt="Rádio 88 FM" width={42} height={42} className="mini-player-artwork" />
            <div className="mini-player-identity"><p className="mini-player-program-name">Rádio 88 FM</p><p className="mini-player-program-time">O som do céu</p></div>
          </div>
        </div>
        <AppDownloadLinks />
        <div className="mini-player-actions">
          <div className="mini-player-status"><strong>Rádio 88 FM</strong></div>
          <button type="button" className="prototype-player-play" aria-label="Prévia do botão reproduzir" onClick={previewAction}><Play size={20} aria-hidden="true" /></button>
          <div className="mini-player-volume">
            <button type="button" className="mini-player-mute" aria-label="Prévia do controle de som" onClick={previewAction}><Volume2 size={21} aria-hidden="true" /></button>
            <input type="range" className="mini-player-volume-range" aria-label="Volume demonstrativo" defaultValue={100} />
          </div>
        </div>
      </div>
    </section>
    <SocialRail />
    <FloatingWhatsAppButton />
    {notice && <div className="prototype-toast" role="status"><Check aria-hidden="true" /><p>{notice}</p><button aria-label="Fechar aviso" onClick={() => setNotice("")}><X /></button></div>}
  </div>;
}

createRoot(document.getElementById("root")!).render(<MemoryRouter initialEntries={["/conteudos"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Proposal /></MemoryRouter>);
