
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export function useWorkOrdersByCustomer(customerId: string) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setWorkOrders([]);
      setLoading(false);
      return;
    }

    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        console.log('Fetching work orders for customer:', customerId);
        
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching work orders:', error);
          setError(error.message);
        } else {
          console.log('Work orders fetched:', data?.length || 0);
          setWorkOrders(data || []);
        }
      } catch (err) {
        console.error('Exception fetching work orders:', err);
        setError('Failed to fetch work orders');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [customerId]);

  return { workOrders, loading, error };
}
