
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getAllWorkOrders, updateWorkOrderStatus } from '@/services/workOrder';
import { WorkOrder } from '@/types/workOrder';

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
      
      // Only fetch from database - no mock data
      const data = await getAllWorkOrders();
      setWorkOrders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load work orders",
        variant: "destructive"
      });
      // Set empty array on error, no fallback to mock data
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

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
