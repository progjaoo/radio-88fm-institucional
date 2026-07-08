import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoHeaderColor from "@/assets/logoheadsvgcolor.svg";
import logoHeaderwhite from "@/assets/logoheadsvg.svg";
import logo from "@/assets/logoheadsvg.svg";
import { useTheme } from "next-themes";
import { Analytics } from "@/services/analytics/analytics";

const NEWS_URL = import.meta.env.VITE_NEWS_URL || "http://localhost:8082/fatopopular";

type NavItem = {
  label: string;
  path: string;
  external?: boolean;
};

const navItems: NavItem[] = [
  { label: "NOSSA RÁDIO", path: "/nossa-radio" },
  { label: "EQUIPE", path: "/equipe" },

/*   { label: "PROGRAMAÇÃO", path: "/programacao" },
 */  
/* { label: "NOTÍCIAS", path: NEWS_URL, external: true }, */
  
  { label: "ANUNCIE", path: "/anuncie" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const [isHovered, setIsHovered] = useState(false);
  return (
    <header className="fixed left-3 right-3 top-0 z-[100] mx-auto max-w-[2400px] rounded-b-[16px] border border-white/20 bg-black shadow-lg backdrop-blur-md sm:left-4 sm:right-4 sm:rounded-b-[20px]">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
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
                onClick={() => Analytics.track("menu_navigation", { destination: item.label })}
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
            onClick={() => Analytics.track("menu_navigation", { destination: "Ouvir Ao Vivo" })}
            className="bg-red-600 font-display font-bold text-sm px-4 py-2 rounded-md text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            OUVIR AO VIVO
          </Link>
          <Link
            to="/assistir"
            onClick={() => Analytics.track("menu_navigation", { destination: "Assistir Ao Vivo" })}
            className="bg-radio-yellow font-display font-bold text-sm px-4 py-2 rounded-md text-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            🎥 ASSISTIR
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="bg-black border-t border-white/10 pb-4 lg:hidden">
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
                  onClick={() => {
                    Analytics.track("menu_navigation", { destination: item.label });
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/ouvir"
                className="flex w-full items-center justify-center rounded-md bg-radio-red px-3 py-2 font-display text-xs font-bold text-white"
                onClick={() => {
                  Analytics.track("menu_navigation", { destination: "Ouvir Ao Vivo" });
                  setMenuOpen(false);
                }}
              >
                OUVIR AO VIVO
              </Link>
              <Link
                to="/assistir"
                className="flex w-full items-center justify-center rounded-md bg-radio-yellow px-3 py-2 font-display text-xs font-bold text-black"
                onClick={() => {
                  Analytics.track("menu_navigation", { destination: "Assistir Ao Vivo" });
                  setMenuOpen(false);
                }}
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
