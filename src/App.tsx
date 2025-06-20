import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhoneTrackerPage from "./pages/PhoneTrackerPage";
import IPTrackerPage from "./pages/IPTrackerPage";
import MapTest from "./pages/MapTest";
import WhatsAppTester from "./pages/WhatsAppTester";
import UpsellPage from './components/UpsellPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/phone-tracker" element={<PhoneTrackerPage />} />
          <Route path="/ip-tracker" element={<IPTrackerPage />} />
          <Route path="/map-test" element={<MapTest />} />
          <Route path="/whatsapp-test" element={<WhatsAppTester />} />
          <Route path="/upsell" element={<UpsellPage 
            userData={{
              phone: "11999999999",
              gender: "Mulher",
              name: "Teste",
              age: "25",
              email: "teste@exemplo.com"
            }} 
            onAccept={() => alert("Upgrade aceito!")} 
            onDecline={() => alert("Upgrade recusado!")} 
          />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
