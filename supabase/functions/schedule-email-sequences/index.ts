import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Schedule emails (in a real implementation, you'd use a job queue)
    // For now, we'll just log that sequences would be sent
    console.log(`Would schedule ${sequences.length} emails for ${emailCapture.email}`);
    
    // Here you would integrate with an email service like Resend, SendGrid, etc.
    // Example placeholder for email sending logic:
    for (const sequence of sequences) {
      const scheduledTime = new Date(emailCapture.captured_at);
      scheduledTime.setHours(scheduledTime.getHours() + sequence.delay_hours);
      
      console.log(`Sequence: ${sequence.name}`);
      console.log(`Subject: ${sequence.subject}`);
      console.log(`Scheduled for: ${scheduledTime.toISOString()}`);
      
      // Log the email send attempt
      await supabaseClient
        .from('email_sent_logs')
        .insert({
          sequence_id: sequence.id,
          email_capture_id: emailCaptureId,
          status: 'scheduled'
        });
    }

    return new Response(
      JSON.stringify({ 
        message: `Scheduled ${sequences.length} emails`,
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