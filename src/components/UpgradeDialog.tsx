import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2, ArrowRight } from "lucide-react";
import { createCheckoutSession, type Plan, type BillingInterval } from "@/lib/stripe";
import { toast } from "sonner";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan?: "pro" | "business";
  feature?: string;
}

export function UpgradeDialog({ open, onOpenChange, requiredPlan = "pro", feature }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingInterval>("monthly");

  const plans = {
    pro: {
      name: "Pro",
      price: 19,
      annualPrice: 190,
      features: [
        "Unlimited pages",
        "1,000 signups per month",
        "Remove ShareKit branding",
        "Advanced analytics",
        "AI-powered features",
        "A/B testing",
        "Email sequences",
        "50MB file uploads",
        "Priority support",
      ],
    },
    business: {
      name: "Business",
      price: 49,
      annualPrice: 490,
      features: [
        "Everything in Pro, plus:",
        "10,000 signups per month",
        "Custom domain",
        "White-label solution",
        "100MB file uploads",
        "Team collaboration",
        "Advanced webhooks",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
    },
  };

  const plan = plans[requiredPlan];
  const price = billingPeriod === "monthly" ? plan.price : Math.round(plan.annualPrice / 12);

  const handleUpgrade = async (selectedPlan: Plan) => {
    setLoading(true);
    try {
      const url = await createCheckoutSession(selectedPlan, billingPeriod);
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
      setLoading(false);
    }
  };

  const Icon = requiredPlan === "pro" ? Crown : Zap;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
              requiredPlan === "pro"
                ? "from-purple-500 to-indigo-600"
                : "from-indigo-500 to-purple-600"
            } flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Upgrade to {plan.name}</DialogTitle>
              {feature && (
                <DialogDescription>
                  Unlock {feature} and more
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs px-1.5 py-0">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-center py-4">
            <div className="text-4xl font-bold">${price}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {billingPeriod === "monthly"
                ? "per month"
                : `per month, billed annually ($${plan.annualPrice}/year)`
              }
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={() => handleUpgrade(requiredPlan)}
            disabled={loading}
            className="w-full bg-gradient-ocean hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Upgrade to {plan.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            7-day free trial • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
