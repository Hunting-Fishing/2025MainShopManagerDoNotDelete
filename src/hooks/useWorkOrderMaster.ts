
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { 
  getWorkOrderById, 
  updateWorkOrder,
  getWorkOrderJobLines,
  updateWorkOrderJobLine,
  deleteWorkOrderJobLine,
  getWorkOrderParts,
  updateWorkOrderPart,
  deleteWorkOrderPart,
  getWorkOrderTimeEntries
} from '@/services/workOrder';
import { getCustomerById } from '@/services/customer';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderMaster(workOrderId?: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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

      // Fetch related data in parallel
      const [jobLinesData, partsData, timeEntriesData] = await Promise.all([
        getWorkOrderJobLines(workOrderId),
        getWorkOrderParts(workOrderId),
        getWorkOrderTimeEntries(workOrderId)
      ]);

      setJobLines(jobLinesData || []);
      setAllParts(partsData || []);
      setTimeEntries(timeEntriesData || []);

      // Fetch customer if available
      if (wo.customer_id) {
        try {
          const customerData = await getCustomerById(wo.customer_id);
          setCustomer(customerData);
        } catch (customerError) {
          console.warn('Failed to fetch customer:', customerError);
        }
      }
    } catch (err: any) {
      console.error('Error fetching work order data:', err);
      setError(err.message || "Failed to load work order data.");
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobLines = useCallback((updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  }, []);

  const updateTimeEntries = useCallback((updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  }, []);

  const handleJobLineUpdate = useCallback(async (updatedJobLine: WorkOrderJobLine) => {
    try {
      await updateWorkOrderJobLine(updatedJobLine.id, updatedJobLine);
      setJobLines(prev => prev.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      ));
      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (err: any) {
      console.error('Error updating job line:', err);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    }
  }, []);

  const handleJobLineDelete = useCallback(async (jobLineId: string) => {
    try {
      await deleteWorkOrderJobLine(jobLineId);
      setJobLines(prev => prev.filter(line => line.id !== jobLineId));
      toast({
        title: "Success",
        description: "Job line deleted successfully"
      });
    } catch (err: any) {
      console.error('Error deleting job line:', err);
      toast({
        title: "Error",
        description: "Failed to delete job line",
        variant: "destructive"
      });
    }
  }, []);

  const handlePartUpdate = useCallback(async (updatedPart: WorkOrderPart) => {
    try {
      await updateWorkOrderPart(updatedPart.id, updatedPart);
      setAllParts(prev => prev.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      ));
      toast({
        title: "Success",
        description: "Part updated successfully"
      });
    } catch (err: any) {
      console.error('Error updating part:', err);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive"
      });
    }
  }, []);

  const handlePartDelete = useCallback(async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      setAllParts(prev => prev.filter(part => part.id !== partId));
      toast({
        title: "Success",
        description: "Part deleted successfully"
      });
    } catch (err: any) {
      console.error('Error deleting part:', err);
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive"
      });
    }
  }, []);

  return {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    updateJobLines,
    updateTimeEntries,
    handleJobLineUpdate,
    handleJobLineDelete,
    handlePartUpdate,
    handlePartDelete,
    refetch: fetchData
  };
}
