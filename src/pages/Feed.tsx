import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Images, Play } from "lucide-react";
import SeoHead from "@/components/seo/SeoHead";
import NotFound from "@/pages/NotFound";
import { getRouteSeoConfig } from "@/services/seo/seoConfig";
import { useFeed } from "@/services/feed/feed-data";
import { getEventYear, sortByEventDate } from "@/services/feed/feed-events";

const PAGE_SIZE = 12;

export default function Feed() {
  const { page: pageParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = pageParam ? Number(pageParam) : 1;
  const { index } = useFeed();
  const selectedYear = searchParams.get("ano") ?? "todos";
  const oldestFirst = searchParams.get("ordem") === "antigas";
  const years = useMemo(() => [...new Set(index.posts.map((post) => getEventYear(post.eventDate)).filter((year): year is string => Boolean(year)))].sort((left, right) => Number(right) - Number(left)), [index.posts]);
  const hasUndated = index.posts.some((post) => !getEventYear(post.eventDate));
  const filteredPosts = useMemo(() => sortByEventDate(index.posts.filter((post) => {
    const year = getEventYear(post.eventDate);
    return selectedYear === "todos" || (selectedYear === "sem-data" ? !year : year === selectedYear);
  }), oldestFirst), [index.posts, selectedYear, oldestFirst]);
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const posts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const route = getRouteSeoConfig(page === 1 ? "/feed" : `/feed/pagina/${page}`);

  const pageUrl = (target: number, year = selectedYear, oldest = oldestFirst) => {
    const query = new URLSearchParams();
    if (year !== "todos") query.set("ano", year);
    if (oldest) query.set("ordem", "antigas");
    const suffix = query.toString();
    return `${target === 1 ? "/feed" : `/feed/pagina/${target}`}${suffix ? `?${suffix}` : ""}`;
  };

  if (!Number.isInteger(page) || page < 1 || page > pageCount) return <NotFound />;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-10 sm:px-6 lg:px-8" aria-labelledby="feed-title">
      <SeoHead config={route} pathname={page === 1 ? "/feed" : `/feed/pagina/${page}`} />
      <header className="mb-8 border-b border-neutral-200 pb-6 sm:mb-10 sm:pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-radio-blue">Por dentro da 88</p>
        <h1 id="feed-title" className="font-display text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">Feed 88 FM</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">Festas, bastidores e momentos que fazem parte da história da nossa rádio.</p>
      </header>

      {index.posts.length > 0 && <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <nav aria-label="Filtrar matérias por ano" className="flex flex-wrap gap-2">
          {[{value:"todos", label:"Todos"}, ...years.map((year) => ({value:year, label:year})), ...(hasUndated ? [{value:"sem-data", label:"Sem data"}] : [])].map(({value, label}) => (
            <button key={value} type="button" aria-pressed={selectedYear === value} onClick={() => navigate(pageUrl(1, value))} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radio-blue ${selectedYear === value ? "border-radio-blue bg-radio-blue text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-radio-blue hover:text-radio-blue"}`}>{label}</button>
          ))}
        </nav>
        <label className="flex shrink-0 flex-col gap-1.5 text-xs font-semibold text-neutral-600">Ordenar pelo acontecimento
          <select value={oldestFirst ? "antigas" : "recentes"} onChange={(event) => navigate(pageUrl(1, selectedYear, event.target.value === "antigas"))} className="min-h-11 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue"><option value="recentes">Mais recentes primeiro</option><option value="antigas">Mais antigos primeiro</option></select>
        </label>
      </div>}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-16 text-center">
          <h2 className="font-display text-xl font-bold text-neutral-900">{index.posts.length ? "Nenhuma matéria neste ano" : "Novidades em breve"}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">{index.posts.length ? "Selecione outro ano ou veja todas as publicações." : "Estamos preparando os próximos momentos da Rádio 88 FM para compartilhar com você."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6">
          {posts.map((post) => (
            <article key={post.id} className="min-w-0">
              <Link to={`/feed/${post.slug}`} className="group block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-radio-blue">
                <div className="relative aspect-[7/5] overflow-hidden rounded-md bg-neutral-100">
                  <img
                    src={post.cover.url}
                    srcSet={post.cover.srcSet}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    alt={post.cover.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                    style={{ objectPosition: `${post.cover.focusX ?? 50}% ${post.cover.focusY ?? 50}%` }}
                  />
                  <span className="absolute right-2 top-2 rounded bg-black/65 p-1.5 text-white" aria-label={post.category.name}>
                    {post.category.slug.includes("video") ? <Play size={17} fill="currentColor" /> : <Images size={17} />}
                  </span>
                </div>
                <div className="pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-radio-blue">{post.category.name}</p>
                  <h2 className="mt-1 line-clamp-2 font-display text-base font-bold leading-5 text-neutral-950 group-hover:underline sm:text-lg sm:leading-6">{post.title}</h2>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {pageCount > 1 && <nav aria-label="Páginas do Feed" className="mt-12 flex items-center justify-center gap-4">
        {page > 1 && <Link className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100" to={pageUrl(page - 1)}>Anterior</Link>}
        <span aria-current="page" className="text-sm text-neutral-600">Página {page} de {pageCount}</span>
        {page < pageCount && <Link className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100" to={pageUrl(page + 1)}>Próxima</Link>}
      </nav>}
    </section>
  );
}
