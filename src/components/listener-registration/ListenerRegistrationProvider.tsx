import type { ReactNode } from "react";
import { useListenerRegistrationCampaign } from "@/hooks/useListenerRegistrationCampaign";
import { ListenerRegistrationContext } from "./ListenerRegistrationContext";

export function ListenerRegistrationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const registration = useListenerRegistrationCampaign();

  return (
    <ListenerRegistrationContext.Provider value={registration}>
      {children}
    </ListenerRegistrationContext.Provider>
  );
}
