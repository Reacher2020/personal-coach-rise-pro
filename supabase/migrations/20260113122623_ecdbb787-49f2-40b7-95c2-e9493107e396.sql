-- 1. Messages: Allow coaches to delete messages they sent
CREATE POLICY "Coaches can delete their own messages"
ON public.messages
FOR DELETE
USING (
  is_from_coach = true
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND c.coach_id = auth.uid()
  )
);

-- 2. Messages: Allow clients to delete messages they sent
CREATE POLICY "Clients can delete their own messages"
ON public.messages
FOR DELETE
USING (
  is_from_coach = false
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);

-- 3. Coach settings: Allow users to delete their own settings
CREATE POLICY "Users can delete their own coach settings"
ON public.coach_settings
FOR DELETE
USING (user_id = auth.uid());

-- 4. Invitations: Allow coaches to update their own invitations
CREATE POLICY "Coaches can update their own invitations"
ON public.invitations
FOR UPDATE
USING (invited_by = auth.uid());

-- 5. Invitations: Allow coaches to delete their own invitations
CREATE POLICY "Coaches can delete their own invitations"
ON public.invitations
FOR DELETE
USING (invited_by = auth.uid());