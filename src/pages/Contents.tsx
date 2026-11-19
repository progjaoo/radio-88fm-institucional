import { useRef, useState, type MouseEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CalendarCheck, CalendarDays, CirclePlay, ExternalLink, Eye, ListVideo, Play, Search, X, type LucideIcon } from "lucide-react";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getRouteSeoConfig } from "@/services/seo/seoConfig";
import {
  allCategories, channelPlaylistsUrl, contentCategories, editionNumber, fetchVideoContents, formatContentDate,
  formatContentViews, readContentFilters, selectContent, watchUrl, type ContentVideo,
} from "@/services/video-contents";
import ContentsRail from "./ContentsRail";
import "@/components/ui/category-tabs.css";
import "./Contents.css";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const tabs = [{ id: allCategories, name: "Todos os conteúdos" }, ...contentCategories];

function FilterSelect({ label, icon: Icon, value, options, disabled, onChange }: {
  label: string;
  icon: LucideIcon;
  value: number;
  options: { value: number; label: string }[];
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="filter-field">
      <span className="field-label">{label}</span>
      <Select value={String(value)} onValueChange={(next) => onChange(Number(next))} disabled={disabled}>
        <SelectTrigger className="contents-select" aria-label={"Filtrar por " + label.toLowerCase()} aria-describedby={disabled ? "contents-day-hint" : undefined}>
          <span className="filter-trigger-value"><Icon aria-hidden="true" /><SelectValue /></span>
        </SelectTrigger>
        <SelectContent className="content-filter-options">
          <SelectGroup>
            <SelectItem value="0">Todos</SelectItem>
            {options.map((option) => <SelectItem value={String(option.value)} key={option.value}>{option.label}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

type PlayVideo = (video: ContentVideo, event: MouseEvent<HTMLElement>) => void;

function VideoArt({ video, featured, onPlay }: { video: ContentVideo; featured: boolean; onPlay: PlayVideo }) {
  const label = video.embeddable ? "Assistir " + video.title : "Assistir no YouTube: " + video.title + " (nova aba)";
  const art = (
    <>
      <img src={video.thumbnailUrl} alt="" width={480} height={360} loading={featured ? "eager" : "lazy"} />
      <span className="art-shade" aria-hidden="true" />
      <span className="play-circle" aria-hidden="true">{video.embeddable ? <Play fill="currentColor" /> : <ExternalLink />}</span>
      {video.number !== null && <span className="edition-number">{editionNumber(video.number)}</span>}
      {video.duration && <span className="duration">{video.duration}</span>}
    </>
  );
  return video.embeddable
    ? <button className="video-art" type="button" aria-label={label} onClick={(event) => onPlay(video, event)}>{art}</button>
    : <a className="video-art" aria-label={label} href={watchUrl(video.id)} target="_blank" rel="noreferrer" onClick={(event) => onPlay(video, event)}>{art}</a>;
}

function VideoCard({ video, activeCategory, onPlay, featured = false }: {
  video: ContentVideo;
  activeCategory: string;
  onPlay: PlayVideo;
  featured?: boolean;
}) {
  const category = contentCategories.find(({ id }) => id === (activeCategory === allCategories ? video.categories[0] : activeCategory));
  const date = <time dateTime={video.date}>{formatContentDate(video.date)}</time>;
  const views = video.viewCount === null ? null : formatContentViews(video.viewCount);
  return (
    <article className={featured ? "featured-content" : "content-tile"}>
      <VideoArt video={video} onPlay={onPlay} featured={featured} />
      {featured ? (
        <div className="featured-copy min-w-0">
          <span className="category-badge"><span aria-hidden="true" />{category?.name}</span>
          <h3>{video.title}</h3>
          <div className="metadata">
            <span><CalendarDays aria-hidden="true" />{date}</span>
            {views && <span><Eye aria-hidden="true" />{views}</span>}
          </div>
          {video.embeddable ? (
            <Button type="button" className="watch-button" size="lg" onClick={(event) => onPlay(video, event)}>
              <CirclePlay aria-hidden="true" /> Assistir conteúdo
            </Button>
          ) : (
            <Button asChild className="watch-button" size="lg">
              <a href={watchUrl(video.id)} target="_blank" rel="noreferrer" onClick={(event) => onPlay(video, event)}>
                <ExternalLink aria-hidden="true" /> Assistir no YouTube <span className="sr-only">(nova aba)</span>
              </a>
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="tile-category">{category?.name}</p>
          <h3>{video.title}</h3>
          <div className="tile-meta">{date}{views && <><span aria-hidden="true">•</span><span>{views}</span></>}</div>
        </>
      )}
    </article>
  );
}

export default function Contents() {
  const [params, setParams] = useSearchParams();
  const filters = readContentFilters(params);
  const { category, query, year, month, day, maxDay } = filters;
  const { pause } = useAudioPlayer();
  const [playing, setPlaying] = useState<ContentVideo | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const catalog = useQuery({
    queryKey: ["video-contents"],
    queryFn: ({ signal }) => fetchVideoContents(signal),
    staleTime: 15 * 60 * 1000,
    retry: false,
  });
  const items = catalog.data?.items ?? [];
  const years = [...new Set([...items.map((item) => Number(item.date.slice(0, 4))), ...(year ? [year] : [])])].sort((a, b) => b - a);
  const { featured, remaining, total } = selectContent(items, filters);
  const activeCategory = contentCategories.find(({ id }) => id === category);
  const coverage = activeCategory ? [catalog.data?.coverage[category]] : Object.values(catalog.data?.coverage ?? {});
  const unavailable = catalog.isError && !catalog.data || activeCategory && coverage[0] === "unavailable";
  const partial = Boolean(catalog.data && (catalog.isError || coverage.some((state) => state !== "complete")));
  const hasFilters = Boolean(query || year || month || day);
  const archiveUrl = activeCategory ? "https://www.youtube.com/playlist?list=" + activeCategory.playlist : channelPlaylistsUrl;

  const updateFilter = (key: string, value: string | number, replace = true) => {
    const next = new URLSearchParams(params);
    if (!value || value === allCategories) next.delete(key);
    else next.set(key, String(value));
    if (!readContentFilters(next).day) next.delete("dia");
    setParams(next, { replace, preventScrollReset: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    for (const key of ["q", "ano", "mes", "dia"]) next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const onPlay: PlayVideo = (video, event) => {
    pause();
    if (!video.embeddable) return;
    lastTrigger.current = event.currentTarget;
    setPlaying(video);
  };

  const panel = (
    <>
      <section className="content-filters" aria-label="Filtros de conteúdos">
        <label className="filter-field search-field">
          <span className="field-label">Buscar conteúdo</span>
          <span className="search-wrap">
            <Search aria-hidden="true" />
            <Input type="search" name="q" maxLength={120} autoComplete="off" value={query} onChange={(event) => updateFilter("q", event.target.value)} placeholder="Ex.: fé, família, #104…" />
          </span>
        </label>
        <FilterSelect label="Ano" icon={Calendar} value={year} onChange={(value) => updateFilter("ano", value)}
          options={years.map((value) => ({ value, label: String(value) }))} />
        <FilterSelect label="Mês" icon={CalendarDays} value={month} onChange={(value) => updateFilter("mes", value)}
          options={months.map((label, i) => ({ value: i + 1, label }))} />
        <FilterSelect label="Dia" icon={CalendarCheck} value={day} onChange={(value) => updateFilter("dia", value)} disabled={!maxDay}
          options={Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, "0") }))} />
      </section>
      {!maxDay && <p id="contents-day-hint" className={year || month ? "date-hint" : "sr-only"}>Escolha ano e mês para filtrar por dia.</p>}
      {hasFilters && (
        <div className="filter-summary">
          <p role="status">{!catalog.isPending && !unavailable && total + (total === 1 ? " conteúdo encontrado" : " conteúdos encontrados")}</p>
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X aria-hidden="true" /> Limpar filtros</Button>
        </div>
      )}
      {partial && !unavailable && <p className="date-hint" role="status">Parte do acervo pode estar desatualizada ou não aparecer aqui. Consulte o YouTube para ver mais.</p>}
      {catalog.isPending ? (
        <div className="featured-section" role="status">
          <span className="sr-only">Carregando conteúdos da Rádio 88 FM…</span>
          <Skeleton className="h-8 w-60 max-w-full" />
          <Skeleton className="mt-4 aspect-video w-full max-h-96 rounded-2xl" />
        </div>
      ) : unavailable ? (
        <div className="empty-selection" role="alert">
          <CirclePlay aria-hidden="true" />
          <h2>O catálogo está temporariamente indisponível</h2>
          <p>Você pode continuar assistindo pelo YouTube.</p>
          <Button type="button" variant="outline" disabled={catalog.isFetching} onClick={() => void catalog.refetch()}>
            {catalog.isFetching ? "Tentando novamente…" : "Tentar novamente"}
          </Button>
        </div>
      ) : featured ? (
        <>
          <section className="featured-section" aria-labelledby="contents-featured-title">
            <div className="section-title"><h2 id="contents-featured-title">{featured.viewCount === null ? "Em destaque" : "Mais assistido na seleção"}</h2></div>
            <VideoCard video={featured} activeCategory={category} onPlay={onPlay} featured />
          </section>
          {remaining.length > 0 && (
            <ContentsRail key={category + ":" + remaining.map(({ id }) => id).join(",")}
              title={activeCategory ? "Mais de " + activeCategory.name : "Explore os conteúdos"}
              videos={remaining.map((video) => ({
                id: video.id,
                card: <VideoCard video={video} activeCategory={category} onPlay={onPlay} />,
              }))} />
          )}
        </>
      ) : (
        <section className="empty-selection">
          <Search aria-hidden="true" />
          <h2>{hasFilters ? "Nenhum conteúdo nessa seleção" : "Ainda não há vídeos nesta seleção"}</h2>
          <p>{hasFilters ? "Experimente outro tema ou ajuste a data." : "Consulte a playlist oficial ou volte mais tarde."}</p>
          {hasFilters && <Button type="button" variant="outline" onClick={clearFilters}>Limpar busca e datas</Button>}
        </section>
      )}
      <div className="archive-more">
        <Button asChild variant="outline" size="lg" className="archive-link">
          <a href={archiveUrl} target="_blank" rel="noreferrer">Ver mais no YouTube <ExternalLink aria-hidden="true" /><span className="sr-only"> (nova aba)</span></a>
        </Button>
      </div>
    </>
  );

  return (
    <section className="content-shell" aria-labelledby="contents-title">
      <SeoHead config={getRouteSeoConfig("/conteudos")} pathname="/conteudos" />
      <h1 id="contents-title" className="page-title font-display text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">Conteúdos</h1>
      <Tabs value={category} onValueChange={(value) => updateFilter("categoria", value, false)} activationMode="manual">
        <div className="category-picker">
          <label className="field-label" htmlFor="contents-program">Programa</label>
          <Select name="categoria" value={category} onValueChange={(value) => updateFilter("categoria", value, false)}>
            <SelectTrigger id="contents-program" className="contents-select" aria-label="Programa">
              <span className="filter-trigger-value"><ListVideo aria-hidden="true" /><SelectValue /></span>
            </SelectTrigger>
            <SelectContent className="content-filter-options">
              <SelectGroup>
                {tabs.map(({ id, name }) => <SelectItem value={id} key={id}>{name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <TabsList className="category-tabs" aria-label="Filtrar por programa">
          {tabs.map(({ id, name }) => <TabsTrigger className="category-tab font-body" key={id} value={id}>{name}</TabsTrigger>)}
        </TabsList>
        {tabs.map(({ id }) => <TabsContent className="category-panel" key={id} value={id}>{category === id ? panel : null}</TabsContent>)}
      </Tabs>
      <Dialog open={Boolean(playing)} onOpenChange={(open) => { if (!open) setPlaying(null); }}>
        {playing && (
          <DialogContent closeLabel="Fechar vídeo" className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto overscroll-contain rounded-xl"
            onCloseAutoFocus={(event) => { event.preventDefault(); lastTrigger.current?.focus(); }}>
            <DialogTitle className="pr-8 font-display">{playing.title}</DialogTitle>
            <DialogDescription className="sr-only">Player de vídeo do YouTube</DialogDescription>
            <iframe className="aspect-video w-full rounded-md bg-black" title={"Reprodução de " + playing.title}
              src={"https://www.youtube-nocookie.com/embed/" + encodeURIComponent(playing.id) + "?autoplay=1&rel=0"}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            <a className="justify-self-start text-sm font-bold text-radio-blue-dark underline underline-offset-4" href={watchUrl(playing.id)} target="_blank" rel="noreferrer">
              Se o vídeo não abrir, assista no YouTube <span className="sr-only">(nova aba)</span>
            </a>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
