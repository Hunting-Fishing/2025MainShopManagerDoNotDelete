
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface WorkOrder {
  id: string;
  customer_id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
}

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setWorkOrders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load work orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkOrderStatus = async (id: string, status: WorkOrder['status']) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      await fetchWorkOrders();
      toast({
        title: "Success",
        description: "Work order status updated"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    }
  };

  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders,
    updateWorkOrderStatus
  };
}
