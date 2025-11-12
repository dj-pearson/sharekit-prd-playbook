import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import PricingComparison from "./pages/PricingComparison";
import Dashboard from "./pages/Dashboard";
import UploadResource from "./pages/UploadResource";
import Resources from "./pages/Resources";
import Pages from "./pages/Pages";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import PageAnalytics from "./pages/PageAnalytics";
import Analytics from "./pages/Analytics";
import Webhooks from "./pages/Webhooks";
import Teams from "./pages/Teams";
import PublicPage from "./pages/PublicPage";
import DownloadPage from "./pages/DownloadPage";
import EmailSequences from "./pages/EmailSequences";
import ABTesting from "./pages/ABTesting";
import Settings from "./pages/Settings";
import CustomDomains from "./pages/CustomDomains";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* CookieConsent moved inside BrowserRouter */}
        <BrowserRouter>
          <CookieConsent />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing/compare" element={<PricingComparison />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/webhooks" element={<Webhooks />} />
            <Route path="/dashboard/teams" element={<Teams />} />
            <Route path="/dashboard/upload" element={<UploadResource />} />
            <Route path="/dashboard/resources" element={<Resources />} />
            <Route path="/dashboard/pages" element={<Pages />} />
            <Route path="/dashboard/pages/create" element={<CreatePage />} />
            <Route path="/dashboard/pages/:id/edit" element={<EditPage />} />
            <Route path="/dashboard/pages/:id/analytics" element={<PageAnalytics />} />
            <Route path="/dashboard/pages/:pageId/sequences" element={<EmailSequences />} />
            <Route path="/dashboard/pages/:pageId/ab-testing" element={<ABTesting />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/domains" element={<CustomDomains />} />
            <Route path="/p/:slug" element={<PublicPage />} />
            <Route path="/d/:token" element={<DownloadPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
