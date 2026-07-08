import { useEffect, useRef } from "react";
import { Analytics } from "./analytics";

const SCROLL_MILESTONES = [25, 50, 75, 100];

export function useScrollTracking(pathname: string) {
  const sentMilestonesRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  useEffect(() => {
    sentMilestonesRef.current = new Set();

    const measure = () => {
      tickingRef.current = false;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollHeight <= 0 ? 100 : Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !sentMilestonesRef.current.has(milestone)) {
          sentMilestonesRef.current.add(milestone);
          Analytics.track("scroll_depth", {
            percent: milestone,
            page_path: pathname,
          });
        }
      }
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);
}
