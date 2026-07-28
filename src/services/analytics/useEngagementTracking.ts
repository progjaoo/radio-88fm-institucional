import { useEffect } from "react";
import { Analytics } from "./analytics";

const ENGAGEMENT_MILESTONES = [30, 60, 120, 300] as const;

export function getReachedEngagementMilestones(elapsedSeconds: number, sent: Set<number>) {
  return ENGAGEMENT_MILESTONES.filter(
    (milestone) => elapsedSeconds >= milestone && !sent.has(milestone),
  );
}

export function useEngagementTracking(pathname: string) {
  useEffect(() => {
    const sent = new Set<number>();
    let visibleElapsedMs = 0;
    let lastTick = performance.now();

    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === "visible") {
        visibleElapsedMs += Math.max(0, now - lastTick);
        for (const milestone of getReachedEngagementMilestones(visibleElapsedMs / 1000, sent)) {
          sent.add(milestone);
          Analytics.track("engagement_time", { seconds: milestone, page_path: pathname });
        }
      }
      lastTick = now;
    };

    const handleVisibility = () => {
      tick();
      lastTick = performance.now();
    };

    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      tick();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);
}
