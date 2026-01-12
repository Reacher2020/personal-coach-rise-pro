-- Create workout_plans table for coaches
CREATE TABLE public.workout_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    difficulty TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'strength',
    exercises_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own workout plans
CREATE POLICY "Coaches can view their own workout plans"
ON public.workout_plans
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own workout plans"
ON public.workout_plans
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own workout plans"
ON public.workout_plans
FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own workout plans"
ON public.workout_plans
FOR DELETE
USING (auth.uid() = coach_id);

-- Create client_workout_plans table to assign plans to clients
CREATE TABLE public.client_workout_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'active',
    notes TEXT,
    UNIQUE (client_id, workout_plan_id)
);

-- Enable RLS
ALTER TABLE public.client_workout_plans ENABLE ROW LEVEL SECURITY;

-- Coaches can manage workout plan assignments for their clients
CREATE POLICY "Coaches can view their client workout plans"
ON public.client_workout_plans
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can assign workout plans to clients"
ON public.client_workout_plans
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update client workout plans"
ON public.client_workout_plans
FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can remove workout plans from clients"
ON public.client_workout_plans
FOR DELETE
USING (auth.uid() = coach_id);

-- Add triggers for updated_at
CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON public.workout_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();