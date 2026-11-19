import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./ProgramRail.css";

export default function ProgramRail({ day, cards }: {
  day: string;
  cards: { id: string; content: ReactNode }[];
}) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ index: 0, start: true, end: cards.length < 2 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const sync = () => {
      const origin = (el.children[0] as HTMLElement)?.offsetLeft ?? 0;
      const offsets = [...el.children].map(item => Math.abs((item as HTMLElement).offsetLeft - origin - el.scrollLeft));
      const index = offsets.indexOf(Math.min(...offsets));
      setPosition({ index: Math.max(0, index), start: el.scrollLeft <= 1,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
    };
    sync();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    observer?.observe(el);
    el.addEventListener("scroll", sync, { passive: true });
    return () => { observer?.disconnect(); el.removeEventListener("scroll", sync); };
  }, [cards.length]);

  const move = (direction: -1 | 1) => {
    const el = track.current;
    if (!el || (direction < 0 ? position.start : position.end)) return;
    const origin = (el.children[0] as HTMLElement)?.offsetLeft ?? 0;
    const limit = el.scrollWidth - el.clientWidth;
    const targets = [...el.children].map(item => Math.min(limit, (item as HTMLElement).offsetLeft - origin));
    if (direction < 0) targets.reverse();
    const left = targets.find(value => (value - el.scrollLeft) * direction > 1);
    if (left !== undefined) el.scrollTo({ left });
  };

  return <section aria-label={`Programas de ${day}`} className="program-rail">
    {cards.length > 1 && <div className="program-rail-controls">
      <p className="text-sm text-muted-foreground">Deslize para ver os programas</p>
      <div className="flex items-center gap-2">
        <span className="program-rail-count text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">{position.index + 1} de {cards.length}</span>
        <Button type="button" size="icon" variant="outline" className="h-11 w-11" aria-label="Programa anterior" aria-controls={id} aria-disabled={position.start} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" /></Button>
        <Button type="button" size="icon" variant="outline" className="h-11 w-11" aria-label="Próximo programa" aria-controls={id} aria-disabled={position.end} onClick={() => move(1)}><ChevronRight aria-hidden="true" /></Button>
      </div>
    </div>}
    <ul id={id} ref={track} className="program-rail-track" data-single={cards.length === 1 || undefined}
      tabIndex={0} aria-label={`Lista de programas de ${day}`} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
      }}>
      {cards.map(card => <li key={card.id} className="program-rail-item">{card.content}</li>)}
    </ul>
  </section>;
}
