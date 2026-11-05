import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy, Share2 } from "lucide-react";
import FeedReveal from "@/components/feed/FeedReveal";
import RecentFeedPosts from "@/components/feed/RecentFeedPosts";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";
import SeoHead from "@/components/seo/SeoHead";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import NotFound from "@/pages/NotFound";
import { getRouteSeoConfig } from "@/services/seo/seoConfig";
import { useFeed, useFeedPost } from "@/services/feed/feed-data";
import type { FeedBlock, FeedPost, FeedPostDocument } from "@/services/feed/feed.types";
import { formatEventDate, getRecentFeedPosts, sortByEventDate } from "@/services/feed/feed-events";

export default function FeedPostPage() {
  const { slug } = useParams();
  const { document, loading, error, retry } = useFeedPost(slug);
  const { index } = useFeed();
  const [copied, setCopied] = useState(false);

  if (loading) return <div role="status" className="mx-auto max-w-4xl px-5 py-24 text-center text-neutral-600">Carregando publicação…</div>;
  if (error === "not_found" || !slug) return <NotFound />;
  if (error || !document) return <section className="mx-auto max-w-2xl px-5 py-16" aria-labelledby="feed-error-title"><h1 id="feed-error-title" className="font-display text-3xl font-bold">Publicação temporariamente indisponível</h1><p role="alert" className="mt-4 text-neutral-600">{error === "release_mismatch" ? "O site foi atualizado. Recarregue a página para ver a versão atual." : "Não foi possível carregar esta matéria. Seu conteúdo não foi removido."}</p><button type="button" onClick={error === "release_mismatch" ? () => window.location.reload() : retry} className="mt-6 min-h-11 rounded bg-radio-blue px-5 font-bold text-white">{error === "release_mismatch" ? "Recarregar página" : "Tentar novamente"}</button><Link to="/feed" className="ml-4 inline-flex min-h-11 items-center text-radio-blue">Voltar ao Feed</Link></section>;
  const post = document.post;
  const opening = post.opening ?? post.cover;
  const config = getRouteSeoConfig(`/feed/${slug}`);
  const eventDateLabel = formatEventDate(post.eventDate);
  const recent = getRecentFeedPosts(index.posts, slug);
  const ordered = sortByEventDate(index.posts);
  const position = ordered.findIndex((item) => item.slug === slug);
  const previous = position > 0 ? ordered[position - 1] : undefined;
  const next = position >= 0 ? ordered[position + 1] : undefined;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="pb-12">
      <SeoHead config={config} pathname={`/feed/${slug}`} />
      <div className="mx-auto max-w-[1440px] px-4 pt-7 sm:px-6 lg:px-8">
        <Link to="/feed" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-radio-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue">
          <ArrowLeft size={18} aria-hidden="true" /> Voltar ao Feed
        </Link>
      </div>
      <div className="mx-auto mt-5 max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="aspect-video overflow-hidden bg-neutral-100 sm:rounded-md"><img src={opening.url} srcSet={opening.srcSet} sizes="(max-width: 768px) 100vw, 92vw" alt={opening.alt} className="h-full w-full object-contain" style={{ objectPosition: `${opening.focusX ?? 50}% ${opening.focusY ?? 50}%` }} /></div>
      </div>
      <div className={`mx-auto mt-8 grid max-w-[1440px] items-start gap-10 px-4 sm:px-6 lg:px-8 ${recent.length ? "lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-12" : "lg:grid-cols-1"}`}><div className="min-w-0">
      <header className="max-w-[70ch] pb-8 pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-radio-blue">{post.category.name}</p>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight tracking-tight text-neutral-950 sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-8 text-neutral-600">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-5 text-sm text-neutral-500">
          <div>{eventDateLabel && <time dateTime={post.eventDate?.slice(0, 10)}>Acontecimento: {eventDateLabel}</time>}{post.publicCredits && <span>{eventDateLabel ? " · " : ""}{post.publicCredits}</span>}</div>
          <button type="button" onClick={() => void share()} className="inline-flex min-h-11 items-center gap-2 rounded border border-neutral-300 px-3 font-semibold text-neutral-800 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue" aria-label="Compartilhar publicação">
            {copied ? <Copy size={16} /> : <Share2 size={16} />}{copied ? "Link copiado" : "Compartilhar"}
          </button>
        </div>
      </header>
      <div className="feed-reading flex min-w-0 flex-col gap-8">
        {post.blocks.map((block) => <FeedReveal key={`${slug}:${block.id}`}><BlockRenderer block={block} post={post} /></FeedReveal>)}
      </div>
      <nav aria-label="Navegação entre publicações" className="mt-12 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6">
        {previous ? <Link to={`/feed/${previous.slug}`} rel="prev" className="min-w-0 rounded-md p-3 text-left hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue"><span className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft size={18} />Post Anterior</span><span className="block truncate text-sm text-neutral-500">{previous.title}</span></Link> : <button type="button" disabled className="flex min-h-11 items-center gap-2 p-3 text-left text-sm font-bold text-neutral-400"><ArrowLeft size={18} />Post Anterior</button>}
        {next ? <Link to={`/feed/${next.slug}`} rel="next" className="min-w-0 rounded-md p-3 text-right hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue"><span className="flex min-h-11 items-center justify-end gap-2 text-sm font-bold">Próximo Post<ArrowRight size={18} /></span><span className="block truncate text-sm text-neutral-500">{next.title}</span></Link> : <button type="button" disabled className="flex min-h-11 items-center justify-end gap-2 p-3 text-right text-sm font-bold text-neutral-400">Próximo Post<ArrowRight size={18} /></button>}
      </nav>
      <div className="mt-8"><Link to="/feed" className="inline-flex min-h-11 items-center gap-2 rounded bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"><ArrowLeft size={16} />Todas as publicações</Link></div>
      </div><RecentFeedPosts posts={recent} /></div>
    </article>
  );
}

