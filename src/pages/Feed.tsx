import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SeoHead from "@/components/seo/SeoHead";
import FeedCover from "@/components/feed/FeedCover";
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
  const years = useMemo(() => [...new Set(index.posts.map((post) => getEventYear(post.eventDate)).filter((year): year is string => Boolean(year)))].sort((a, b) => Number(b) - Number(a)), [index.posts]);
  const requestedYear = searchParams.get("ano");
  const selectedYear = requestedYear && years.includes(requestedYear) ? requestedYear : "todos";
  const filteredPosts = useMemo(() => sortByEventDate(index.posts.filter((post) => selectedYear === "todos" || getEventYear(post.eventDate) === selectedYear)), [index.posts, selectedYear]);
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const totalPages = Math.max(1, Math.ceil(index.posts.length / PAGE_SIZE));
  const validPage = Number.isInteger(page) && page >= 1 && page <= totalPages && (!pageParam || /^[1-9]\d*$/.test(pageParam));
  const posts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pathname = page === 1 ? "/feed" : `/feed/pagina/${page}`;
  const pageUrl = (target: number, year = selectedYear) => `${target === 1 ? "/feed" : `/feed/pagina/${target}`}${year === "todos" ? "" : `?ano=${year}`}`;

  useEffect(() => {
    const query = new URLSearchParams(searchParams);
    const original = query.toString();
    query.delete("ordem");
    if (requestedYear && !years.includes(requestedYear)) query.delete("ano");
    const resetPage = validPage && page > pageCount;
    if (query.toString() !== original || resetPage) {
      const destination = resetPage ? "/feed" : pathname;
      navigate(`${destination}${query.toString() ? `?${query}` : ""}`, { replace: true });
    }
  }, [navigate, searchParams, requestedYear, years, validPage, page, pageCount, pathname]);

  if (!validPage) return <NotFound />;
  if (page > pageCount) return <p role="status" className="p-8 text-center">Atualizando filtro…</p>;
  return (
    <section className="mx-auto w-full max-w-[1440px] px-2 pb-12 pt-8 sm:px-6 lg:px-8" aria-labelledby="feed-title">
      <SeoHead config={getRouteSeoConfig(pathname)} pathname={pathname} />
      <header className="mb-6 border-b border-neutral-200 px-2 pb-6 sm:mb-8 sm:px-0 sm:pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-radio-blue">Por dentro da 88</p>
        <h1 id="feed-title" className="font-display text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">Feed 88 FM</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">Festas, bastidores e momentos que fazem parte da história da nossa rádio.</p>
      </header>
      {index.posts.length > 0 && <nav aria-label="Filtrar matérias por ano" className="mb-6 flex flex-wrap gap-2 px-2 sm:px-0">
        {[{ value: "todos", label: "Todos" }, ...years.map((year) => ({ value: year, label: year }))].map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={selectedYear === value} onClick={() => navigate(pageUrl(1, value))} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radio-blue ${selectedYear === value ? "border-radio-blue bg-radio-blue text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-radio-blue hover:text-radio-blue"}`}>{label}</button>
        ))}
      </nav>}
      {posts.length === 0 ? <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-16 text-center">
        <h2 className="font-display text-xl font-bold">Novidades em breve</h2><p className="mt-2 text-sm text-neutral-600">Estamos preparando os próximos momentos da Rádio 88 FM para compartilhar com você.</p>
      </div> : <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:grid-cols-4 lg:gap-2">
        {posts.map((post, position) => <article key={post.id} className="min-w-0">
          <Link to={`/feed/${post.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radio-blue">
            <FeedCover post={post} sizes="(min-width: 1440px) 340px, (min-width: 1024px) 25vw, 33vw" eager={position < 4} />
            <h2 className="sr-only">{post.title}</h2>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-10 text-sm font-bold leading-snug text-white transition-transform duration-200 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"><span className="line-clamp-3">{post.title}</span></span>
          </Link>
        </article>)}
      </div>}
      {pageCount > 1 && <nav aria-label="Páginas do Feed" className="mt-10 flex items-center justify-center gap-4">
        {page > 1 && <Link className="rounded border border-neutral-300 px-4 py-3 text-sm font-semibold hover:bg-neutral-100" to={pageUrl(page - 1)}>Anterior</Link>}
        <span aria-current="page" className="text-sm text-neutral-600">Página {page} de {pageCount}</span>
        {page < pageCount && <Link className="rounded border border-neutral-300 px-4 py-3 text-sm font-semibold hover:bg-neutral-100" to={pageUrl(page + 1)}>Próxima</Link>}
      </nav>}
    </section>
  );
}
