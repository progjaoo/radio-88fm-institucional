import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { reportWebVitals } from "./services/analytics/webVitals";
import { FEED_BOOTSTRAP_ID, readFeedBootstrap } from "./services/feed/feed-bootstrap";
import feedIndex from "./data/feed-index.json";
import type { FeedIndex } from "./services/feed/feed.types";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado.");
const initialFeedPosts = readFeedBootstrap(document.getElementById(FEED_BOOTSTRAP_ID)?.textContent, feedIndex as FeedIndex);
const app = <App initialFeedPosts={initialFeedPosts} />;

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}

reportWebVitals();
