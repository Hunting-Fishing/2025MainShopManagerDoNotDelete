
import { useState, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderService } from '@/services/workOrder/WorkOrderService';

export interface UseWorkOrderServiceResult {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  getWorkOrder: (id: string) => Promise<WorkOrder>;
  updateWorkOrder: (id: string, data: any) => Promise<WorkOrder>;
  updateStatus: (id: string, status: string) => Promise<WorkOrder>;
  deleteWorkOrder: (id: string) => Promise<void>;
  fetchWorkOrders: () => Promise<void>;
}

export function useWorkOrderService(): UseWorkOrderServiceResult {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const service = new WorkOrderService();

  const getWorkOrder = useCallback(async (id: string): Promise<WorkOrder> => {
    try {
      setError(null);
      const workOrder = await service.getWorkOrderById(id);
      return workOrder;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch work order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service]);

  const updateWorkOrder = useCallback(async (id: string, data: any): Promise<WorkOrder> => {
    try {
      setError(null);
      const updatedWorkOrder = await service.updateWorkOrder(id, data);
      return updatedWorkOrder;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update work order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service]);

  const updateStatus = useCallback(async (id: string, status: string): Promise<WorkOrder> => {
    try {
      setError(null);
      const updatedWorkOrder = await service.updateWorkOrderStatus(id, status);
      return updatedWorkOrder;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update work order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service]);

  const deleteWorkOrder = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await service.deleteWorkOrder(id);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete work order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service]);

  const fetchWorkOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const orders = await service.getAllWorkOrders();
      setWorkOrders(orders);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch work orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    workOrders,
    loading,
    error,
    getWorkOrder,
    updateWorkOrder,
    updateStatus,
    deleteWorkOrder,
    fetchWorkOrders,
  };
}
