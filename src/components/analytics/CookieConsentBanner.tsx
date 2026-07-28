import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentState,
} from "@/services/analytics/consent";

interface CookieConsentBannerProps {
  registrationModalOpen: boolean;
}

const CookieConsentBanner = ({ registrationModalOpen }: CookieConsentBannerProps) => {
  const [consent, setConsent] = useState<AnalyticsConsentState>(() => getAnalyticsConsent());

  useEffect(() => {
    const syncConsent = () => setConsent(getAnalyticsConsent());
    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
  }, []);

  const choose = (value: "granted" | "denied") => {
    setAnalyticsConsent(value);
    setConsent(value);
  };

  if (consent !== "unknown" || registrationModalOpen) return null;

  return (
    <section
      role="region"
      aria-label="Preferências de privacidade"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-radio-dark p-4 text-white shadow-2xl sm:p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-base font-extrabold">Analytics e privacidade</h2>
          <p className="mt-1 text-sm leading-6 text-white/75">
            Usamos dados anônimos de navegação para entender o uso do site e melhorar a experiência.
            Nenhum dado do cadastro de ouvintes é enviado ao Google Analytics. Saiba mais em nossa{" "}
            <Link to="/privacidade" className="font-semibold text-radio-blue underline underline-offset-2">
              política de privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 min-[420px]:flex-row">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="min-h-11 rounded-md border border-white/25 px-4 font-display text-sm font-bold transition-colors hover:bg-white/10"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="min-h-11 rounded-md bg-radio-blue px-4 font-display text-sm font-bold transition-colors hover:bg-radio-blue-dark"
          >
            Aceitar analytics
          </button>
        </div>
      </div>
    </section>
  );
};

export default CookieConsentBanner;
