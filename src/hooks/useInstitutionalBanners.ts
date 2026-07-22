import { useEffect, useState } from "react";
import { fetchInstitutionalBanners } from "@/services/institutional-banners/api";
import type { PublicInstitutionalBanner } from "@/services/institutional-banners/types";

export function useInstitutionalBanners() {
  const [banners, setBanners] = useState<PublicInstitutionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchInstitutionalBanners(controller.signal)
      .then(({ items }) => {
        setBanners(items);
        setFailed(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { banners, loading, failed };
}
