import { useEffect, useState } from "react";
import { fetchInstitutionalBanners } from "@/services/institutional-banners/api";
import type { PublicInstitutionalBanner } from "@/services/institutional-banners/types";

export function useInstitutionalBanners() {
  const institutionalBannersEnabled =
    import.meta.env.VITE_INSTITUTIONAL_BANNERS_ENABLED !== "false";
  const [banners, setBanners] = useState<PublicInstitutionalBanner[]>([]);
  const [loading, setLoading] = useState(institutionalBannersEnabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!institutionalBannersEnabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setBanners([]);
      setFailed(true);
      setLoading(false);
    }, 5_000);

    fetchInstitutionalBanners(controller.signal)
      .then(({ items }) => {
        if (controller.signal.aborted) return;
        setBanners(items);
        setFailed(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [institutionalBannersEnabled]);

  return { banners, loading, failed };
}
