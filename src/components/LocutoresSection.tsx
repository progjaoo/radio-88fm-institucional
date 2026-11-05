import { useEffect, useRef, useState } from "react";
import LocutorCard from "./LocutorCard";
import fundolocutores from "@/assets/fundolocutores.png";

interface Locutor {
  image: string;
  name: string;
  program: string;
}

const DESIGN_WIDTH = 1280;

export default function LocutoresSection({ locutores }: { locutores: Locutor[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const width = frame.getBoundingClientRect().width;
      if (width > 0) setScale(Math.min(1, width / DESIGN_WIDTH));
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(frame);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="home-team hidden bg-background px-4 pb-6 pt-2 sm:px-6 lg:block" aria-label="Equipe da Rádio 88 FM">
      <div className="home-team-stage mx-auto flex max-w-[1280px] items-end">
        <div ref={frameRef} className="relative w-full">
          {/* Scale the original composition together, not each portrait independently. */}
          <div className="home-team-canvas absolute bottom-[3px] left-0 z-10 w-[1280px] origin-bottom-left" style={{ transform: `scale(${scale})` }}>
            <div className="relative left-[10px] flex items-end justify-start overflow-hidden -space-x-11">
              {locutores.map((loc, i) => <LocutorCard key={`${loc.name}-${i}`} image={loc.image} name={loc.name} program={loc.program} />)}
            </div>
          </div>
          <img src={fundolocutores} width={3384} height={293} alt="" aria-hidden="true" className="relative h-auto w-full object-contain" />
        </div>
      </div>
    </section>
  );
}
