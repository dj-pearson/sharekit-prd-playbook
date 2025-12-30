import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Removed React Email dependencies; using inline HTML generator
function generateSequenceEmailHtml(fullName: string | null, subject: string, bodyContent: string) {
  const greeting = fullName ? `Hi ${fullName}!` : 'Hi there!';
  const bodyHtml = (bodyContent || '').replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html><head><meta charSet="utf-8"><title>${subject}</title></head><body style="background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#ffffff;padding:20px 0 48px; margin-bottom:64px;"><h1 style="color:#667eea;font-size:32px;font-weight:bold;margin:40px 0;text-align:center;">ShareKit</h1><h2 style="color:#333;font-size:24px;font-weight:bold;margin:30px 20px 20px;">${greeting}</h2><section style="color:#333;font-size:16px;line-height:24px;margin:16px 20px;">${bodyHtml}</section><section style="border-top:1px solid #e5e5e5;margin:32px 20px 0;padding-top:20px;"><p style="color:#999;font-size:14px;line-height:20px;margin:8px 0;">You're receiving this email because you signed up for resources from ShareKit.</p><p style="color:#999;font-size:14px;line-height:20px;margin:8px 0;">If you'd like to stop receiving these emails, please contact us.</p></section><p style="color:#999;font-size:12px;text-align:center;margin-top:30px;">Powered by ShareKit</p></div></body></html>`;
}

// Use APP_URL for CORS to restrict origins (defaults to localhost for development)
const allowedOrigin = Deno.env.get("APP_URL") || "http://localhost:5173";

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all scheduled emails that should be sent now
    const { data: scheduledLogs, error: logsError } = await supabaseClient
      .from('email_sent_logs')
      .select(`
        *,
        sequence:email_sequences(*),
        capture:email_captures(*, page:pages(*))
      `)
      .eq('status', 'scheduled')
      .lte('sent_at', new Date().toISOString());

    if (logsError) throw logsError;

    if (!scheduledLogs || scheduledLogs.length === 0) {
      console.log('No scheduled emails to process');
      return new Response(
        JSON.stringify({ message: 'No scheduled emails to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${scheduledLogs.length} scheduled emails`);
    
    let successCount = 0;
    let failureCount = 0;

    // Process each scheduled email
    for (const log of scheduledLogs) {
      const { sequence, capture } = log;
      
      if (!sequence || !capture || !RESEND_API_KEY) {
        console.error(`Missing data for log ${log.id}`);
        await supabaseClient
          .from('email_sent_logs')
          .update({ 
            status: 'failed',
            error_message: 'Missing sequence, capture data, or RESEND_API_KEY'
          })
          .eq('id', log.id);
        failureCount++;
        continue;
      }

      try {
        // Generate HTML without React Email to avoid npm deps
        const html = generateSequenceEmailHtml(
          capture.full_name,
          sequence.subject,
          sequence.body
        );

        // Send email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ShareKit <onboarding@resend.dev>",
            to: [capture.email],
            subject: sequence.subject,
            html,
          }),
        });

        const emailData = await emailResponse.json();

        if (emailResponse.ok) {
          console.log(`Successfully sent email for sequence "${sequence.name}" to ${capture.email}`);
          
          // Update log status to sent
          await supabaseClient
            .from('email_sent_logs')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', log.id);
          
          successCount++;
        } else {
          console.error(`Failed to send email for sequence "${sequence.name}":`, emailData);
          
          // Update log status to failed
          await supabaseClient
            .from('email_sent_logs')
            .update({ 
              status: 'failed',
              error_message: emailData.message || 'Unknown error'
            })
            .eq('id', log.id);
          
          failureCount++;
        }
      } catch (error: any) {
        console.error(`Error sending email for sequence "${sequence.name}":`, error);
        
        // Update log status to failed
        await supabaseClient
          .from('email_sent_logs')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', log.id);
        
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${scheduledLogs.length} emails`,
        success: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
