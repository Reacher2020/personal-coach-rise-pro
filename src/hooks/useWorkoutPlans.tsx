import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WorkoutPlan {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  difficulty: string | null;
  category: string | null;
  exercises_count: number | null;
  created_at: string;
  updated_at: string;
  assigned_clients_count?: number;
}

export interface WorkoutPlanInsert {
  name: string;
  description?: string | null;
  duration_minutes?: number | null;
  difficulty?: string | null;
  category?: string | null;
  exercises_count?: number | null;
}

export interface ClientWorkoutPlan {
  id: string;
  client_id: string;
  workout_plan_id: string;
  coach_id: string;
  assigned_at: string;
  status: string | null;
  notes: string | null;
}

export const useWorkoutPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkoutPlans = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch workout plans
      const { data: plansData, error: plansError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      // Fetch assignment counts
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('client_workout_plans')
        .select('workout_plan_id')
        .eq('coach_id', user.id);

      if (assignmentsError) throw assignmentsError;

      // Count assignments per plan
      const assignmentCounts = (assignmentsData || []).reduce((acc, assignment) => {
        acc[assignment.workout_plan_id] = (acc[assignment.workout_plan_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Merge plans with assignment counts
      const plansWithCounts = (plansData || []).map(plan => ({
        ...plan,
        assigned_clients_count: assignmentCounts[plan.id] || 0,
      }));

      setWorkoutPlans(plansWithCounts);
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać planów treningowych',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  const addWorkoutPlan = async (plan: WorkoutPlanInsert) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          ...plan,
          coach_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkoutPlans((prev) => [{ ...data, assigned_clients_count: 0 }, ...prev]);
      toast({
        title: 'Plan dodany',
        description: `${plan.name} został utworzony`,
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateWorkoutPlan = async (id: string, updates: Partial<WorkoutPlanInsert>) => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkoutPlans((prev) =>
        prev.map((plan) => (plan.id === id ? { ...plan, ...data } : plan))
      );
      toast({
        title: 'Plan zaktualizowany',
        description: 'Zmiany zostały zapisane',
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteWorkoutPlan = async (id: string) => {
    try {
      const { error } = await supabase.from('workout_plans').delete().eq('id', id);

      if (error) throw error;

      setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== id));
      toast({
        title: 'Plan usunięty',
        description: 'Plan treningowy został usunięty',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const assignPlanToClient = async (clientId: string, workoutPlanId: string, notes?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('client_workout_plans')
        .insert({
          client_id: clientId,
          workout_plan_id: workoutPlanId,
          coach_id: user.id,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setWorkoutPlans((prev) =>
        prev.map((plan) =>
          plan.id === workoutPlanId
            ? { ...plan, assigned_clients_count: (plan.assigned_clients_count || 0) + 1 }
            : plan
        )
      );

      toast({
        title: 'Plan przypisany',
        description: 'Plan treningowy został przypisany do klienta',
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const removePlanFromClient = async (clientId: string, workoutPlanId: string) => {
    try {
      const { error } = await supabase
        .from('client_workout_plans')
        .delete()
        .eq('client_id', clientId)
        .eq('workout_plan_id', workoutPlanId);

      if (error) throw error;

      // Update local state
      setWorkoutPlans((prev) =>
        prev.map((plan) =>
          plan.id === workoutPlanId
            ? { ...plan, assigned_clients_count: Math.max(0, (plan.assigned_clients_count || 0) - 1) }
            : plan
        )
      );

      toast({
        title: 'Plan usunięty',
        description: 'Plan treningowy został usunięty z klienta',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const getClientPlans = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_workout_plans')
        .select(`
          *,
          workout_plans (*)
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const getStats = () => {
    const totalPlans = workoutPlans.length;
    const totalAssignments = workoutPlans.reduce(
      (acc, plan) => acc + (plan.assigned_clients_count || 0),
      0
    );
    const totalExercises = workoutPlans.reduce(
      (acc, plan) => acc + (plan.exercises_count || 0),
      0
    );
    return { totalPlans, totalAssignments, totalExercises };
  };

  return {
    workoutPlans,
    loading,
    fetchWorkoutPlans,
    addWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    assignPlanToClient,
    removePlanFromClient,
    getClientPlans,
    getStats,
  };
};
