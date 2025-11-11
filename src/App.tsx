import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UploadResource from "./pages/UploadResource";
import Resources from "./pages/Resources";
import Pages from "./pages/Pages";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import PageAnalytics from "./pages/PageAnalytics";
import Analytics from "./pages/Analytics";
import Webhooks from "./pages/Webhooks";
import PublicPage from "./pages/PublicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/webhooks" element={<Webhooks />} />
          <Route path="/dashboard/upload" element={<UploadResource />} />
          <Route path="/dashboard/resources" element={<Resources />} />
          <Route path="/dashboard/pages" element={<Pages />} />
          <Route path="/dashboard/pages/create" element={<CreatePage />} />
          <Route path="/dashboard/pages/:id/edit" element={<EditPage />} />
          <Route path="/dashboard/pages/:id/analytics" element={<PageAnalytics />} />
          <Route path="/p/:slug" element={<PublicPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
