import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Video, X } from "lucide-react";
import logoHeaderColor from "@/assets/logoheadsvgcolor.svg";
import logoHeaderwhite from "@/assets/logoheadsvg.svg";
import { Analytics } from "@/services/analytics/analytics";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DesktopContentsMenu, MobileContentsMenu } from "./ContentNavigation";

const navItems = [
  { label: "INÍCIO", path: "/" },
  { label: "NOSSA RÁDIO", path: "/nossa-radio" },
  { label: "CONTEÚDOS", path: "/conteudos" },
  { label: "FEED", path: "/feed" },
  { label: "EQUIPE", path: "/equipe" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const shouldReduceMotion = usePrefersReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  const handleInternalNavigation = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    path: string,
    destination: string,
    closeMenu = false
  ) => {
    Analytics.track("menu_navigation", { destination });
    if (closeMenu) setMenuOpen(false);

    if (location.pathname === path) {
      event.preventDefault();
      scrollToTop();
    }
  };

  const handleLogoClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);

    if (location.pathname === "/") {
      event.preventDefault();
      scrollToTop();
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !headerRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleCategorySelection = (destination: string) => {
    Analytics.track("menu_navigation", { destination });
    setMenuOpen(false);
    if (location.pathname === "/conteudos") scrollToTop();
  };

  return (
    <header
      ref={headerRef}
      className="site-header fixed left-3 right-3 z-50 mx-auto max-w-[2400px] rounded-b-[16px] border border-white/20 bg-black shadow-lg backdrop-blur-md sm:left-4 sm:right-4 sm:rounded-b-[20px]"
    >
      <div className="mx-auto grid h-16 w-full max-w-[1600px] grid-cols-[minmax(44px,1fr)_auto_minmax(0,1fr)] min-[1051px]:grid-cols-[44px_1fr_auto] min-[1400px]:grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 justify-self-start" onClick={handleLogoClick}>
          <img 
            src={isHovered ? logoHeaderColor : logoHeaderwhite} 
            alt="Rádio 88 FM" 
            // 3. Removemos as classes 'invert brightness-0' quando estiver em hover
            className={`h-10 w-10 object-contain transition-all duration-300 ${!isHovered ? "invert brightness-0" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Navegação principal" className="hidden items-center justify-center gap-3.5 justify-self-center whitespace-nowrap min-[1051px]:flex min-[1400px]:gap-5">
          {navItems.map((item) =>
            item.path === "/conteudos" ? (
              <DesktopContentsMenu key={item.path} onSelect={handleCategorySelection} />
            ) : (
              <Link
                key={item.label}
                to={item.path}
                onClick={(event) => handleInternalNavigation(event, item.path, item.label)}
                className={`font-display text-xs font-semibold tracking-wide transition-colors min-[1400px]:text-sm ${
                  (location.pathname === item.path || (item.path === "/feed" && location.pathname.startsWith("/feed/"))) ? "text-primary" : "text-white hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center justify-end gap-2 justify-self-end whitespace-nowrap min-[1051px]:flex min-[1400px]:gap-4">
          <Link to="/anuncie" onClick={(event) => handleInternalNavigation(event, "/anuncie", "Anuncie")} className="rounded-md bg-radio-blue px-2.5 py-2 font-display text-xs min-[1400px]:px-4 min-[1400px]:text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-radio-blue">ANUNCIE</Link>
          <Link
            to="/ouvir"
            onClick={(event) => handleInternalNavigation(event, "/ouvir", "Ouvir Ao Vivo")}
            className="bg-red-600 font-display font-bold text-xs px-2.5 py-2 min-[1400px]:px-4 min-[1400px]:text-sm rounded-md text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>OUVIR AO VIVO</span>
          </Link>
          <Link
            to="/assistir"
            onClick={(event) => handleInternalNavigation(event, "/assistir", "Assistir Ao Vivo")}
            className="bg-radio-yellow font-display font-bold text-xs px-2.5 py-2 min-[1400px]:px-4 min-[1400px]:text-sm rounded-md text-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Video className="h-4 w-4 shrink-0" aria-hidden="true" /> ASSISTIR
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          className="col-start-3 flex h-11 w-11 items-center justify-center justify-self-end rounded-full text-white min-[1051px]:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-var(--header-height)-var(--player-space))] overflow-y-auto rounded-b-[inherit] border-t border-white/10 bg-black pb-4 min-[1051px]:hidden">
          <nav aria-label="Navegação mobile" className="flex flex-col px-4 pt-2">
            {navItems.map((item) =>
              item.path === "/conteudos" ? (
                <MobileContentsMenu key={item.path} onSelect={handleCategorySelection} />
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex min-h-11 items-center font-display text-sm font-semibold text-white"
                  onClick={(event) => handleInternalNavigation(event, item.path, item.label, true)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link to="/anuncie" className="flex min-h-11 w-full items-center justify-center rounded-md bg-radio-blue px-3 py-2 font-display text-xs font-bold text-white" onClick={(event) => handleInternalNavigation(event, "/anuncie", "Anuncie", true)}>ANUNCIE</Link>
              <Link
                to="/ouvir"
                className="flex w-full items-center justify-center rounded-md bg-radio-red px-3 py-2 font-display text-xs font-bold text-white"
                onClick={(event) => handleInternalNavigation(event, "/ouvir", "Ouvir Ao Vivo", true)}
              >
                <span>OUVIR AO VIVO</span>
              </Link>
              <Link
                to="/assistir"
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-radio-yellow px-3 py-2 font-display text-xs font-bold text-black"
                onClick={(event) => handleInternalNavigation(event, "/assistir", "Assistir Ao Vivo", true)}
              >
                <Video className="h-4 w-4 shrink-0" aria-hidden="true" /> Assistir
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
