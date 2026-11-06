import { HelmetProvider } from "react-helmet-async";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { RADIO_PLAY_REQUEST } from "@/lib/mediaPlayback";
import { FeedProvider } from "@/services/feed/feed-data";
import type { FeedIndex, FeedPostDocument } from "@/services/feed/feed.types";
import Feed from "./Feed";
import FeedPostPage from "./FeedPost";

const { pauseRadio } = vi.hoisted(() => ({ pauseRadio: vi.fn() }));
vi.mock("@/contexts/AudioPlayerContext", () => ({ useAudioPlayer: () => ({ pause: pauseRadio }) }));

const postDocument: FeedPostDocument = {
  schemaVersion: 1,
  namespace: "test/radio-88",
  releaseId: "test-release",
  post: {
    id: "2706e27d-a85e-4ba0-92c3-5f9680a60a44",
    slug: "bastidores-88",
    title: "Bastidores da Rádio 88",
    excerpt: "Um resumo dos bastidores da rádio.",
    cover: { url: "/logo-88fm.png", alt: "Capa de teste" },
    blocks: [{ id: "c084fb6b-df13-4fa1-a861-0579ba976ea5", type: "text", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Conteúdo renderizado sem consulta à API." }] }] } }],
    media: {},
    category: { name: "Bastidores", slug: "bastidores" },
    seoTitle: "Bastidores da Rádio 88 FM",
    seoDescription: "Leia sobre os bastidores da Rádio 88 FM.",
    publishedAt: "2026-10-27T12:00:00.000Z",
  },
};

const index: FeedIndex = {
  schemaVersion: 1,
  namespace: "test/radio-88",
  releaseId: "test-release",
  generatedAt: "2026-10-27T12:00:00.000Z",
  posts: [{
    id: postDocument.post.id,
    slug: postDocument.post.slug,
    title: postDocument.post.title,
    excerpt: postDocument.post.excerpt,
    cover: postDocument.post.cover,
    category: postDocument.post.category,
    publishedAt: postDocument.post.publishedAt,
  }],
};

function RouteLocation() {
  const location = useLocation();
  return <output data-testid="route-location">{location.pathname}{location.search}</output>;
}

describe("Feed editorial estático", () => {
  it("renders the published grid entry and local article link", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed"]}>
          <FeedProvider initialIndex={index}>
            <Feed />
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole("heading", { name: "Feed 88 FM" })).toBeInTheDocument();
    const postLink = screen.getByRole("link", { name: /Bastidores da Rádio 88/i });
    expect(postLink).toHaveAttribute("href", "/feed/bastidores-88");
    expect(postLink).toHaveClass("feed-grid-card");
    expect(postLink.querySelector(".feed-grid-card-media img")).toBeInTheDocument();
    expect(postLink.querySelector(".feed-grid-card-shade")).toHaveAttribute("aria-hidden", "true");
    expect(postLink.querySelector("span")?.className).toContain("text-base");
    expect(postLink.querySelector("span")?.className).not.toContain("translate-y-full");
    expect(document.querySelector("main time, section time")).toBeNull();
  });

  it("filters by occurrence year, not by publication year", () => {
    const datedIndex: FeedIndex = {...index, posts:[
      {...index.posts[0],id:"2025",slug:"festa-2025",title:"Festa em 2025",eventDate:"2025-12-31"},
      {...index.posts[0],id:"2026",slug:"festa-2026",title:"Festa em 2026",eventDate:"2026-01-01"},
      {...index.posts[0],id:"missing",slug:"sem-data",title:"Memória sem data",eventDate:null},
    ]};
    render(<HelmetProvider><MemoryRouter><FeedProvider initialIndex={datedIndex}><Feed /></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(screen.getAllByRole("heading",{level:2}).map((heading)=>heading.textContent)).toEqual(["Festa em 2026","Festa em 2025","Memória sem data"]);
    fireEvent.click(screen.getByRole("button",{name:"2025"}));
    expect(screen.getByRole("heading",{name:"Festa em 2025"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Festa em 2026"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Sem data"})).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox",{name:"Ordenar pelo acontecimento"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Todos"}));
    expect(screen.getAllByRole("heading",{level:2}).map((heading)=>heading.textContent)).toEqual(["Festa em 2026","Festa em 2025","Memória sem data"]);
    expect(document.querySelector("time")).toBeNull();
  });

  it("retains the selected year when paginating", () => {
    const many: FeedIndex = {...index,posts:Array.from({length:13},(_,at)=>({...index.posts[0],id:String(at),slug:`festa-${at}`,title:`Festa ${at}`,eventDate:"2025-01-01"}))};
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed?ano=2025&ordem=antigas"]}><FeedProvider initialIndex={many}><Feed /></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(screen.getByRole("link",{name:"Próxima"})).toHaveAttribute("href","/feed/pagina/2?ano=2025");
  });

  it.each(["sem-data", "1900"])("normalizes obsolete year %s without losing unrelated query values", async (year) => {
    render(<HelmetProvider><MemoryRouter initialEntries={[`/feed?ano=${year}&ordem=antigas&utm_source=teste`]}><FeedProvider initialIndex={index}><Feed /><RouteLocation /></FeedProvider></MemoryRouter></HelmetProvider>);
    await waitFor(() => expect(screen.getByTestId("route-location")).toHaveTextContent("/feed?utm_source=teste"));
    expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "true");
  });

  it("resets to page one when a year filter is selected", async () => {
    const many: FeedIndex = { ...index, posts: Array.from({ length: 13 }, (_, at) => ({ ...index.posts[0], id: String(at), slug: `festa-${at}`, title: `Festa ${at}`, eventDate: at ? "2026-01-01" : "2025-01-01" })) };
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/pagina/2"]}><FeedProvider initialIndex={many}><RouteLocation /><Routes><Route path="/feed" element={<Feed />} /><Route path="/feed/pagina/:page" element={<Feed />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    fireEvent.click(screen.getByRole("button", { name: "2025" }));
    await waitFor(() => expect(screen.getByTestId("route-location")).toHaveTextContent("/feed?ano=2025"));
    expect(screen.getByRole("heading", { name: "Festa 0" })).toBeInTheDocument();
  });

  it("shows a real not-found screen for a slug absent from the release without fetching", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/removido"]}><FeedProvider initialIndex={index}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("treats a missing JSON for a known slug as temporary and retries manually", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("", { status: 404 })).mockResolvedValueOnce(new Response(JSON.stringify(postDocument), { status: 200 }));
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/bastidores-88"]}><FeedProvider initialIndex={index}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(await screen.findByRole("heading", { name: "Publicação temporariamente indisponível" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Página não encontrada" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Conteúdo renderizado sem consulta à API.")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  });

  it("places recent posts after the article, excludes current and uses event order", () => {
    const recentIndex: FeedIndex = { ...index, posts: [...index.posts, ...[2024, 2026, 2025, 2023].map((year) => ({ ...index.posts[0], id: String(year), slug: `festa-${year}`, title: `Festa ${year}`, eventDate: `${year}-01-01` }))] };
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/bastidores-88"]}><FeedProvider initialIndex={recentIndex} initialPosts={{ "bastidores-88": postDocument }}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    const aside = screen.getByRole("complementary");
    expect(within(aside).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/feed/festa-2026", "/feed/festa-2025", "/feed/festa-2024"]);
    expect(screen.getByRole("link", { name: "Anuncie sua marca na Rádio 88 FM" })).toHaveAttribute("href", "/anuncie");
    expect(screen.getByRole("link", { name: "Anuncie sua marca na Rádio 88 FM" }).parentElement).toHaveClass("lg:sticky");
    expect(screen.getByText("Conteúdo renderizado sem consulta à API.").compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the per-post commercial CTA text and destination from the static release", () => {
    const customized: FeedPostDocument = {
      ...postDocument,
      post: { ...postDocument.post, promoCtaText: "Fale com nosso comercial", promoCtaUrl: "https://example.com/comercial" },
    };
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/bastidores-88"]}><FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": customized }}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(screen.getByRole("link", { name: "Fale com nosso comercial" })).toHaveAttribute("href", "https://example.com/comercial");
  });

  it("renders the server-provided article without a public API request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": postDocument }}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Bastidores da Rádio 88" })).toBeInTheDocument();
    expect(screen.getByText("Conteúdo renderizado sem consulta à API.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("loads an article from its static JSON document after direct navigation", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(postDocument), { status: 200 }));
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByText("Conteúdo renderizado sem consulta à API.")).toBeInTheDocument();
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/feed/posts/bastidores-88.json?release=test-release", expect.objectContaining({ cache: "no-store" })));
    fetchSpy.mockRestore();
  });

  it("rejects a static document from an older release", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ...postDocument, releaseId: "old-release" }), { status: 200 }));
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Publicação temporariamente indisponível" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: postDocument.post.title })).not.toBeInTheDocument();
    fetchSpy.mockRestore();
  });

  it("pauses the radio before starting an embedded YouTube video", async () => {
    pauseRadio.mockClear();
    const documentWithVideo: FeedPostDocument = {
      ...postDocument,
      post: {
        ...postDocument.post,
        blocks: [{ id: "video-block", type: "video", title: "Vídeo dos bastidores", source: { kind: "youtube", videoId: "abcdefghijk" } }],
      },
    };
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": documentWithVideo }}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Reproduzir vídeo: Vídeo dos bastidores" }));

    expect(pauseRadio).toHaveBeenCalledOnce();
    expect(await screen.findByTitle("Vídeo dos bastidores")).toHaveAttribute("src", expect.stringContaining("youtube-nocookie.com/embed/abcdefghijk"));
    act(() => window.dispatchEvent(new Event(RADIO_PLAY_REQUEST)));
    expect(screen.queryByTitle("Vídeo dos bastidores")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reproduzir vídeo: Vídeo dos bastidores" })).toBeInTheDocument();
  });

  it("pauses the radio when a local MP4 starts playing", async () => {
    pauseRadio.mockClear();
    const documentWithVideo: FeedPostDocument = {
      ...postDocument,
      post: {
        ...postDocument.post,
        blocks: [{ id: "video-block", type: "video", title: "Vídeo local", source: { kind: "asset", assetId: "video-asset" } }],
        media: { "video-asset": { url: "https://media.example.test/video.mp4", mimeType: "video/mp4" } },
      },
    };
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": documentWithVideo }}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.play(await screen.findByLabelText("Vídeo local"));

    expect(pauseRadio).toHaveBeenCalledOnce();
    const pauseMedia = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    act(() => window.dispatchEvent(new Event(RADIO_PLAY_REQUEST)));
    expect(pauseMedia).toHaveBeenCalledOnce();
    pauseMedia.mockRestore();
  });

  it("animates a GIF automatically without a playback button", async () => {
    const documentWithGif: FeedPostDocument = {
      ...postDocument,
      post: {
        ...postDocument.post,
        blocks: [{ id: "gif-block", type: "gif", assetId: "gif-asset", alt: "Equipe nos bastidores" }],
        media: { "gif-asset": { url: "https://media.example.test/animated.gif" } },
      },
    };
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/feed/bastidores-88"]}>
          <FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": documentWithGif }}>
            <Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes>
          </FeedProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByRole("img", { name: "Equipe nos bastidores" })).toHaveAttribute("src", "https://media.example.test/animated.gif");
    expect(screen.queryByRole("button", { name: "Reproduzir animação" })).not.toBeInTheDocument();
  });

  it("keeps the GIF poster when the device requests reduced motion", async () => {
    const preference = vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList));
    const gif: FeedPostDocument = { ...postDocument, post: { ...postDocument.post, blocks: [{ id: "gif", type: "gif", assetId: "gif", alt: "Animação da festa" }], media: { gif: { url: "/animated.gif", posterUrl: "/poster.webp" } } } };
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/bastidores-88"]}><FeedProvider initialIndex={index} initialPosts={{ "bastidores-88": gif }}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(await screen.findByRole("img", { name: "Animação da festa" })).toHaveAttribute("src", "/poster.webp");
    expect(document.querySelector('img[src="/animated.gif"]')).toBeNull();
    preference.mockRestore();
  });

  it("navigates adjacent published posts in event order without querying the API", async () => {
    const feed: FeedIndex = { ...index, posts: [
      { ...index.posts[0], slug: "antiga", title: "Festa anterior", eventDate: "2025-01-01" },
      { ...index.posts[0], eventDate: "2026-01-01" },
      { ...index.posts[0], slug: "recente", title: "Festa recente", eventDate: "2026-10-01" },
    ] };
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed/bastidores-88"]}><FeedProvider initialIndex={feed} initialPosts={{ "bastidores-88": postDocument }}><Routes><Route path="/feed/:slug" element={<FeedPostPage />} /></Routes></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(await screen.findByRole("link", { name: /Post Anterior/ })).toHaveAttribute("href", "/feed/recente");
    expect(screen.getByRole("link", { name: /Próximo Post/ })).toHaveAttribute("href", "/feed/antiga");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
