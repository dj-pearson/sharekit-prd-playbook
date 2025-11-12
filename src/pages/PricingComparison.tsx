import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useSubscription } from "@/hooks/useSubscription";

const PricingComparison = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const { subscription } = useSubscription();

  const tiers = {
    free: {
      name: "Free",
      price: 0,
      annualPrice: 0,
      color: "cyan",
    },
    pro: {
      name: "Pro",
      price: 19,
      annualPrice: 190,
      color: "purple",
    },
    business: {
      name: "Business",
      price: 49,
      annualPrice: 490,
      color: "indigo",
    },
  };

  // Comprehensive feature list organized by category
  const featureCategories = [
    {
      name: "Core Features",
      features: [
        {
          name: "Landing pages",
          free: "1 page",
          pro: "Unlimited",
          business: "Unlimited",
          description: "Create beautiful landing pages for your campaigns",
        },
        {
          name: "Email capture & delivery",
          free: true,
          pro: true,
          business: true,
          description: "Capture emails and deliver them to your CRM",
        },
        {
          name: "Beautiful templates",
          free: true,
          pro: true,
          business: true,
          description: "Professional templates ready to use",
        },
        {
          name: "Real-time notifications",
          free: true,
          pro: true,
          business: true,
          description: "Get notified instantly when someone signs up",
        },
      ],
    },
    {
      name: "Signup Limits",
      features: [
        {
          name: "Signups per month",
          free: "100",
          pro: "1,000",
          business: "10,000",
          description: "Maximum signups you can collect each month",
          highlighted: true,
        },
        {
          name: "Unlimited signup history",
          free: true,
          pro: true,
          business: true,
          description: "Access all historical signup data",
        },
      ],
    },
    {
      name: "Analytics & Insights",
      features: [
        {
          name: "Basic analytics",
          free: true,
          pro: true,
          business: true,
          description: "Track views, signups, and conversion rates",
        },
        {
          name: "Advanced analytics dashboard",
          free: false,
          pro: true,
          business: true,
          description: "Deep insights with charts and trends",
        },
        {
          name: "Conversion tracking",
          free: false,
          pro: true,
          business: true,
          description: "Track user journey and conversion funnels",
        },
        {
          name: "Export analytics data",
          free: false,
          pro: true,
          business: true,
          description: "Download your data as CSV or JSON",
        },
      ],
    },
    {
      name: "AI-Powered Features",
      features: [
        {
          name: "AI headline optimization",
          free: false,
          pro: true,
          business: true,
          description: "Let AI suggest better headlines for your pages",
        },
        {
          name: "AI email subject lines",
          free: false,
          pro: true,
          business: true,
          description: "Generate compelling subject lines automatically",
        },
        {
          name: "AI content suggestions",
          free: false,
          pro: true,
          business: true,
          description: "Get AI-powered copy recommendations",
        },
      ],
    },
    {
      name: "Marketing Automation",
      features: [
        {
          name: "A/B testing",
          free: false,
          pro: true,
          business: true,
          description: "Test variations to optimize conversions",
        },
        {
          name: "Email sequences",
          free: false,
          pro: true,
          business: true,
          description: "Automated email campaigns and drip sequences",
        },
        {
          name: "Advanced webhooks",
          free: false,
          pro: false,
          business: true,
          description: "Custom webhook integrations for your workflow",
        },
      ],
    },
    {
      name: "File Storage",
      features: [
        {
          name: "File uploads",
          free: "10MB",
          pro: "50MB",
          business: "100MB",
          description: "Upload images, PDFs, and other media",
          highlighted: true,
        },
        {
          name: "Image optimization",
          free: true,
          pro: true,
          business: true,
          description: "Automatic image compression and resizing",
        },
      ],
    },
    {
      name: "Branding & Customization",
      features: [
        {
          name: "Remove ShareKit branding",
          free: false,
          pro: true,
          business: true,
          description: "White-label your landing pages",
        },
        {
          name: "Custom domain",
          free: false,
          pro: false,
          business: true,
          description: "Use your own domain (e.g., go.yourdomain.com)",
        },
        {
          name: "Custom CSS",
          free: false,
          pro: true,
          business: true,
          description: "Add custom styling to match your brand",
        },
      ],
    },
    {
      name: "Collaboration & Teams",
      features: [
        {
          name: "Team members",
          free: "1 user",
          pro: "1 user",
          business: "Unlimited",
          description: "Collaborate with your team",
        },
        {
          name: "Role-based permissions",
          free: false,
          pro: false,
          business: true,
          description: "Control access with admin, editor, viewer roles",
        },
      ],
    },
    {
      name: "Integrations",
      features: [
        {
          name: "Webhook integrations",
          free: "Basic",
          pro: "Advanced",
          business: "Advanced + Custom",
          description: "Connect to Zapier, Make, and more",
        },
        {
          name: "API access",
          free: false,
          pro: true,
          business: true,
          description: "Programmatic access to your data",
        },
        {
          name: "Custom integrations",
          free: false,
          pro: false,
          business: true,
          description: "Build custom integrations with our API",
        },
      ],
    },
    {
      name: "Support & SLA",
      features: [
        {
          name: "Community support",
          free: true,
          pro: true,
          business: true,
          description: "Access to community forums and docs",
        },
        {
          name: "Priority email support",
          free: false,
          pro: true,
          business: true,
          description: "Get help within 24 hours",
        },
        {
          name: "Dedicated account manager",
          free: false,
          pro: false,
          business: true,
          description: "Personal onboarding and ongoing support",
        },
        {
          name: "SLA guarantee",
          free: false,
          pro: false,
          business: true,
          description: "99.9% uptime guarantee",
        },
      ],
    },
  ];

  const getPrice = (tier: keyof typeof tiers) => {
    const plan = tiers[tier];
    if (plan.price === 0) return "Free";
    const price = billingPeriod === "monthly" ? plan.price : Math.round(plan.annualPrice / 12);
    return `$${price}/mo`;
  };

  const renderFeatureValue = (value: boolean | string, isCurrentPlan: boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-emerald-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-slate-300 mx-auto" />
      );
    }
    return (
      <span className={`text-sm ${isCurrentPlan ? "font-semibold" : ""}`}>
        {value}
      </span>
    );
  };

  const isCurrentPlan = (plan: string) => {
    return subscription?.plan === plan;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
          <Link to="/pricing">
            <Button variant="outline">Back to Pricing</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Compare all features
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Choose the perfect plan for your needs. All features are listed below.
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

          {/* Comparison Table */}
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <CardTitle className="text-lg">Features</CardTitle>
                  </div>
                  {Object.entries(tiers).map(([key, tier]) => {
                    const isCurrent = isCurrentPlan(key);
                    return (
                      <div key={key} className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{tier.name}</h3>
                            {isCurrent && (
                              <Badge className="bg-gradient-ocean text-white text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {getPrice(key as keyof typeof tiers)}
                          </div>
                          {!isCurrent && tier.price > 0 && (
                            <Button size="sm" className="mt-2">
                              Upgrade
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {featureCategories.map((category, categoryIdx) => (
                  <div key={categoryIdx}>
                    {/* Category Header */}
                    <div className="bg-slate-100 px-6 py-3 border-b">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-700">
                        {category.name}
                      </h4>
                    </div>

                    {/* Features in Category */}
                    {category.features.map((feature, featureIdx) => (
                      <div
                        key={featureIdx}
                        className={`grid grid-cols-4 gap-4 px-6 py-4 border-b hover:bg-slate-50 transition-colors ${
                          feature.highlighted ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="col-span-1">
                          <div className="font-medium text-sm">{feature.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          {renderFeatureValue(feature.free, isCurrentPlan("free"))}
                        </div>
                        <div className="flex items-center justify-center">
                          {renderFeatureValue(feature.pro, isCurrentPlan("pro"))}
                        </div>
                        <div className="flex items-center justify-center">
                          {renderFeatureValue(feature.business, isCurrentPlan("business"))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="max-w-2xl mx-auto text-center mt-12 p-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
            <h2 className="text-2xl font-bold mb-4">
              Ready to upgrade?
            </h2>
            <p className="text-muted-foreground mb-6">
              Choose a plan that fits your needs and start growing your audience today
            </p>
            <Button asChild size="lg" className="bg-gradient-ocean hover:opacity-90">
              <Link to="/pricing">
                View Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingComparison;
