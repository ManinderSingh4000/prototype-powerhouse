import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScriptsPage from "./pages/ScriptsPage";
import AssignCharactersPage from "./pages/AssignCharactersPage";
import RehearsalPage from "./pages/RehearsalPage";
import VoicesPage from "./pages/VoicesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/scripts/:id/assign" element={<AssignCharactersPage />} />
          <Route path="/rehearse" element={<RehearsalPage />} />
          <Route path="/rehearse/:id" element={<RehearsalPage />} />
          <Route path="/voices" element={<VoicesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
