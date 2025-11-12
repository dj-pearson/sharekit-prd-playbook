import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { createCheckoutSession, type Plan, type BillingInterval } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: 0,
      annualPrice: 0,
      description: "Perfect for getting started",
      icon: Sparkles,
      color: "cyan",
      popular: false,
      features: [
        "1 landing page",
        "100 signups per month",
        "Beautiful templates",
        "Email capture & delivery",
        "Real-time notifications",
        "Basic analytics",
        "10MB file uploads",
        "ShareKit branding",
      ],
      limitations: [
        "Limited to 1 page",
        "100 signups/month limit",
        "ShareKit branding visible",
      ],
      cta: "Start Free",
      ctaLink: "/auth",
    },
    {
      name: "Pro",
      price: 19,
      annualPrice: 190, // ~$16/mo when billed annually
      description: "For creators who are serious",
      icon: Crown,
      color: "purple",
      popular: true,
      features: [
        "Unlimited pages",
        "1,000 signups per month",
        "Everything in Free, plus:",
        "Remove ShareKit branding",
        "Advanced analytics & insights",
        "AI-powered headline optimization",
        "Email subject line generator",
        "50MB file uploads",
        "Priority support",
        "A/B testing",
        "Email sequences",
      ],
      limitations: [],
      cta: "Start 7-Day Trial",
      ctaLink: "/auth",
      badge: "Most Popular",
    },
    {
      name: "Business",
      price: 49,
      annualPrice: 490, // ~$41/mo when billed annually
      description: "For teams & power users",
      icon: Zap,
      color: "indigo",
      popular: false,
      features: [
        "Unlimited pages",
        "10,000 signups per month",
        "Everything in Pro, plus:",
        "Custom domain",
        "White-label solution",
        "100MB file uploads",
        "Team collaboration",
        "Advanced webhooks",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      limitations: [],
      cta: "Start 7-Day Trial",
      ctaLink: "/auth",
    },
  ];

  const faqs = [
    {
      question: "What happens when I hit my signup limit?",
      answer: "We'll send you a friendly notification when you reach 80% of your limit. At 100%, new signups will be paused until your next billing cycle or you upgrade. Your existing data and pages remain accessible.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer: "Absolutely! Upgrade instantly to unlock more features. When downgrading, you'll keep access to Pro features until the end of your billing period.",
    },
    {
      question: "What's included in the 7-day trial?",
      answer: "Full access to all Pro or Business features, no credit card required upfront. Cancel anytime during the trial with no charges.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes! If you're not satisfied within the first 30 days, we'll refund you in full, no questions asked.",
    },
    {
      question: "How does billing work?",
      answer: "We charge monthly or annually (save 17% with annual billing) via Stripe. You can manage your subscription, update payment methods, and view invoices in your account settings.",
    },
    {
      question: "Can I remove ShareKit branding on the Free plan?",
      answer: "ShareKit branding helps us grow through word-of-mouth and keeps the Free plan free forever. Upgrade to Pro to remove it and support our mission!",
    },
  ];

  const getPlanPrice = (plan: typeof plans[0]) => {
    if (plan.price === 0) return "Free";
    const price = billingPeriod === "monthly" ? plan.price : Math.round(plan.annualPrice / 12);
    return `$${price}`;
  };

  const getPlanBilling = (plan: typeof plans[0]) => {
    if (plan.price === 0) return "Forever";
    if (billingPeriod === "monthly") return "per month";
    return `per month, billed annually ($${plan.annualPrice}/year)`;
  };

  const handlePlanSelect = async (planName: string) => {
    // Free plan - just navigate to auth
    if (planName === "Free") {
      navigate("/auth");
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.info("Please sign up or log in to continue");
      navigate("/auth");
      return;
    }

    // Start checkout for paid plans
    setLoading(planName);
    try {
      const plan = planName.toLowerCase() as Plan;
      const url = await createCheckoutSession(plan, billingPeriod);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Start free, upgrade when you're ready. No credit card required.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 border shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-ocean text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingPeriod === "annual"
                    ? "bg-gradient-ocean text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isPopular = plan.popular;

              return (
                <Card
                  key={plan.name}
                  className={`relative ${
                    isPopular
                      ? "border-2 border-primary shadow-xl scale-105"
                      : "border shadow-large"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-gradient-ocean text-white px-4 py-1 text-sm">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-6">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                        plan.color === "cyan"
                          ? "from-cyan-500 to-blue-600"
                          : plan.color === "purple"
                          ? "from-purple-500 to-indigo-600"
                          : "from-indigo-500 to-purple-600"
                      } flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="text-4xl font-bold">{getPlanPrice(plan)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getPlanBilling(plan)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button
                      onClick={() => handlePlanSelect(plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full mb-6 ${
                        isPopular
                          ? "bg-gradient-ocean hover:opacity-90"
                          : ""
                      }`}
                      size="lg"
                      variant={isPopular ? "default" : "outline"}
                    >
                      {loading === plan.name ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 text-sm ${
                            feature.endsWith("plus:") ? "font-semibold mt-4" : ""
                          }`}
                        >
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trust Signals */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">7 days</div>
                <div className="text-sm text-muted-foreground">Free trial, no CC required</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">30 days</div>
                <div className="text-sm text-muted-foreground">Money-back guarantee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Customer support</div>
              </div>
            </div>
          </div>

          {/* Feature Comparison Link */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Link to="/pricing/compare">
              <Button variant="outline" size="lg">
                View Detailed Feature Comparison
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-2xl mx-auto text-center mt-16 p-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
            <h2 className="text-2xl font-bold mb-4">
              Ready to start sharing?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators using ShareKit to grow their audience
            </p>
            <Button asChild size="lg" className="bg-gradient-ocean hover:opacity-90">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          {" · "}
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
