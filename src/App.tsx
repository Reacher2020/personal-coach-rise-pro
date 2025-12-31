import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./Coach/Index";
import Clients from "./pages/Coach/Clients";
import CalendarPage from "./pages/Coach/Calendar";
import Workouts from "./pages/Coach/Workouts";
import Progress from "./pages/Coach/Progress";
import Payments from "./pages/Coach/Payments";
import Messages from "./pages/Coach/Messages";
import Settings from "./pages/Coach/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/pages//Coach/" element={<Index />} />
          <Route path="/Coach/clients" element={<Clients />} />
          <Route path="/Coach/calendar" element={<CalendarPage />} />
          <Route path="/Coach/workouts" element={<Workouts />} />
          <Route path="/Coach/progress" element={<Progress />} />
          <Route path="/Coach/payments" element={<Payments />} />
          <Route path="/Coach/messages" element={<Messages />} />
          <Route path="/Coach/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
