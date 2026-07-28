import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MiniPlayer from "./MiniPlayer";
import ListenerRegistrationModal from "./listener-registration/ListenerRegistrationModal";
import { ListenerRegistrationProvider } from "./listener-registration/ListenerRegistrationProvider";
import ClientOnly from "./ClientOnly";

/*
 * Banner de consentimento do Analytics preservado para reativacao futura.
 *
 * import CookieConsentBanner from "./analytics/CookieConsentBanner";
 * import { useListenerRegistration } from "@/hooks/useListenerRegistration";
 *
 * const PrivacyLayer = () => {
 *   const { open } = useListenerRegistration();
 *   return <CookieConsentBanner registrationModalOpen={open} />;
 * };
 */

const Layout = () => {
  const location = useLocation();
  const isLivePage = location.pathname === "/ouvir" || location.pathname === "/assistir" || location.pathname === "/anuncie";

  return (
    <ListenerRegistrationProvider>
      <div className={`min-h-screen flex flex-col ${isLivePage ? "bg-radio-brand-blue" : "bg-background"}`}>
        <Header />
        <main className={`flex-1 pt-16 ${isLivePage ? "bg-radio-brand-blue" : ""}`}>
          <Outlet />
        </main>
        <Footer />
        <MiniPlayer />
        <ClientOnly>
          <ListenerRegistrationModal />
          {/* <PrivacyLayer /> */}
        </ClientOnly>
      </div>
    </ListenerRegistrationProvider>
  );
};

export default Layout;
