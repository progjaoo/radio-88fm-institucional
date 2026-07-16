import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoHeaderColor from "@/assets/logoheadsvgcolor.svg";
import logoHeaderwhite from "@/assets/logoheadsvg.svg";
import { Analytics } from "@/services/analytics/analytics";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type NavItem = {
  label: string;
  path: string;
  external?: boolean;
};

const navItems: NavItem[] = [
  { label: "INÍCIO", path: "/" },
  { label: "NOSSA RÁDIO", path: "/nossa-radio" },
  { label: "EQUIPE", path: "/equipe" },

/*   { label: "PROGRAMAÇÃO", path: "/programacao" },
 */  
/* { label: "NOTÍCIAS", path: NEWS_URL, external: true }, */
  
  { label: "ANUNCIE", path: "/anuncie" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed left-3 right-3 top-0 z-[100] mx-auto max-w-[2400px] rounded-b-[16px] border border-white/20 bg-black shadow-lg backdrop-blur-md sm:left-4 sm:right-4 sm:rounded-b-[20px]"
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" onClick={handleLogoClick}>
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
        <nav className="hidden items-center gap-5 lg:flex lg:ml-20 xl:ml-60">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => Analytics.track("menu_navigation", { destination: item.label })}
                className="font-display text-sm font-semibold tracking-wide text-white hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                onClick={(event) => handleInternalNavigation(event, item.path, item.label)}
                className={`font-display text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === item.path ? "text-primary" : "text-white hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/ouvir"
            onClick={(event) => handleInternalNavigation(event, "/ouvir", "Ouvir Ao Vivo")}
            className="bg-red-600 font-display font-bold text-sm px-4 py-2 rounded-md text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            OUVIR AO VIVO
          </Link>
          <Link
            to="/assistir"
            onClick={(event) => handleInternalNavigation(event, "/assistir", "Assistir Ao Vivo")}
            className="bg-radio-yellow font-display font-bold text-sm px-4 py-2 rounded-md text-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            🎥 ASSISTIR
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div id="mobile-navigation" className="bg-black border-t border-white/10 pb-4 lg:hidden">
          <nav className="flex flex-col gap-2 px-4 pt-2">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-sm font-semibold py-2 text-white"
                  onClick={() => {
                    Analytics.track("menu_navigation", { destination: item.label });
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="font-display text-sm font-semibold py-2 text-white"
                  onClick={(event) => handleInternalNavigation(event, item.path, item.label, true)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/ouvir"
                className="flex w-full items-center justify-center rounded-md bg-radio-red px-3 py-2 font-display text-xs font-bold text-white"
                onClick={(event) => handleInternalNavigation(event, "/ouvir", "Ouvir Ao Vivo", true)}
              >
                OUVIR AO VIVO
              </Link>
              <Link
                to="/assistir"
                className="flex w-full items-center justify-center rounded-md bg-radio-yellow px-3 py-2 font-display text-xs font-bold text-black"
                onClick={(event) => handleInternalNavigation(event, "/assistir", "Assistir Ao Vivo", true)}
              >
                🎥 Assistir
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
