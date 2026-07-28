import { createContext } from "react";
import type { useListenerRegistrationCampaign } from "@/hooks/useListenerRegistrationCampaign";

export type ListenerRegistrationContextValue = ReturnType<
  typeof useListenerRegistrationCampaign
>;

export const ListenerRegistrationContext =
  createContext<ListenerRegistrationContextValue | null>(null);
