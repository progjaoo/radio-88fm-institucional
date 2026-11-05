import { Link } from "react-router-dom";
import type { FeedIndexPost } from "@/services/feed/feed.types";
import FeedCover from "./FeedCover";

export default function RecentFeedPosts({ posts }: { posts: FeedIndexPost[] }) {
  if (!posts.length) return null;
  return <aside aria-labelledby="recent-feed-title" className="feed-recent min-w-0 self-start rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-radio-blue">Continue por aqui</p>
    <h2 id="recent-feed-title" className="mt-2 font-display text-lg font-bold leading-tight">Mais acontecimentos da 88</h2>
    <div className="mt-5 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
      {posts.map((post) => <Link key={post.slug} to={`/feed/${post.slug}`} className="group min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-radio-blue">
        <div className="aspect-[7/5] overflow-hidden rounded-md bg-neutral-100"><FeedCover post={post} sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 90vw" /></div>
        <p className="mt-2 line-clamp-2 font-display text-sm font-bold leading-snug group-hover:text-radio-blue">{post.title}</p>
      </Link>)}
    </div>
  </aside>;
}
