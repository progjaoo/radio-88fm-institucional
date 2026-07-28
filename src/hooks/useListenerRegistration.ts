import { useContext } from "react";
import { ListenerRegistrationContext } from "@/components/listener-registration/ListenerRegistrationContext";

export function useListenerRegistration() {
  const context = useContext(ListenerRegistrationContext);
  if (!context) {
    throw new Error(
      "useListenerRegistration deve ser usado dentro de ListenerRegistrationProvider.",
    );
  }
  return context;
}
