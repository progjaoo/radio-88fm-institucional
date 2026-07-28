import { ListenerRegistrationApiError } from "@/services/listener-registration/types";

export function getListenerRegistrationErrorMessage(error: unknown) {
  if (error instanceof ListenerRegistrationApiError) {
    if (error.code === "PHONE_ALREADY_PARTICIPATING") {
      return "Você já está participando do sorteio.";
    }
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return "Muitas tentativas. Aguarde um pouco antes de tentar novamente.";
    }
    if (error.code === "CAMPAIGN_CLOSED" || error.code === "CAMPAIGN_UNAVAILABLE") {
      return "Este cadastro nao esta disponivel no momento.";
    }
    if (error.code === "PRIVACY_NOTICE_VERSION_MISMATCH") {
      return "O aviso de privacidade foi atualizado. Feche e abra o site novamente antes de continuar.";
    }
    return error.message;
  }

  return "Nao foi possivel enviar agora. Verifique sua conexao e tente novamente.";
}
