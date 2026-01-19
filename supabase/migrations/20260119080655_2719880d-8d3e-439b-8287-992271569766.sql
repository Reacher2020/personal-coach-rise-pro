-- Fix 1: Add proper RLS policy for session_reminders (coaches can view their session reminders)
CREATE POLICY "Coaches can view reminders for their sessions"
ON public.session_reminders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM training_sessions ts
    WHERE ts.id = session_reminders.session_id
    AND ts.coach_id = auth.uid()
  )
);

-- Add base authentication requirement for session_reminders
CREATE POLICY "Require authentication for session_reminders access"
ON public.session_reminders
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 2: Make message-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'message-attachments';

-- Drop the overly permissive policy for message-attachments
DROP POLICY IF EXISTS "Anyone can view message attachments" ON storage.objects;

-- Create restrictive SELECT policy for message-attachments (owner or their coach can view)
CREATE POLICY "Authenticated users can view their message attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Owner can view their own uploads
    auth.uid()::text = (storage.foldername(name))[1]
    OR 
    -- Coach can view their clients' attachments
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.coach_id = auth.uid()
      AND c.user_id::text = (storage.foldername(name))[1]
    )
    OR
    -- Client can view their coach's attachments sent to them
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.user_id = auth.uid()
      AND c.coach_id::text = (storage.foldername(name))[1]
    )
  )
);