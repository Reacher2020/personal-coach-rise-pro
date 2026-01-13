-- Add RLS policies for clients to access their own data

-- 1. Clients can view messages where they are the participant
CREATE POLICY "Clients can view their own messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);

-- 2. Clients can send messages (insert with is_from_coach = false)
CREATE POLICY "Clients can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  is_from_coach = false
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);

-- 3. Clients can view their own training sessions
CREATE POLICY "Clients can view their own training sessions"
ON public.training_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = training_sessions.client_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);

-- 4. Clients can view their assigned workout plan assignments
CREATE POLICY "Clients can view their workout plan assignments"
ON public.client_workout_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_workout_plans.client_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);

-- 5. Clients can view workout plan details for plans assigned to them
CREATE POLICY "Clients can view their assigned workout plans"
ON public.workout_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_workout_plans cwp
    JOIN public.clients c ON c.id = cwp.client_id
    WHERE cwp.workout_plan_id = workout_plans.id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.email = c.email
    )
  )
);