-- Add attachment columns to messages table
ALTER TABLE public.messages
ADD COLUMN attachment_url text,
ADD COLUMN attachment_name text,
ADD COLUMN attachment_type text;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for message-attachments bucket
-- Coaches can upload attachments
CREATE POLICY "Coaches can upload message attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Clients can upload attachments  
CREATE POLICY "Clients can upload message attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.user_id = auth.uid()
    AND c.user_id::text = (storage.foldername(name))[1]
  )
);

-- Anyone authenticated can view message attachments (public bucket)
CREATE POLICY "Anyone can view message attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'message-attachments');

-- Users can delete their own attachments
CREATE POLICY "Users can delete their own message attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);