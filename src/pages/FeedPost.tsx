import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import SeoHead from "@/components/seo/SeoHead";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import NotFound from "@/pages/NotFound";
import { getRouteSeoConfig } from "@/services/seo/seoConfig";
import { useFeedPost } from "@/services/feed/feed-data";
import type { FeedBlock, FeedPost, FeedPostDocument } from "@/services/feed/feed.types";
import { formatEventDate } from "@/services/feed/feed-events";

export default function FeedPostPage() {
  const { slug } = useParams();
  const { document, loading, error } = useFeedPost(slug);
  const [copied, setCopied] = useState(false);

  if (loading) return <div role="status" className="mx-auto max-w-4xl px-5 py-24 text-center text-neutral-600">Carregando publicação…</div>;
  if (error || !document || !slug) return <NotFound />;
  const post = document.post;
  const opening = post.opening ?? post.cover;
  const config = getRouteSeoConfig(`/feed/${slug}`);
  const eventDateLabel = formatEventDate(post.eventDate);

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
    <article className="pb-24">
      <SeoHead config={config} pathname={`/feed/${slug}`} />
      <div className="mx-auto max-w-[1440px] px-4 pt-7 sm:px-6 lg:px-8">
        <Link to="/feed" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-radio-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue">
          <ArrowLeft size={18} aria-hidden="true" /> Voltar ao Feed
        </Link>
      </div>
      <div className="mx-auto mt-5 max-w-[1280px] px-0 sm:px-6">
        <div className="aspect-video overflow-hidden bg-neutral-100 sm:rounded-md"><img src={opening.url} srcSet={opening.srcSet} sizes="(max-width: 768px) 100vw, 92vw" alt={opening.alt} className="h-full w-full object-contain" style={{ objectPosition: `${opening.focusX ?? 50}% ${opening.focusY ?? 50}%` }} /></div>
      </div>
      <header className="mx-auto max-w-3xl px-5 pb-8 pt-9 sm:pt-12">
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
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5">
        {post.blocks.map((block) => <BlockRenderer key={block.id} block={block} post={post} />)}
      </div>
      <div className="mx-auto mt-12 max-w-3xl px-5"><Link to="/feed" className="inline-flex min-h-11 items-center gap-2 rounded bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"><ArrowLeft size={16} />Todas as publicações</Link></div>
    </article>
  );
}

function BlockRenderer({ block, post }: { block: FeedBlock; post: FeedPost }) {
  if (block.type === "text") return <div className={`prose prose-neutral mx-auto w-full max-w-none ${block.width === "wide" ? "max-w-5xl" : "max-w-3xl"}`}>{renderRichText((block as { content?: unknown }).content)}</div>;
  if (block.type === "divider") return <hr className="mx-auto my-2 w-full max-w-3xl border-neutral-200" />;
  if (block.type === "quote") return <figure className="mx-auto w-full max-w-3xl border-l-4 border-radio-blue pl-5"><blockquote className="font-display text-2xl font-bold leading-snug text-neutral-900">{String(block.text ?? "")}</blockquote>{block.attribution && <figcaption className="mt-3 text-sm text-neutral-500">{String(block.attribution)}</figcaption>}</figure>;
  if (block.type === "image" || block.type === "gif") {
    const media = post.media[String(block.assetId)];
    if (!media) return null;
    if (block.type === "gif") return <GifBlock block={block} media={media} />;
    return <figure className={`mx-auto w-full ${block.width === "reading" ? "max-w-3xl" : "max-w-5xl"}`}><img src={media.url} srcSet={media.srcSet} sizes={block.width === "reading" ? "(max-width: 768px) 100vw, 48rem" : "(max-width: 768px) 100vw, 64rem"} alt={String(block.alt ?? "")} loading="lazy" className="h-auto w-full rounded-sm object-contain" />{Boolean(block.caption || block.credit) && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption ?? "")}{block.credit ? ` · ${String(block.credit)}` : ""}</figcaption>}</figure>;
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
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const isAnimated = playing && !reducedMotion;
  const poster = media.posterUrl;
  return <figure className="mx-auto w-full max-w-5xl">
    {poster || isAnimated
      ? <img src={isAnimated ? media.url : poster!} alt={String(block.alt ?? "")} loading="lazy" className="mx-auto h-auto max-h-[78vh] w-full rounded-sm bg-neutral-50 object-contain" />
      : <div role="img" aria-label={String(block.alt ?? "GIF pronto para reprodução")} className="mx-auto grid aspect-video w-full max-w-5xl place-items-center rounded-sm bg-neutral-100 text-sm text-neutral-600">GIF pronto para reprodução</div>}
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
      <button type="button" aria-pressed={isAnimated} disabled={reducedMotion} onClick={() => setPlaying((value) => !value)} className="min-h-10 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-radio-blue disabled:cursor-not-allowed disabled:opacity-50">{isAnimated ? "Pausar animação" : "Reproduzir animação"}</button>
      {reducedMotion && <span className="text-xs text-neutral-500">Movimento reduzido está ativo no seu dispositivo.</span>}
    </div>
    {block.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption)}</figcaption>}
  </figure>;
}

