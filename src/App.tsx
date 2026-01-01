import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcuts";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import PricingComparison from "./pages/PricingComparison";
import Dashboard from "./pages/Dashboard";
import UploadResource from "./pages/UploadResource";
import Resources from "./pages/Resources";
import Pages from "./pages/Pages";
import PageBuilderPage from "./pages/PageBuilderPage";
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
import DMCA from "./pages/DMCA";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";

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
          <KeyboardShortcutsDialog />
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
            <Route path="/dashboard/page-builder" element={<PageBuilderPage />} />
            <Route path="/dashboard/pages/builder/:pageId?" element={<PageBuilderPage />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/domains" element={<CustomDomains />} />
            <Route path="/p/:slug" element={<PublicPage />} />
            <Route path="/:username/:pageSlug" element={<PublicPage />} />
            <Route path="/d/:token" element={<DownloadPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/monitoring" element={<AdminMonitoring />} />
            <Route path="/admin/content" element={<AdminModeration />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/cms" element={<AdminCMS />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
