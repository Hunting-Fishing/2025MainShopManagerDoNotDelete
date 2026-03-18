import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FitnessCategory {
  id: string;
  name: string;
  display_order: number;
  icon: string | null;
  color: string | null;
  description: string | null;
}

export interface FitnessSubcategory {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
}

export interface FitnessGoal {
  id: string;
  name: string;
  display_order: number;
  icon: string | null;
}

export interface ClientFitnessProfile {
  id: string;
  client_id: string;
  shop_id: string;
  primary_interests: string[];
  specific_interests: string[];
  goal_tags: string[];
  experience_level: string;
  training_environment: string[];
  equipment_access: string[];
  injuries_limitations: string | null;
  motivation_style: string | null;
  preferred_session_length: string | null;
  training_frequency: string | null;
  interest_intensity: Record<string, number>;
  interest_experience_levels: Record<string, string>;
  commitment_level: string | null;
  intake_completed: boolean;
  intake_completed_at: string | null;
}

export const useFitnessCategories = () => {
  return useQuery({
    queryKey: ['pt-fitness-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pt_fitness_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return (data || []) as FitnessCategory[];
    },
  });
};

export const useFitnessSubcategories = (categoryIds?: string[]) => {
  return useQuery({
    queryKey: ['pt-fitness-subcategories', categoryIds],
    queryFn: async () => {
      let query = (supabase as any)
        .from('pt_fitness_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (categoryIds && categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FitnessSubcategory[];
    },
    enabled: !categoryIds || categoryIds.length > 0,
  });
};

export const useFitnessGoals = () => {
  return useQuery({
    queryKey: ['pt-fitness-goals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pt_fitness_goals')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return (data || []) as FitnessGoal[];
    },
  });
};

export const useClientFitnessProfile = (clientId?: string, shopId?: string) => {
  return useQuery({
    queryKey: ['pt-client-fitness-profile', clientId, shopId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pt_client_fitness_profiles')
        .select('*')
        .eq('client_id', clientId)
        .eq('shop_id', shopId)
        .maybeSingle();
      if (error) throw error;
      return data as ClientFitnessProfile | null;
    },
    enabled: !!clientId && !!shopId,
  });
};

export const useSaveFitnessProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<ClientFitnessProfile> & { client_id: string; shop_id: string }) => {
      const payload = {
        ...profile,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await (supabase as any)
        .from('pt_client_fitness_profiles')
        .select('id')
        .eq('client_id', profile.client_id)
        .eq('shop_id', profile.shop_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await (supabase as any)
          .from('pt_client_fitness_profiles')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from('pt_client_fitness_profiles')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pt-client-fitness-profile', variables.client_id, variables.shop_id] });
    },
  });
};
