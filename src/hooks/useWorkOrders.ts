
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';
import { mapFromDbWorkOrder } from '@/utils/supabaseMappers';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedWorkOrders = data.map((order) => mapFromDbWorkOrder(order));
      setWorkOrders(mappedWorkOrders);
    } catch (err) {
      console.error('Error fetching work orders:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkOrderById = async (id: string): Promise<WorkOrder | undefined> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return undefined;

      return mapFromDbWorkOrder(data);
    } catch (err) {
      console.error(`Error fetching work order ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workOrders,
    isLoading,
    error,
    fetchWorkOrders,
    getWorkOrderById
  };
}
