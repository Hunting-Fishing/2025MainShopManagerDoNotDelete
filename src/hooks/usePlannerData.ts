import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlannerBoardItem, PlannerBoardColumn, PlannerSwimlane, PlannerPreferences } from '@/types/planner';
import { toast } from 'sonner';

export function usePlannerColumns(boardId: string = 'default') {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['planner-columns', boardId, profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('planner_board_columns')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .eq('board_id', boardId)
        .eq('is_active', true)
        .order('column_order');
      
      if (error) throw error;
      return data as PlannerBoardColumn[];
    },
    enabled: !!profile?.shop_id,
  });
}

export function usePlannerItems(boardType?: string, columnId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['planner-items', boardType, columnId, profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      let query = supabase
        .from('planner_board_items')
        .select('*')
        .eq('shop_id', profile.shop_id);
      
      if (boardType) {
        query = query.eq('board_type', boardType);
      }
      
      if (columnId) {
        query = query.eq('column_id', columnId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PlannerBoardItem[];
    },
    enabled: !!profile?.shop_id,
  });
}

export function usePlannerSwimlanes(boardId: string = 'default') {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['planner-swimlanes', boardId, profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('planner_swimlanes')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .eq('board_id', boardId)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as PlannerSwimlane[];
    },
    enabled: !!profile?.shop_id,
  });
}

export function useWorkOrdersForPlanner() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['work-orders-planner', profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          description,
          status,
          priority,
          start_time,
          end_time,
          estimated_hours,
          customer_id,
          assigned_technician
        `)
        .eq('shop_id', profile.shop_id)
        .not('status', 'eq', 'completed')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(wo => ({
        ...wo,
        title: wo.description || 'Untitled',
      }));
    },
    enabled: !!profile?.shop_id,
  });
}

export function useStaffForPlanner() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['staff-planner', profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, job_title')
        .eq('shop_id', profile.shop_id)
        .eq('is_active', true)
        .order('first_name');
      
      if (error) throw error;
      return (data || []).map(s => ({ ...s, avatar_url: null }));
    },
    enabled: !!profile?.shop_id,
  });
}

export function useEquipmentForPlanner() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['equipment-planner', profile?.shop_id],
    queryFn: async () => {
      if (!profile?.shop_id) return [];
      
      const { data, error } = await supabase
        .from('equipment_assets')
        .select('id, name, equipment_type, status, unit_number')
        .eq('shop_id', profile.shop_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.shop_id,
  });
}

export function usePlannerMutations() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  const createItem = useMutation({
    mutationFn: async (item: Partial<PlannerBoardItem>) => {
      if (!profile?.shop_id) throw new Error('No shop ID');
      
      const { data, error } = await supabase
        .from('planner_board_items')
        .insert({
          ...item,
          shop_id: profile.shop_id,
          created_by: profile.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-items'] });
      toast.success('Item created');
    },
    onError: (error) => {
      toast.error('Failed to create item');
      console.error(error);
    },
  });
  
  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlannerBoardItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('planner_board_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-items'] });
    },
    onError: (error) => {
      toast.error('Failed to update item');
      console.error(error);
    },
  });
  
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planner_board_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-items'] });
      toast.success('Item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete item');
      console.error(error);
    },
  });
  
  const moveItem = useMutation({
    mutationFn: async ({ id, column_id, row_id }: { id: string; column_id?: string; row_id?: string }) => {
      const { data, error } = await supabase
        .from('planner_board_items')
        .update({ column_id, row_id })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-items'] });
    },
  });
  
  return {
    createItem,
    updateItem,
    deleteItem,
    moveItem,
  };
}
