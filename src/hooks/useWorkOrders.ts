
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
      console.log('useWorkOrders: Fetching work orders...');
      setLoading(true);
      setError(null);
      
      const data = await getAllWorkOrders();
      console.log('useWorkOrders: Work orders fetched successfully:', data.length);
      setWorkOrders(data || []);
    } catch (err: any) {
      console.error('useWorkOrders: Error fetching work orders:', err);
      const errorMessage = err.message || 'Failed to load work orders';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const updateStatus = async (id: string, status: WorkOrder['status']) => {
    try {
      console.log('useWorkOrders: Updating work order status:', id, status);
      const updatedWorkOrder = await updateWorkOrderStatus(id, status);
      
      if (updatedWorkOrder) {
        // Refresh the list to ensure consistency
        await fetchWorkOrders();
        
        toast({
          title: "Success",
          description: "Work order status updated successfully"
        });
      }
    } catch (err: any) {
      console.error('useWorkOrders: Error updating status:', err);
      toast({
        title: "Error",
        description: "Failed to update work order status",
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
