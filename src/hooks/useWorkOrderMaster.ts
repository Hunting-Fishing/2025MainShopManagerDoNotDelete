
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { 
  workOrderCoreService, 
  workOrderJobLinesService, 
  workOrderPartsService, 
  workOrderTimeService 
} from '@/services/workOrder';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderMaster(workOrderId?: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrderData = useCallback(async () => {
    if (!workOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('useWorkOrderMaster: Fetching work order data for:', workOrderId);

      // Fetch all data concurrently
      const [woData, jobLinesData, partsData, timeData] = await Promise.all([
        workOrderCoreService.getById(workOrderId),
        workOrderJobLinesService.getByWorkOrderId(workOrderId),
        workOrderPartsService.getByWorkOrderId(workOrderId),
        workOrderTimeService.getByWorkOrderId(workOrderId)
      ]);

      if (!woData) {
        throw new Error('Work order not found');
      }

      setWorkOrder(woData);
      setJobLines(jobLinesData);
      setAllParts(partsData);
      setTimeEntries(timeData);
      
      // Extract customer data from work order
      if (woData.customer) {
        setCustomer(woData.customer);
      }

      console.log('useWorkOrderMaster: Data loaded successfully');
    } catch (err: any) {
      console.error('useWorkOrderMaster: Error loading data:', err);
      setError(err.message || 'Failed to load work order data');
      
      toast({
        title: "Error",
        description: "Failed to load work order data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    fetchWorkOrderData();
  }, [fetchWorkOrderData]);

  const updateJobLines = useCallback((newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
  }, []);

  const updateTimeEntries = useCallback((newTimeEntries: TimeEntry[]) => {
    setTimeEntries(newTimeEntries);
  }, []);

  const handleJobLineUpdate = useCallback(async (jobLine: WorkOrderJobLine) => {
    try {
      const updatedJobLine = await workOrderJobLinesService.update(jobLine.id, jobLine);
      setJobLines(prev => prev.map(jl => jl.id === jobLine.id ? updatedJobLine : jl));
      
      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    }
  }, []);

  const handleJobLineDelete = useCallback(async (jobLineId: string) => {
    try {
      await workOrderJobLinesService.delete(jobLineId);
      setJobLines(prev => prev.filter(jl => jl.id !== jobLineId));
      
      toast({
        title: "Success",
        description: "Job line deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast({
        title: "Error",
        description: "Failed to delete job line",
        variant: "destructive"
      });
    }
  }, []);

  const handlePartUpdate = useCallback(async (part: WorkOrderPart) => {
    try {
      const updatedPart = await workOrderPartsService.update(part.id, part);
      setAllParts(prev => prev.map(p => p.id === part.id ? updatedPart : p));
      
      toast({
        title: "Success",
        description: "Part updated successfully"
      });
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive"
      });
    }
  }, []);

  const handlePartDelete = useCallback(async (partId: string) => {
    try {
      await workOrderPartsService.delete(partId);
      setAllParts(prev => prev.filter(p => p.id !== partId));
      
      toast({
        title: "Success",
        description: "Part deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting part:', error);
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
    refetch: fetchWorkOrderData,
    updateJobLines,
    updateTimeEntries,
    handleJobLineUpdate,
    handleJobLineDelete,
    handlePartUpdate,
    handlePartDelete
  };
}
