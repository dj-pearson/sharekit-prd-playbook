import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Removed React Email dependencies; using inline HTML generator
function generateSequenceEmailHtml(fullName: string | null, subject: string, bodyContent: string) {
  const greeting = fullName ? `Hi ${fullName}!` : 'Hi there!';
  const bodyHtml = (bodyContent || '').replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html><head><meta charSet="utf-8"><title>${subject}</title></head><body style="background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#ffffff;padding:20px 0 48px; margin-bottom:64px;"><h1 style="color:#667eea;font-size:32px;font-weight:bold;margin:40px 0;text-align:center;">ShareKit</h1><h2 style="color:#333;font-size:24px;font-weight:bold;margin:30px 20px 20px;">${greeting}</h2><section style="color:#333;font-size:16px;line-height:24px;margin:16px 20px;">${bodyHtml}</section><section style="border-top:1px solid #e5e5e5;margin:32px 20px 0;padding-top:20px;"><p style="color:#999;font-size:14px;line-height:20px;margin:8px 0;">You're receiving this email because you signed up for resources from ShareKit.</p><p style="color:#999;font-size:14px;line-height:20px;margin:8px 0;">If you'd like to stop receiving these emails, please contact us.</p></section><p style="color:#999;font-size:12px;text-align:center;margin-top:30px;">Powered by ShareKit</p></div></body></html>`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { emailCaptureId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get email capture details
    const { data: emailCapture, error: captureError } = await supabaseClient
      .from('email_captures')
      .select('*, pages(*)')
      .eq('id', emailCaptureId)
      .single();

    if (captureError) throw captureError;

    // Get active sequences for this page, ordered by send_order
    const { data: sequences, error: sequencesError } = await supabaseClient
      .from('email_sequences')
      .select('*')
      .eq('page_id', emailCapture.page_id)
      .eq('is_active', true)
      .order('send_order', { ascending: true });

    if (sequencesError) throw sequencesError;

    if (!sequences || sequences.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active sequences found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scheduling ${sequences.length} emails for ${emailCapture.email}`);
    
    // Send or schedule emails for each sequence
    for (const sequence of sequences) {
      const scheduledTime = new Date(emailCapture.captured_at);
      scheduledTime.setHours(scheduledTime.getHours() + sequence.delay_hours);
      
      console.log(`Sequence: ${sequence.name}, Subject: ${sequence.subject}, Scheduled: ${scheduledTime.toISOString()}`);
      
      // If delay is 0 hours, send immediately
      if (sequence.delay_hours === 0 && RESEND_API_KEY) {
        try {
            // Generate HTML without React Email to avoid npm deps
            const html = generateSequenceEmailHtml(
              emailCapture.full_name,
              sequence.subject,
              sequence.body
            );

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "ShareKit <onboarding@resend.dev>",
              to: [emailCapture.email],
              subject: sequence.subject,
              html,
            }),
          });

          const emailData = await emailResponse.json();
          
          if (emailResponse.ok) {
            console.log(`Sent sequence "${sequence.name}" immediately:`, emailData);
            
            // Log successful send
            await supabaseClient
              .from('email_sent_logs')
              .insert({
                sequence_id: sequence.id,
                email_capture_id: emailCaptureId,
                status: 'sent'
              });
          } else {
            console.error(`Failed to send sequence "${sequence.name}":`, emailData);
            
            // Log failed send
            await supabaseClient
              .from('email_sent_logs')
              .insert({
                sequence_id: sequence.id,
                email_capture_id: emailCaptureId,
                status: 'failed'
              });
          }
        } catch (emailError) {
          console.error(`Error sending sequence "${sequence.name}":`, emailError);
          
          // Log error
          await supabaseClient
            .from('email_sent_logs')
            .insert({
              sequence_id: sequence.id,
              email_capture_id: emailCaptureId,
              status: 'failed'
            });
        }
      } else {
        // Log as scheduled for future sending
        await supabaseClient
          .from('email_sent_logs')
          .insert({
            sequence_id: sequence.id,
            email_capture_id: emailCaptureId,
            status: 'scheduled'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${sequences.length} email sequences`,
        sequences: sequences.map(s => ({ 
          name: s.name, 
          delay_hours: s.delay_hours 
        }))
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
