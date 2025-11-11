import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { SequenceEmail } from './_templates/sequence-email.tsx';

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
        // Render email template using React Email
        const html = await renderAsync(
          React.createElement(SequenceEmail, {
            fullName: capture.full_name,
            subject: sequence.subject,
            bodyContent: sequence.body.replace(/\n/g, '<br>'),
          })
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
