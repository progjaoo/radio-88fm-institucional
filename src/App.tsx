import { ProgrammingProvider } from "@/services/programming/ProgrammingProvider";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NossaRadio from "./pages/NossaRadio";
import Programacao from "./pages/Programacao";
import Anuncie from "./pages/Anuncie";
import Ouvir from "./pages/Ouvir";
import Assistir from "./pages/Assistir";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import Equipe from "./pages/Equipe";
import AnalyticsRouteTracker from "./services/analytics/AnalyticsRouteTracker";
import AnalyticsErrorTracker from "./services/analytics/AnalyticsErrorTracker";
import ScrollToTop from "./components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { filterVercelAnalytics } from "./services/analytics/vercel-consent";
import Feed from "./pages/Feed";
import PollParticipation from "./pages/PollParticipation";
import FeedPostPage, { type FeedPostDocument } from "./pages/FeedPost";
import Debates from "./pages/Debates";
import Contents from "./pages/Contents";
import { FeedProvider } from "./services/feed/feed-data";

interface AppContentProps {
  helmetContext?: Record<string, unknown>;
  initialFeedPosts?: Record<string, FeedPostDocument>;
}

export const AppContent = ({ helmetContext, initialFeedPosts }: AppContentProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AudioPlayerProvider>
          <ProgrammingProvider>
            <ScrollToTop />
            <AnalyticsRouteTracker />
            <AnalyticsErrorTracker />
            <FeedProvider initialPosts={initialFeedPosts}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/nossa-radio" element={<NossaRadio />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/programacao" element={<Programacao />} />
                <Route path="/enquetes/:slug" element={<PollParticipation />} />
                <Route path="/anuncie" element={<Anuncie />} />
                <Route path="/ouvir" element={<Ouvir />} />
                <Route path="/assistir" element={<Assistir />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/debates" element={<Debates />} />
                <Route path="/conteudos" element={<Contents />} />
                <Route path="/feed/pagina/:page" element={<Feed />} />
                <Route path="/feed/:slug" element={<FeedPostPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </FeedProvider>
            <Analytics beforeSend={filterVercelAnalytics} />
            <FloatingWhatsAppButton />
          </ProgrammingProvider>
          </AudioPlayerProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

const App = ({ initialFeedPosts }: Pick<AppContentProps, "initialFeedPosts"> = {}) => (
  <BrowserRouter>
    <AppContent initialFeedPosts={initialFeedPosts} />
  </BrowserRouter>
);

export default App;
