import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MiniPlayer from "./MiniPlayer";
import ListenerRegistrationModal from "./listener-registration/ListenerRegistrationModal";
import { ListenerRegistrationProvider } from "./listener-registration/ListenerRegistrationProvider";
import ClientOnly from "./ClientOnly";
import SocialRail from "./SocialRail";

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
  const isBroadcastPage = location.pathname === "/ouvir" || location.pathname === "/assistir";
  const isLivePage = isBroadcastPage || location.pathname === "/anuncie";

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeColor) return;

    const previousColor = themeColor.content;
    themeColor.content = isBroadcastPage ? "#1360E8" : "#ffffff";
    return () => { themeColor.content = previousColor; };
  }, [isBroadcastPage]);

  return (
    <ListenerRegistrationProvider>
      <div
        className={`radio-shell flex flex-col ${isLivePage ? "bg-radio-brand-blue" : "bg-background"}`}
        data-browser-chrome-theme={isBroadcastPage ? "broadcast" : undefined}
      >
        {isBroadcastPage && (
          <>
            <div className="safari-chrome-edge safari-chrome-edge-top" aria-hidden="true" />
            <div className="safari-chrome-edge safari-chrome-edge-bottom" aria-hidden="true" />
          </>
        )}
        <Header />
        <main id="main-content" className={`flex-1 overflow-x-clip pt-[var(--header-height)] ${isLivePage ? "bg-radio-brand-blue" : ""}`}>
          <Outlet />
        </main>
        <Footer />
        <MiniPlayer />
        <SocialRail key={location.pathname} />
        <ClientOnly>
          <ListenerRegistrationModal />
          {/* <PrivacyLayer /> */}
        </ClientOnly>
      </div>
    </ListenerRegistrationProvider>
  );
};

export default Layout;
