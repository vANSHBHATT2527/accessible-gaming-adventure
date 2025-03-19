
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initSpeechSynthesis } from "@/utils/speechSynthesis";
import { initSpeechRecognition, startListening } from "@/utils/speechRecognition";

import Index from "./pages/Index";
import Games from "./pages/Games";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Chess from "./components/games/Chess";
import MemoryGame from "./components/games/MemoryGame";

const queryClient = new QueryClient();

const App = () => {
  // Initialize speech synthesis and recognition on app load
  useEffect(() => {
    initSpeechSynthesis();
    const recognitionInitialized = initSpeechRecognition();
    
    if (recognitionInitialized) {
      startListening();
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/chess" element={<div className="min-h-screen"><Chess /></div>} />
            <Route path="/games/memory" element={<div className="min-h-screen"><MemoryGame /></div>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
