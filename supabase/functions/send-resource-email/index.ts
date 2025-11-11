import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Removed React Email dependencies; using inline HTML generator
function generateResourceEmailHtml(
  fullName: string | null,
  pageTitle: string,
  resources: Array<{ title: string; description: string | null; file_url: string; file_name: string; }>
) {
  const greeting = fullName ? `Hi ${fullName}!` : 'Hi there!';
  const resourcesHtml = resources
    .map((r) => `
      <section style="background-color:#f5f5f5;border-radius:8px;margin:20px;padding:24px;">
        <h3 style="color:#333;font-size:20px;font-weight:600;margin:0 0 10px 0;">${r.title}</h3>
        ${r.description ? `<p style="color:#666;font-size:14px;line-height:20px;margin:0 0 16px 0;">${r.description}</p>` : ''}
        <a href="${r.file_url}" style="background-color:#667eea;border-radius:6px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;padding:12px 24px;">Download ${r.file_name}</a>
      </section>
    `)
    .join('');

  return `<!DOCTYPE html><html><head><meta charSet="utf-8"><title>Your resources from ${pageTitle} are ready</title></head><body style="background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#ffffff;padding:20px 0 48px; margin-bottom:64px;"><h1 style="color:#667eea;font-size:32px;font-weight:bold;margin:40px 0;text-align:center;">ShareKit</h1><h2 style="color:#333;font-size:24px;font-weight:bold;margin:30px 20px 20px;">${greeting}</h2><p style="color:#666;font-size:16px;line-height:24px;margin:16px 20px;">Thank you for your interest in <strong>${pageTitle}</strong>. Here are your downloadable resources:</p>${resourcesHtml}<section style="border-top:1px solid #e5e5e5;margin:32px 20px 0;padding-top:20px;"><p style="color:#999;font-size:14px;line-height:20px;margin:0;">This email was sent because you requested access to resources from ShareKit. If you didn't make this request, you can safely ignore this email.</p></section><p style="color:#999;font-size:12px;text-align:center;margin-top:30px;">Powered by ShareKit</p></div></body></html>`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  email: string;
  fullName: string | null;
  pageTitle: string;
  resources: Array<{
    title: string;
    description: string | null;
    file_url: string;
    file_name: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, pageTitle, resources }: SendEmailRequest = await req.json();

    console.log(`Sending resources email to ${email} for page: ${pageTitle}`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Generate HTML without React Email to avoid npm deps
    const html = generateResourceEmailHtml(
      fullName,
      pageTitle,
      resources
    );

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ShareKit <onboarding@resend.dev>",
        to: [email],
        subject: `Your Resources from ${pageTitle}`,
        html,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-resource-email function:", error);
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
