import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getListenerRegistrationEventsUrl,
  getListenerRegistrationOpenDelayMs,
  getListenerRegistrationPlacement,
  isListenerRegistrationEnabled,
  resolveListenerRegistrationSession,
} from "@/services/listener-registration/api";
import {
  markListenerRegistrationCompleted,
  getOrCreateDeviceToken,
} from "@/services/listener-registration/storage";

export function useListenerRegistrationCampaign() {
  const enabled = isListenerRegistrationEnabled();
  const placement = getListenerRegistrationPlacement();
  const [deviceToken] = useState(() => getOrCreateDeviceToken());
  const [open, setOpen] = useState(false);
  const [closedCampaignSlug, setClosedCampaignSlug] = useState<string | null>(null);
  const forceOpen =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("cadastroOuvinte") === "1";

  const query = useQuery({
    queryKey: ["listener-registration-session", placement],
    queryFn: () => resolveListenerRegistrationSession(deviceToken),
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? 30_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });
  const refetchSession = query.refetch;

  const campaign = query.data?.campaign ?? null;

  const canShow = useMemo(() => {
    if (!campaign) return false;
    if (forceOpen) return true;
    if (closedCampaignSlug === campaign.slug) return false;
    if (query.data?.experience === "already_participating") return false;
    if (query.data?.experience === "campaign_unavailable") return false;
    return true;
  }, [campaign, closedCampaignSlug, forceOpen, query.data?.experience]);

  useEffect(() => {
    if (campaign && closedCampaignSlug && closedCampaignSlug !== campaign.slug) {
      setClosedCampaignSlug(null);
    }
  }, [campaign, closedCampaignSlug]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refetchSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [enabled, refetchSession]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("EventSource" in window)) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(getListenerRegistrationEventsUrl());
    } catch {
      return;
    }

    const handleChange = () => {
      void refetchSession();
    };

    eventSource.addEventListener("campaign.changed", handleChange);
    return () => {
      eventSource?.removeEventListener("campaign.changed", handleChange);
      eventSource?.close();
    };
  }, [enabled, refetchSession]);

  useEffect(() => {
    if (!canShow) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, getListenerRegistrationOpenDelayMs());

    return () => window.clearTimeout(timer);
  }, [canShow]);

  function complete() {
    if (!campaign) return;
    markListenerRegistrationCompleted(campaign.slug);
    setClosedCampaignSlug(null);
    setOpen(false);
    void refetchSession();
  }

  function dismiss() {
    if (!campaign) return;
    setClosedCampaignSlug(campaign.slug);
    setOpen(false);
  }

  return {
    campaign,
    enabled,
    deviceToken,
    experience: query.data?.experience,
    error: query.error,
    isLoading: query.isLoading,
    open: enabled && open && !!campaign,
    setOpen,
    complete,
    dismiss,
    refetchCampaign: refetchSession,
  };
}
