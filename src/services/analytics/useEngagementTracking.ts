import { useEffect } from "react";
import { Analytics } from "./analytics";

const ENGAGEMENT_MILESTONES = [30, 60, 120, 300];

export function useEngagementTracking(pathname: string) {
  useEffect(() => {
    const timers = ENGAGEMENT_MILESTONES.map((seconds) =>
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          Analytics.track("engagement_time", {
            seconds,
            page_path: pathname,
          });
        }
      }, seconds * 1000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);
}
