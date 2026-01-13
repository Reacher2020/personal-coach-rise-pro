-- Add explicit authentication-required policies for all sensitive tables
-- These policies ensure unauthenticated users cannot access any data

-- clients table: Require authentication for all access
CREATE POLICY "Require authentication for clients access"
ON public.clients
FOR ALL
USING (auth.uid() IS NOT NULL);

-- profiles table: Require authentication for all access
CREATE POLICY "Require authentication for profiles access"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- invitations table: Require authentication for all access
CREATE POLICY "Require authentication for invitations access"
ON public.invitations
FOR ALL
USING (auth.uid() IS NOT NULL);

-- payments table: Require authentication for all access
CREATE POLICY "Require authentication for payments access"
ON public.payments
FOR ALL
USING (auth.uid() IS NOT NULL);

-- messages table: Require authentication for all access
CREATE POLICY "Require authentication for messages access"
ON public.messages
FOR ALL
USING (auth.uid() IS NOT NULL);

-- coach_settings table: Require authentication for all access
CREATE POLICY "Require authentication for coach_settings access"
ON public.coach_settings
FOR ALL
USING (auth.uid() IS NOT NULL);

-- training_sessions table: Require authentication for all access
CREATE POLICY "Require authentication for training_sessions access"
ON public.training_sessions
FOR ALL
USING (auth.uid() IS NOT NULL);

-- workout_plans table: Require authentication for all access
CREATE POLICY "Require authentication for workout_plans access"
ON public.workout_plans
FOR ALL
USING (auth.uid() IS NOT NULL);

-- client_workout_plans table: Require authentication for all access
CREATE POLICY "Require authentication for client_workout_plans access"
ON public.client_workout_plans
FOR ALL
USING (auth.uid() IS NOT NULL);

-- user_roles table: Require authentication for all access
CREATE POLICY "Require authentication for user_roles access"
ON public.user_roles
FOR ALL
USING (auth.uid() IS NOT NULL);