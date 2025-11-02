import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import BodyMap from "./pages/BodyMap";
import Performance from "./pages/Performance";
import Specialists from "./pages/Specialists";
import ChefAI from "./pages/ChefAI";
import Medical from "./pages/Medical";
import Subscriptions from "./pages/Subscriptions";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/body" element={<BodyMap />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/chef" element={<ChefAI />} />
            <Route path="/medical" element={<Medical />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