function BlockRenderer({ block, post }: { block: FeedBlock; post: FeedPost }) {
  if (block.type === "text") return <div className={`prose prose-neutral w-full ${block.width === "wide" ? "max-w-none" : "max-w-[70ch]"}`}>{renderRichText((block as { content?: unknown }).content)}</div>;
  if (block.type === "divider") return <hr className="mx-auto my-2 w-full max-w-3xl border-neutral-200" />;
  if (block.type === "quote") return <figure className="w-full max-w-3xl border-l-4 border-radio-blue pl-5"><blockquote className="font-display text-2xl font-bold leading-snug text-neutral-900">{String(block.text ?? "")}</blockquote>{block.attribution && <figcaption className="mt-3 text-sm text-neutral-500">{String(block.attribution)}</figcaption>}</figure>;
  if (block.type === "image" || block.type === "gif") {
    const media = post.media[String(block.assetId)];
    if (!media) return null;
    if (block.type === "gif") return <GifBlock block={block} media={media} />;
    return <figure className={`w-full ${block.width === "reading" ? "max-w-3xl" : "max-w-5xl"}`}><img src={media.url} srcSet={media.srcSet} sizes={block.width === "reading" ? "(max-width: 768px) 100vw, 48rem" : "(max-width: 768px) 100vw, 64rem"} alt={String(block.alt ?? "")} loading="lazy" className="h-auto w-full rounded-sm object-contain" />{Boolean(block.caption || block.credit) && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption ?? "")}{block.credit ? ` · ${String(block.credit)}` : ""}</figcaption>}</figure>;
  }
  if (block.type === "gallery") {
    const items = Array.isArray(block.items) ? block.items as Array<{ assetId: string; alt: string; caption?: string }> : [];
    if (block.layout === "carousel") return <GalleryCarousel items={items} post={post} />;
    return <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-2 sm:gap-4">{items.map((item) => {
      const media = post.media[item.assetId];
      return media ? <figure key={item.assetId}><img src={media.url} srcSet={media.srcSet} sizes="(max-width: 640px) 50vw, 38rem" alt={item.alt} loading="lazy" className="h-auto max-h-[78vh] w-full rounded-sm bg-neutral-50 object-contain" />{item.caption && <figcaption className="mt-2 text-center text-xs text-neutral-500">{item.caption}</figcaption>}</figure> : null;
    })}</div>;
  }
  if (block.type === "video") return <VideoBlock block={block} post={post} />;
  return null;
}

function GifBlock({ block, media }: { block: FeedBlock; media: FeedPost["media"][string] }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [preferenceReady, setPreferenceReady] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReducedMotion(preference.matches); setPreferenceReady(true); };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const isAnimated = preferenceReady && !reducedMotion;
  const poster = media.posterUrl;
  return <figure className="w-full max-w-5xl">
    {poster || isAnimated
      ? <img src={isAnimated ? media.url : poster!} alt={String(block.alt ?? "")} loading="lazy" className="mx-auto h-auto max-h-[78vh] w-full rounded-sm bg-neutral-50 object-contain" />
      : <div role="img" aria-label={String(block.alt ?? "Animação da Rádio 88 FM")} className="mx-auto grid aspect-video w-full max-w-5xl place-items-center rounded-sm bg-neutral-100 text-sm text-neutral-600">{reducedMotion ? "Animação desativada pela preferência de movimento reduzido do dispositivo." : "Carregando animação…"}</div>}
    {block.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption)}</figcaption>}
  </figure>;
}

