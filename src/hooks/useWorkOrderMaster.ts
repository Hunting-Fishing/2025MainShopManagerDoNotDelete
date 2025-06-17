
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { workOrderCoreService } from '@/services/workOrder/core/workOrderCoreService';
import { workOrderJobLinesService } from '@/services/workOrder/core/workOrderJobLinesService';
import { workOrderPartsService } from '@/services/workOrder/core/workOrderPartsService';
import { workOrderTimeService } from '@/services/workOrder/core/workOrderTimeService';
import { getCustomerById } from '@/services/customer';

/**
 * Master hook that consolidates all work order related functionality
 */
export function useWorkOrderMaster(workOrderId?: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data for a work order
  const fetchWorkOrderData = useCallback(async (id: string) => {
    if (!id || id === 'new') return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch core work order data
      const workOrderData = await workOrderCoreService.getById(id);
      if (!workOrderData) {
        setError('Work order not found');
        return;
      }
      setWorkOrder(workOrderData);

      // Fetch related data in parallel
      const [jobLinesData, partsData, timeEntriesData] = await Promise.all([
        workOrderJobLinesService.getByWorkOrderId(id),
        workOrderPartsService.getByWorkOrderId(id),
        workOrderTimeService.getByWorkOrderId(id)
      ]);

      setJobLines(jobLinesData);
      setAllParts(partsData);
      setTimeEntries(timeEntriesData);

      // Fetch customer data if available
      if (workOrderData.customer_id) {
        try {
          const customerData = await getCustomerById(workOrderData.customer_id);
          setCustomer(customerData);
        } catch (customerError) {
          console.warn('Could not fetch customer data:', customerError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load work order data');
      console.error('Error fetching work order data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load work order data when ID changes
  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderData(workOrderId);
    }
  }, [workOrderId, fetchWorkOrderData]);

  // Update handlers with optimistic updates
  const updateWorkOrder = useCallback(async (updates: Partial<WorkOrder>) => {
    if (!workOrder) return;

    const originalWorkOrder = workOrder;
    setWorkOrder({ ...workOrder, ...updates });

    try {
      const updatedWorkOrder = await workOrderCoreService.update(workOrder.id, updates);
      setWorkOrder(updatedWorkOrder);
    } catch (error) {
      setWorkOrder(originalWorkOrder);
      throw error;
    }
  }, [workOrder]);

  const updateJobLines = useCallback((updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  }, []);

  const updateParts = useCallback((updatedParts: WorkOrderPart[]) => {
    setAllParts(updatedParts);
  }, []);

  const updateTimeEntries = useCallback((updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  }, []);

  // CRUD operations for job lines
  const handleJobLineUpdate = useCallback(async (updatedJobLine: WorkOrderJobLine) => {
    try {
      const result = await workOrderJobLinesService.update(updatedJobLine.id, updatedJobLine);
      setJobLines(prev => prev.map(line => line.id === result.id ? result : line));
    } catch (error) {
      console.error('Error updating job line:', error);
      throw error;
    }
  }, []);

  const handleJobLineDelete = useCallback(async (jobLineId: string) => {
    try {
      await workOrderJobLinesService.delete(jobLineId);
      setJobLines(prev => prev.filter(line => line.id !== jobLineId));
      // Also remove associated parts
      setAllParts(prev => prev.filter(part => part.job_line_id !== jobLineId));
    } catch (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }
  }, []);

  // CRUD operations for parts
  const handlePartUpdate = useCallback(async (updatedPart: WorkOrderPart) => {
    try {
      const result = await workOrderPartsService.update(updatedPart.id, updatedPart);
      setAllParts(prev => prev.map(part => part.id === result.id ? result : part));
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  }, []);

  const handlePartDelete = useCallback(async (partId: string) => {
    try {
      await workOrderPartsService.delete(partId);
      setAllParts(prev => prev.filter(part => part.id !== partId));
    } catch (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  }, []);

  return {
    // Data
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    
    // Update functions
    updateWorkOrder,
    updateJobLines,
    updateParts,
    updateTimeEntries,
    
    // CRUD handlers
    handleJobLineUpdate,
    handleJobLineDelete,
    handlePartUpdate,
    handlePartDelete,
    
    // Utilities
    refetch: () => workOrderId ? fetchWorkOrderData(workOrderId) : Promise.resolve()
  };
}