function GalleryCarousel({ items, post }: { items: Array<{ assetId: string; alt: string; caption?: string }>; post: FeedPost }) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const media = current ? post.media[current.assetId] : undefined;
  if (!current || !media) return null;
  return <section className="mx-auto w-full max-w-5xl" aria-label={`Galeria com ${items.length} imagens`}>
    <figure><img src={media.url} srcSet={media.srcSet} sizes="(max-width: 768px) 100vw, 64rem" alt={current.alt} className="mx-auto max-h-[78vh] w-full bg-neutral-50 object-contain" />{current.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{current.caption}</figcaption>}</figure>
    <div className="mt-4 flex items-center justify-center gap-3"><button type="button" aria-label="Imagem anterior" disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40">‹</button><p aria-live="polite" className="min-w-20 text-center text-sm text-neutral-500">{index + 1} / {items.length}</p><button type="button" aria-label="Próxima imagem" disabled={index === items.length - 1} onClick={() => setIndex((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40">›</button></div>
  </section>;
}

function VideoBlock({ block, post }: { block: FeedBlock; post: FeedPost }) {
  const { pause } = useAudioPlayer();
  const [started, setStarted] = useState(false);
  const source = block.source as { kind?: string; videoId?: string; assetId?: string } | undefined;
  const poster = block.posterAssetId ? post.media[String(block.posterAssetId)]?.url : undefined;
  const title = String(block.title ?? "Vídeo da Rádio 88 FM");
  if (source?.kind === "youtube" && source.videoId) return <div className="mx-auto w-full max-w-5xl"><div className="relative aspect-video bg-black">{started ? <iframe title={title} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.videoId)}?autoplay=1&rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" /> : <button type="button" onClick={() => { pause(); setStarted(true); }} className="absolute inset-0 flex w-full items-center justify-center bg-neutral-950 text-white" style={poster ? { background: `center / cover url("${poster}")` } : undefined}><span className="rounded bg-black/70 px-5 py-3 font-bold">Reproduzir vídeo: {title}</span></button>}</div></div>;
  const media = source?.assetId ? post.media[source.assetId] : undefined;
  return media ? <figure className="mx-auto w-full max-w-5xl"><video controls preload="none" poster={poster ?? media.posterUrl} onPlay={pause} className="max-h-[75vh] w-full bg-black" aria-label={title}><source src={media.url} type={media.mimeType ?? "video/mp4"} /></video>{block.caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{String(block.caption)}</figcaption>}</figure> : null;
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
  const children = (node.content ?? []).map((child, index) => <span key={index}>{renderRichText(child)}</span>);
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