function GalleryCarousel({ items, post }: { items: Array<{ assetId: string; alt: string; caption?: string }>; post: FeedPost }) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const media = current ? post.media[current.assetId] : undefined;
  if (!current || !media) return null;
  return <section className="w-full max-w-5xl" aria-label={`Galeria com ${items.length} imagens`}>
    <figure><img src={media.url} srcSet={media.srcSet} sizes="(max-width: 768px) 100vw, 64rem" alt={current.alt} className="mx-auto max-h-[78vh] w-full bg-neutral-50 object-contain" />{current.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{current.caption}</figcaption>}</figure>
    <div className="mt-4 flex items-center justify-center gap-3"><button type="button" aria-label="Imagem anterior" disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40">‹</button><p aria-live="polite" className="min-w-20 text-center text-sm text-neutral-500">{index + 1} / {items.length}</p><button type="button" aria-label="Próxima imagem" disabled={index === items.length - 1} onClick={() => setIndex((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40">›</button></div>
  </section>;
}

function VideoBlock({ block, post }: { block: FeedBlock; post: FeedPost }) {
  const { pause } = useAudioPlayer();
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const stop = () => {
      videoRef.current?.pause();
      if (frameRef.current) frameRef.current.src = "about:blank";
      setStarted(false);
    };
    window.addEventListener(RADIO_PLAY_REQUEST, stop);
    return () => window.removeEventListener(RADIO_PLAY_REQUEST, stop);
  }, []);
  const source = block.source as { kind?: string; videoId?: string; assetId?: string } | undefined;
  const poster = block.posterAssetId ? post.media[String(block.posterAssetId)]?.url : undefined;
  const title = String(block.title ?? "Vídeo da Rádio 88 FM");
  if (source?.kind === "youtube" && source.videoId) return <div className="w-full max-w-5xl"><div className="relative aspect-video bg-black">{started ? <iframe ref={frameRef} title={title} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.videoId)}?autoplay=1&rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" /> : <button type="button" onClick={() => { pause(); setStarted(true); }} className="absolute inset-0 flex w-full items-center justify-center bg-neutral-950 text-white" style={poster ? { background: `center / cover url("${poster}")` } : undefined}><span className="rounded bg-black/70 px-5 py-3 font-bold">Reproduzir vídeo: {title}</span></button>}</div></div>;
  const media = source?.assetId ? post.media[source.assetId] : undefined;
  return media ? <figure className="w-full max-w-5xl"><video ref={videoRef} controls preload="none" poster={poster ?? media.posterUrl} onPlay={pause} className="max-h-[75vh] w-full bg-black" aria-label={title}><source src={media.url} type={media.mimeType ?? "video/mp4"} /></video>{block.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption)}</figcaption>}</figure> : null;
}

function renderRichText(value: unknown): ReactNode {
  if (!value || typeof value !== "object") return null;
  const node = value as { type?: string; text?: string; attrs?: { level?: number; href?: string }; content?: unknown[]; marks?: Array<{ type?: string; attrs?: { href?: string } }> };
  if (node.type === "text") {
    let result: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") result = <strong>{result}</strong>;
      if (mark.type === "italic") result = <em>{result}</em>;
      if (mark.type === "strike") result = <s>{result}</s>;
      if (mark.type === "link" && safeHref(mark.attrs?.href)) result = <a href={mark.attrs.href} rel="noopener noreferrer">{result}</a>;
    }
    return result;
  }
  const children = (node.content ?? []).map((child, index) => <Fragment key={index}>{renderRichText(child)}</Fragment>);
  if (node.type === "heading") return node.attrs?.level === 3 ? <h3>{children}</h3> : <h2>{children}</h2>;
  if (node.type === "bulletList") return <ul>{children}</ul>;
  if (node.type === "orderedList") return <ol>{children}</ol>;
  if (node.type === "listItem") return <li>{children}</li>;
  if (node.type === "blockquote") return <blockquote>{children}</blockquote>;
  if (node.type === "horizontalRule") return <hr />;
  if (node.type === "paragraph") return <p>{children}</p>;
  if (node.type === "doc") return <>{children}</>;
  return null;
}

function safeHref(value: string | undefined) {
  if (!value) return false;
  try { return ["http:", "https:", "mailto:"].includes(new URL(value).protocol); } catch { return false; }
}

export type { FeedPostDocument };
