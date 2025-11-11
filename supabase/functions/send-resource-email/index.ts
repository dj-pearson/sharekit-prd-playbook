import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Build resource list HTML
    const resourceListHtml = resources.map(resource => `
      <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${resource.title}</h3>
        ${resource.description ? `<p style="margin: 0 0 15px 0; color: #666;">${resource.description}</p>` : ''}
        <a href="${resource.file_url}" 
           style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Download ${resource.file_name}
        </a>
      </div>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0;">ShareKit</h1>
          </div>
          
          <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">
              ${fullName ? `Hi ${fullName}!` : 'Hi there!'}
            </h2>
            
            <p style="color: #666; font-size: 16px;">
              Thank you for your interest in <strong>${pageTitle}</strong>. 
              Here are your downloadable resources:
            </p>
            
            ${resourceListHtml}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                This email was sent because you requested access to resources from ShareKit.
                If you didn't make this request, you can safely ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>Powered by ShareKit</p>
          </div>
        </body>
      </html>
    `;

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
        html: emailHtml,
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
