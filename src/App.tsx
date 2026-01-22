import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcuts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { SkipNavigation, LiveAnnouncerProvider } from "@/components/accessibility";

// Eagerly loaded pages (critical path)
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PublicPage from "./pages/PublicPage";
import DownloadPage from "./pages/DownloadPage";
import NotFound from "./pages/NotFound";

// Lazy loaded dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PricingComparison = lazy(() => import("./pages/PricingComparison"));
const UploadResource = lazy(() => import("./pages/UploadResource"));
const Resources = lazy(() => import("./pages/Resources"));
const Pages = lazy(() => import("./pages/Pages"));
const PageBuilderPage = lazy(() => import("./pages/PageBuilderPage"));
const CreatePage = lazy(() => import("./pages/CreatePage"));
const EditPage = lazy(() => import("./pages/EditPage"));
const PageAnalytics = lazy(() => import("./pages/PageAnalytics"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const Teams = lazy(() => import("./pages/Teams"));
const EmailSequences = lazy(() => import("./pages/EmailSequences"));
const ABTesting = lazy(() => import("./pages/ABTesting"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomDomains = lazy(() => import("./pages/CustomDomains"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DMCA = lazy(() => import("./pages/DMCA"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Accessibility = lazy(() => import("./pages/Accessibility"));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminMonitoring = lazy(() => import("./pages/admin/AdminMonitoring"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminCMS = lazy(() => import("./pages/admin/AdminCMS"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Loading fallback component with accessibility support
const PageLoader = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="Loading page content"
  >
    <div className="text-center">
      <div
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
        aria-hidden="true"
      ></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
      <span className="sr-only">Please wait while the page loads</span>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <AccessibilityProvider>
        <LiveAnnouncerProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SkipNavigation />
                <CookieConsent />
                <KeyboardShortcutsDialog />
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/accessibility" element={<Accessibility />} />
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
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </LiveAnnouncerProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
