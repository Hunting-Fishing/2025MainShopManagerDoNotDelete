
import { useState, useCallback, useMemo } from 'react';
import { WorkOrderService } from '@/services/workOrder/WorkOrderService';
import { WorkOrder, WorkOrderFormValues } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';

interface UseWorkOrderServiceResult {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkOrders: () => Promise<void>;
  fetchWorkOrderById: (id: string) => Promise<WorkOrder | null>;
  createWorkOrder: (data: WorkOrderFormValues) => Promise<WorkOrder | null>;
  updateWorkOrder: (id: string, data: Partial<WorkOrderFormValues>) => Promise<WorkOrder | null>;
  updateStatus: (id: string, status: string) => Promise<WorkOrder | null>;
  deleteWorkOrder: (id: string) => Promise<boolean>;
  
  // Computed values
  totalWorkOrders: number;
  pendingWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
}

export function useWorkOrderService(): UseWorkOrderServiceResult {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const service = useMemo(() => new WorkOrderService(), []);

  const handleError = useCallback((error: any, action: string) => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error(`Error ${action}:`, error);
    setError(message);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, []);

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await service.getAllWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      handleError(error, 'fetching work orders');
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const fetchWorkOrderById = useCallback(async (id: string): Promise<WorkOrder | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const workOrder = await service.getWorkOrderById(id);
      return workOrder;
    } catch (error) {
      handleError(error, `fetching work order ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const createWorkOrder = useCallback(async (data: WorkOrderFormValues): Promise<WorkOrder | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newWorkOrder = await service.createWorkOrder(data);
      
      // Update local state
      setWorkOrders(prev => [newWorkOrder, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });
      
      return newWorkOrder;
    } catch (error) {
      handleError(error, 'creating work order');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const updateWorkOrder = useCallback(async (id: string, data: Partial<WorkOrderFormValues>): Promise<WorkOrder | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedWorkOrder = await service.updateWorkOrder(id, data);
      
      // Update local state
      setWorkOrders(prev => 
        prev.map(wo => wo.id === id ? updatedWorkOrder : wo)
      );
      
      toast({
        title: 'Success',
        description: 'Work order updated successfully',
      });
      
      return updatedWorkOrder;
    } catch (error) {
      handleError(error, 'updating work order');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const updateStatus = useCallback(async (id: string, status: string): Promise<WorkOrder | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedWorkOrder = await service.updateWorkOrderStatus(id, status);
      
      // Update local state
      setWorkOrders(prev => 
        prev.map(wo => wo.id === id ? updatedWorkOrder : wo)
      );
      
      toast({
        title: 'Success',
        description: 'Work order status updated successfully',
      });
      
      return updatedWorkOrder;
    } catch (error) {
      handleError(error, 'updating work order status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const deleteWorkOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await service.deleteWorkOrder(id);
      
      // Update local state
      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
      
      toast({
        title: 'Success',
        description: 'Work order deleted successfully',
      });
      
      return true;
    } catch (error) {
      handleError(error, 'deleting work order');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  // Computed values
  const totalWorkOrders = useMemo(() => workOrders.length, [workOrders]);
  
  const pendingWorkOrders = useMemo(() => 
    workOrders.filter(wo => wo.status === 'pending').length, 
    [workOrders]
  );
  
  const inProgressWorkOrders = useMemo(() => 
    workOrders.filter(wo => wo.status === 'in-progress' || wo.status === 'in_progress').length, 
    [workOrders]
  );
  
  const completedWorkOrders = useMemo(() => 
    workOrders.filter(wo => wo.status === 'completed').length, 
    [workOrders]
  );

  return {
    workOrders,
    loading,
    error,
    fetchWorkOrders,
    fetchWorkOrderById,
    createWorkOrder,
    updateWorkOrder,
    updateStatus,
    deleteWorkOrder,
    totalWorkOrders,
    pendingWorkOrders,
    inProgressWorkOrders,
    completedWorkOrders,
  };
}
