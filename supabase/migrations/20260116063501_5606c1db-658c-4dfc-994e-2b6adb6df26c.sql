-- Allow clients to update (mark as read) messages they receive from coach
CREATE POLICY "Clients can update messages they receive"
ON public.messages
FOR UPDATE
USING (
  is_from_coach = true 
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = messages.client_id 
    AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  is_from_coach = true 
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id = messages.client_id 
    AND c.user_id = auth.uid()
  )
);