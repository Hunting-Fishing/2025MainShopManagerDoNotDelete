
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { 
  getWorkOrderById,
  getWorkOrderJobLines,
  getWorkOrderParts,
  getWorkOrderTimeEntries,
  updateWorkOrderJobLine,
  updateWorkOrderPart,
  deleteWorkOrderJobLine,
  deleteWorkOrderPart,
  getJobLineParts
} from '@/services/workOrder/workOrderUnifiedService';
import { getCustomerById } from '@/services/customer';

export function useWorkOrderUnified(workOrderId: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all work order data
  const fetchWorkOrderData = useCallback(async () => {
    if (!workOrderId || workOrderId === 'new') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch work order
      const wo = await getWorkOrderById(workOrderId);
      if (!wo) {
        setError("Work Order not found.");
        return;
      }
      setWorkOrder(wo);

      // Fetch job lines with parts
      const lines = await getWorkOrderJobLines(workOrderId);
      const linesWithParts = await Promise.all(
        lines.map(async (jobLine) => {
          try {
            const parts = await getJobLineParts(jobLine.id);
            return { ...jobLine, parts };
          } catch (partError) {
            console.warn(`Failed to fetch parts for job line ${jobLine.id}:`, partError);
            return { ...jobLine, parts: [] };
          }
        })
      );
      setJobLines(linesWithParts);

      // Fetch all parts
      const parts = await getWorkOrderParts(workOrderId);
      setAllParts(parts);

      // Fetch time entries
      const entries = await getWorkOrderTimeEntries(workOrderId);
      setTimeEntries(entries);

      // Fetch customer if available
      if (wo.customer_id) {
        try {
          const cust = await getCustomerById(wo.customer_id);
          setCustomer(cust);
        } catch (custError) {
          console.warn('Failed to fetch customer:', custError);
        }
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to load Work Order details.");
      console.error('Error fetching work order data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    fetchWorkOrderData();
  }, [fetchWorkOrderData]);

  // Update functions
  const updateJobLines = useCallback((updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  }, []);

  const updateParts = useCallback((updatedParts: WorkOrderPart[]) => {
    setAllParts(updatedParts);
  }, []);

  const updateTimeEntries = useCallback((updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  }, []);

  // Job line operations
  const handleJobLineUpdate = useCallback(async (updatedJobLine: WorkOrderJobLine) => {
    try {
      await updateWorkOrderJobLine(updatedJobLine.id, updatedJobLine);
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      setJobLines(updatedJobLines);
    } catch (error) {
      console.error('Error updating job line:', error);
      throw error;
    }
  }, [jobLines]);

  const handleJobLineDelete = useCallback(async (jobLineId: string) => {
    try {
      await deleteWorkOrderJobLine(jobLineId);
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      setJobLines(updatedJobLines);
    } catch (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }
  }, [jobLines]);

  // Part operations
  const handlePartUpdate = useCallback(async (updatedPart: WorkOrderPart) => {
    try {
      await updateWorkOrderPart(updatedPart.id, updatedPart);
      const updatedParts = allParts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      );
      setAllParts(updatedParts);
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  }, [allParts]);

  const handlePartDelete = useCallback(async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      const updatedParts = allParts.filter(part => part.id !== partId);
      setAllParts(updatedParts);
    } catch (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  }, [allParts]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchWorkOrderData();
  }, [fetchWorkOrderData]);

  return {
    // Data
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    
    // State
    isLoading,
    error,
    
    // Update functions
    updateJobLines,
    updateParts,
    updateTimeEntries,
    
    // Operations
    handleJobLineUpdate,
    handleJobLineDelete,
    handlePartUpdate,
    handlePartDelete,
    
    // Utility
    refreshData
  };
}
