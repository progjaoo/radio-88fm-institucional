import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { LogoHistoricoItem } from "@/data/historicoLogos";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  items: LogoHistoricoItem[];
}

const getVersionLabel = (index: number) => `${index + 1}ª versão`;

// Menor = mais rapido. Maior = mais lento.
const LOGO_MARQUEE_DURATION_SECONDS = 34;

const HistoryTimeline = ({ items }: HistoryTimelineProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);

  const marqueeStyle = {
    "--history-logo-marquee-duration": `${LOGO_MARQUEE_DURATION_SECONDS}s`,
    "--history-logo-drag-offset": `${dragOffset}px`,
  } as CSSProperties;

  const resetDrag = (target?: EventTarget | null) => {
    if (target instanceof HTMLElement && activePointerIdRef.current !== null) {
      try {
        target.releasePointerCapture(activePointerIdRef.current);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    activePointerIdRef.current = null;
    dragStartXRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    setDragOffset(event.clientX - dragStartXRef.current);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    resetDrag(event.currentTarget);
  };

  const renderLogo = (item: LogoHistoricoItem, index: number, isDuplicate = false) => (
    <div
      key={`${item.id}-${isDuplicate ? "duplicate" : "original"}`}
      tabIndex={isDuplicate ? -1 : 0}
      className="group relative flex min-h-[240px] w-[260px] flex-none items-center justify-center p-6 outline-none transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] focus-visible:-translate-y-2 focus-visible:ring-2 focus-visible:ring-radio-blue focus-visible:ring-offset-2 motion-reduce:transform-none sm:w-[320px] md:min-h-[300px] md:w-[360px] md:p-10 lg:w-[380px]"
    >
      <span className="pointer-events-none absolute left-5 top-5 z-10 inline-flex translate-y-1 items-center gap-2 rounded-full bg-radio-dark/90 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-black opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out before:h-2 before:w-2 before:rounded-full before:bg-radio-blue group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {getVersionLabel(index)}
      </span>
      <img
        src={item.logoSrc}
        alt={isDuplicate ? "" : item.alt}
        draggable={false}
        className="max-h-48 max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none md:max-h-56"
      />
    </div>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("history-logo-marquee mx-auto w-full max-w-[1180px]", isDragging && "history-logo-marquee--dragging")}
      style={marqueeStyle}
      aria-label="Carrossel de logos históricas da Rádio 88 FM"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="history-logo-marquee-track flex w-max flex-nowrap py-5">
        <div className="flex shrink-0 gap-5 pr-5">{items.map((item, index) => renderLogo(item, index))}</div>
        <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">
          {items.map((item, index) => renderLogo(item, index, true))}
        </div>
      </div>
    </div>
  );
};

export default HistoryTimeline;
