import { useEffect, useRef } from "react";
import { Analytics } from "./analytics";

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

export function calculateScrollDepth(
  scrollTop: number,
  documentHeight: number,
  viewportHeight: number,
  hasInteracted: boolean,
) {
  const scrollableHeight = documentHeight - viewportHeight;
  if (scrollableHeight <= 0) return hasInteracted ? 100 : null;
  return Math.min(100, Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)));
}

export function useScrollTracking(pathname: string) {
  const sentMilestonesRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    sentMilestonesRef.current = new Set();
    hasScrolledRef.current = false;

    const measure = () => {
      tickingRef.current = false;
      const percent = calculateScrollDepth(
        window.scrollY || document.documentElement.scrollTop,
        document.documentElement.scrollHeight,
        window.innerHeight,
        hasScrolledRef.current,
      );
      if (percent === null) return;

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !sentMilestonesRef.current.has(milestone)) {
          sentMilestonesRef.current.add(milestone);
          Analytics.track("scroll_depth", { percent: milestone, page_path: pathname });
        }
      }
    };

    const scheduleMeasure = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(measure);
    };

    const handleScroll = () => {
      hasScrolledRef.current = true;
      scheduleMeasure();
    };

    measure();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [pathname]);
}
