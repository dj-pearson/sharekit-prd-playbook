-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create email sequences table
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  send_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email sent logs table
CREATE TABLE public.email_sent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  email_capture_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_sequences
CREATE POLICY "Users can manage sequences for their pages"
ON public.email_sequences
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pages
    WHERE pages.id = email_sequences.page_id
    AND pages.user_id = auth.uid()
  )
);

-- RLS Policies for email_sent_logs
CREATE POLICY "Users can view logs for their sequences"
ON public.email_sent_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM email_sequences
    JOIN pages ON pages.id = email_sequences.page_id
    WHERE email_sequences.id = email_sent_logs.sequence_id
    AND pages.user_id = auth.uid()
  )
);

CREATE POLICY "System can create email logs"
ON public.email_sent_logs
FOR INSERT
WITH CHECK (true);

-- Add updated_at trigger for email_sequences
CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();