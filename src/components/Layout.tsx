import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MiniPlayer from "./MiniPlayer";

const Layout = () => {
  const location = useLocation();
  const isLivePage = location.pathname === "/ouvir" || location.pathname === "/assistir" || location.pathname === "/anuncie";

  return (
    <div className={`min-h-screen flex flex-col ${isLivePage ? "bg-radio-brand-blue" : "bg-background"}`}>
      <Header />
      <main className={`flex-1 pt-16 ${isLivePage ? "bg-radio-brand-blue" : ""}`}>
        <Outlet />
      </main>
      <Footer />
      <MiniPlayer />
    </div>
  );
};

export default Layout;
