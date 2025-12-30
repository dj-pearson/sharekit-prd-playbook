import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Use APP_URL for CORS to restrict origins (defaults to localhost for development)
const allowedOrigin = Deno.env.get("APP_URL") || "http://localhost:5173";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TriggerWebhookRequest {
  event_type: string;
  page_id: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, page_id, data }: TriggerWebhookRequest = await req.json();

    console.log(`Triggering webhooks for event: ${event_type}, page: ${page_id}`);

    // Import Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the page owner
    const { data: pageData, error: pageError } = await supabase
      .from("pages")
      .select("user_id")
      .eq("id", page_id)
      .single();

    if (pageError || !pageData) {
      console.error("Page not found:", pageError);
      return new Response(
        JSON.stringify({ error: "Page not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get active webhooks for this user that listen to this event
    const { data: webhooks, error: webhooksError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", pageData.user_id)
      .eq("is_active", true)
      .contains("events", [event_type]);

    if (webhooksError) {
      console.error("Error fetching webhooks:", webhooksError);
      throw webhooksError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("No active webhooks found for this event");
      return new Response(
        JSON.stringify({ message: "No webhooks to trigger" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${webhooks.length} webhooks to trigger`);

    // Trigger each webhook
    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        const payload = {
          event: event_type,
          page_id: page_id,
          timestamp: new Date().toISOString(),
          data: data,
        };

        // Create signature if secret is provided
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (webhook.secret) {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(webhook.secret);
          const key = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(JSON.stringify(payload))
          );
          const hashArray = Array.from(new Uint8Array(signature));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          headers["X-Webhook-Signature"] = hashHex;
        }

        console.log(`Sending webhook to: ${webhook.url}`);

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        // Log the webhook call
        await supabase.from("webhook_logs").insert({
          webhook_id: webhook.id,
          event_type: event_type,
          status_code: response.status,
          response_body: responseText.substring(0, 1000), // Limit size
          error_message: response.ok ? null : `HTTP ${response.status}`,
        });

        console.log(`Webhook ${webhook.name} responded with status: ${response.status}`);

        return {
          webhook_id: webhook.id,
          webhook_name: webhook.name,
          success: response.ok,
          status: response.status,
        };
      } catch (error: any) {
        console.error(`Error calling webhook ${webhook.name}:`, error);

        // Log the error
        await supabase.from("webhook_logs").insert({
          webhook_id: webhook.id,
          event_type: event_type,
          status_code: null,
          response_body: null,
          error_message: error.message,
        });

        return {
          webhook_id: webhook.id,
          webhook_name: webhook.name,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(webhookPromises);

    return new Response(
      JSON.stringify({
        message: "Webhooks triggered",
        results: results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in trigger-webhooks function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
