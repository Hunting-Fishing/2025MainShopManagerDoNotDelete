import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GunsmithTeamMember {
  id: string;
  shop_id: string;
  profile_id: string;
  role_id: string | null;
  is_active: boolean;
  hire_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
  role?: {
    id: string;
    name: string;
    role_type: string | null;
  };
}

export function useGunsmithTeam() {
  return useQuery({
    queryKey: ['gunsmith-team'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_team_members')
        .select(`
          *,
          profile:profiles(id, first_name, last_name, email, phone),
          role:gunsmith_roles(id, name, role_type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GunsmithTeamMember[];
    },
  });
}

export function useAddGunsmithTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (member: {
      profile_id: string;
      role_id: string;
      hire_date?: string;
      notes?: string;
    }) => {
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .limit(1)
        .single();
      
      const { error } = await (supabase as any)
        .from('gunsmith_team_members')
        .insert({
          ...member,
          shop_id: shop?.id,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-team'] });
      toast.success('Team member added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });
}

export function useUpdateGunsmithTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GunsmithTeamMember> & { id: string }) => {
      const { error } = await (supabase as any)
        .from('gunsmith_team_members')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-team'] });
      toast.success('Team member updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update team member: ${error.message}`);
    },
  });
}

export function useRemoveGunsmithTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('gunsmith_team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-team'] });
      toast.success('Team member removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });
}
