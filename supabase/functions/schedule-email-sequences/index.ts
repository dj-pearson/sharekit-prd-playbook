import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
              html: sequence.body.replace(/\n/g, '<br>'),
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
