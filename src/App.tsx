import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NossaRadio from "./pages/NossaRadio";
import Programacao from "./pages/Programacao";
import Anuncie from "./pages/Anuncie";
import Ouvir from "./pages/Ouvir";
import Assistir from "./pages/Assistir";
import NotFound from "./pages/NotFound";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import Equipe from "./pages/Equipe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AudioPlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/nossa-radio" element={<NossaRadio />} />
               <Route path="/equipe" element={<Equipe />} />
              <Route path="/programacao" element={<Programacao />} />
              <Route path="/anuncie" element={<Anuncie />} />
              <Route path="/ouvir" element={<Ouvir />} />
              <Route path="/assistir" element={<Assistir />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingWhatsAppButton />
        </BrowserRouter>
      </AudioPlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
