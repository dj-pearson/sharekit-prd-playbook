import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

/**
 * Get plan from Stripe price ID
 * You need to configure these price IDs to match your Stripe Dashboard
 */
function getPlanFromPriceId(priceId: string): "free" | "pro" | "business" {
  const proPriceIds = [
    Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID"),
    Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID"),
  ];

  const businessPriceIds = [
    Deno.env.get("STRIPE_BUSINESS_MONTHLY_PRICE_ID"),
    Deno.env.get("STRIPE_BUSINESS_YEARLY_PRICE_ID"),
  ];

  if (proPriceIds.includes(priceId)) {
    return "pro";
  }

  if (businessPriceIds.includes(priceId)) {
    return "business";
  }

  // Default to free if price not recognized
  return "free";
}

const handler = async (req: Request): Promise<Response> => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    console.log(`Received webhook event: ${event.type}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in session metadata");
          break;
        }

        console.log(`Checkout completed for user ${userId}`);

        // Get the subscription
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Get the price ID to determine plan
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        // Update user profile
        await supabase
          .from("profiles")
          .update({
            subscription_plan: plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", userId);

        console.log(`Updated user ${userId} to ${plan} plan`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error(`No user found for customer ${customerId}`);
          break;
        }

        // Get the price ID to determine plan
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        // Check subscription status
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        // Update user profile
        await supabase
          .from("profiles")
          .update({
            subscription_plan: isActive ? plan : "free",
            stripe_subscription_id: subscription.id,
          })
          .eq("id", profile.id);

        console.log(`Updated subscription for user ${profile.id} to ${isActive ? plan : "free"} (status: ${subscription.status})`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error(`No user found for customer ${customerId}`);
          break;
        }

        // Downgrade to free plan
        await supabase
          .from("profiles")
          .update({
            subscription_plan: "free",
            stripe_subscription_id: null,
          })
          .eq("id", profile.id);

        console.log(`Downgraded user ${profile.id} to free plan`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        // You could send a receipt email here
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // You could send a payment failure notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);
