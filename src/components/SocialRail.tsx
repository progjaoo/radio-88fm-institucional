import { useEffect, useId, useRef, useState } from "react";
import { Share2, X } from "lucide-react";
import { socialLinks } from "@/config/social-links";
import "./SocialRail.css";

export default function SocialRail() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={root} className="social-rail" data-open={open} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button ref={toggle} type="button" className="social-rail-toggle" aria-expanded={open} aria-controls={id} aria-label={open ? "Fechar redes sociais" : "Abrir redes sociais"} onClick={() => setOpen(value => !value)}>
        {open ? <X size={19} aria-hidden="true" /> : <Share2 size={19} aria-hidden="true" />}
        <span>Redes</span>
      </button>
      <nav id={id} className="social-rail-links" aria-label="Redes sociais da Rádio 88 FM">
        {socialLinks.map(social => (
          <a key={social.id} className={`social-rail-link social-rail-${social.id}`} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} da Rádio 88 FM (nova aba)`}>
            <span className="social-rail-icon" aria-hidden="true" style={{ maskImage: `url("${social.icon}")`, WebkitMaskImage: `url("${social.icon}")` }} />
            <span className="social-rail-tooltip" aria-hidden="true">{social.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
