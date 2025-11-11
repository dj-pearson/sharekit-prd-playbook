-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true);

-- Storage policies for resources bucket
CREATE POLICY "Users can upload their own resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view public resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Users can update their own resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);