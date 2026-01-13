-- 1. Add user_id column to clients table
ALTER TABLE public.clients 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Update existing clients to link user_id based on email from profiles
UPDATE public.clients c
SET user_id = p.user_id
FROM public.profiles p
WHERE LOWER(c.email) = LOWER(p.email);

-- 3. Create index for efficient lookups
CREATE INDEX idx_clients_user_id ON public.clients(user_id);

-- 4. Drop old email-based policies for messages (client access)
DROP POLICY IF EXISTS "Clients can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Clients can send messages" ON public.messages;
DROP POLICY IF EXISTS "Clients can delete their own messages" ON public.messages;

-- 5. Create new user_id-based policies for messages
CREATE POLICY "Clients can view their own messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  is_from_coach = false
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can delete their own messages"
ON public.messages
FOR DELETE
USING (
  is_from_coach = false
  AND EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = messages.client_id
    AND c.user_id = auth.uid()
  )
);

-- 6. Drop old email-based policies for training_sessions (client access)
DROP POLICY IF EXISTS "Clients can view their own training sessions" ON public.training_sessions;

-- 7. Create new user_id-based policy for training_sessions
CREATE POLICY "Clients can view their own training sessions"
ON public.training_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = training_sessions.client_id
    AND c.user_id = auth.uid()
  )
);

-- 8. Drop old email-based policies for client_workout_plans (client access)
DROP POLICY IF EXISTS "Clients can view their workout plan assignments" ON public.client_workout_plans;

-- 9. Create new user_id-based policy for client_workout_plans
CREATE POLICY "Clients can view their workout plan assignments"
ON public.client_workout_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = client_workout_plans.client_id
    AND c.user_id = auth.uid()
  )
);

-- 10. Drop old email-based policies for workout_plans (client access)
DROP POLICY IF EXISTS "Clients can view their assigned workout plans" ON public.workout_plans;

-- 11. Create new user_id-based policy for workout_plans
CREATE POLICY "Clients can view their assigned workout plans"
ON public.workout_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_workout_plans cwp
    JOIN public.clients c ON c.id = cwp.client_id
    WHERE cwp.workout_plan_id = workout_plans.id
    AND c.user_id = auth.uid()
  )
);