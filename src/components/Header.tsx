import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-88fm.png";

const navItems = [
  { label: "NOSSA RÁDIO", path: "/nossa-radio" },
  { label: "EQUIPE", path: "/equipe" },
  { label: "PROGRAMAÇÃO", path: "/programacao" },
  { label: "NOTÍCIAS", path: "http://localhost:8082/fatopopular", external: true },
  { label: "ANUNCIE", path: "/anuncie" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Rádio 88 FM" className="h-10 w-10 object-contain invert brightness-0" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 ml-60">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-sm font-semibold tracking-wide text-white hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className={`font-display text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === item.path ? "text-primary" : "text-white hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/ouvir"
            className="bg-red-600 font-display font-bold text-sm px-4 py-2 rounded-full text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            OUVIR AO VIVO
          </Link>
          <Link
            to="/assistir"
            className="bg-radio-yellow font-display font-bold text-sm px-4 py-2 rounded-full text-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            🎥 Assistir
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 pb-4">
          <nav className="flex flex-col gap-2 px-4 pt-2">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-sm font-semibold py-2 text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="font-display text-sm font-semibold py-2 text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex gap-2 mt-2">
              <Link
                to="/ouvir"
                className="bg-radio-red font-display font-bold text-xs px-3 py-2 rounded-full text-white"
                onClick={() => setMenuOpen(false)}
              >
                OUVIR AO VIVO
              </Link>
              <Link
                to="/assistir"
                className="bg-radio-yellow font-display font-bold text-xs px-3 py-2 rounded-full text-black"
                onClick={() => setMenuOpen(false)}
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
