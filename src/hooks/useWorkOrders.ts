
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getAllWorkOrders, updateWorkOrderStatus } from '@/services/workOrder';
import { WorkOrder } from '@/types/workOrder';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    try {
      console.log('Fetching work orders...');
      setError(null);
      
      const data = await getAllWorkOrders();
      console.log('Work orders fetched:', data);
      setWorkOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching work orders:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load work orders",
        variant: "destructive"
      });
      setWorkOrders([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const updateStatus = async (id: string, status: WorkOrder['status']) => {
    try {
      const updatedWorkOrder = await updateWorkOrderStatus(id, status);
      if (updatedWorkOrder) {
        await fetchWorkOrders(); // Refresh the list
        toast({
          title: "Success",
          description: "Work order status updated"
        });
      }
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
    updateWorkOrderStatus: updateStatus
  };
}
