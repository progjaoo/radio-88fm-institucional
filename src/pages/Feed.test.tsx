import { HelmetProvider } from "react-helmet-async";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
    expect(screen.getByRole("link", { name: /Bastidores da Rádio 88/i })).toHaveAttribute("href", "/feed/bastidores-88");
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
    fireEvent.click(screen.getByRole("button",{name:"2025",exact:true}));
    expect(screen.getByRole("heading",{name:"Festa em 2025"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Festa em 2026"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Sem data",exact:true}));
    expect(screen.getByRole("heading",{name:"Memória sem data"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Festa em 2025"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Todos",exact:true}));
    fireEvent.change(screen.getByRole("combobox",{name:"Ordenar pelo acontecimento"}),{target:{value:"antigas"}});
    expect(screen.getAllByRole("heading",{level:2}).map((heading)=>heading.textContent)).toEqual(["Festa em 2025","Festa em 2026","Memória sem data"]);
    expect(document.querySelector("time")).toBeNull();
  });

  it("retains the selected year when paginating", () => {
    const many: FeedIndex = {...index,posts:Array.from({length:13},(_,at)=>({...index.posts[0],id:String(at),slug:`festa-${at}`,title:`Festa ${at}`,eventDate:"2025-01-01"}))};
    render(<HelmetProvider><MemoryRouter initialEntries={["/feed?ano=2025&ordem=antigas"]}><FeedProvider initialIndex={many}><Feed /></FeedProvider></MemoryRouter></HelmetProvider>);
    expect(screen.getByRole("link",{name:"Próxima",exact:true})).toHaveAttribute("href","/feed/pagina/2?ano=2025&ordem=antigas");
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

    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
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
