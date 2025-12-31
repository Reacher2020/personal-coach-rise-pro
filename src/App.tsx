import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/coach/Index";
import Clients from "./pages/coach/Clients";
import CalendarPage from "./pages/coach/Calendar";
import Workouts from "./pages/coach/Workouts";
import Progress from "./pages/coach/Progress";
import Payments from "./pages/coach/Payments";
import Messages from "./pages/coach/Messages";
import Settings from "./pages/coach/Settings";
import NotFound from "./pages/coach/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/pages/coach/" element={<Index />} />
          <Route path="/coach/clients" element={<Clients />} />
          <Route path="/coach/calendar" element={<CalendarPage />} />
          <Route path="/coach/workouts" element={<Workouts />} />
          <Route path="/coach/progress" element={<Progress />} />
          <Route path="/coach/payments" element={<Payments />} />
          <Route path="/coach/messages" element={<Messages />} />
          <Route path="/coach/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
