
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { getWorkOrderById } from '@/services/workOrder';
import { getCustomerById } from '@/services/customer';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

export function useWorkOrderData(workOrderId: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!workOrderId || workOrderId === 'new') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wo = await getWorkOrderById(workOrderId);
      if (!wo) {
        setError("Work Order not found.");
        return;
      }
      setWorkOrder(wo);

      const lines = await getWorkOrderJobLines(workOrderId);
      setJobLines(lines);

      const parts = await getWorkOrderParts(workOrderId);
      setAllParts(parts);

      if (wo.customer_id) {
        const cust = await getCustomerById(wo.customer_id);
        setCustomer(cust);
      }
      
      setTimeEntries([]);
    } catch (err: any) {
      setError(err.message || "Failed to load Work Order details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workOrderId]);

  const refreshData = async () => {
    console.log('Refreshing work order data...');
    await fetchData();
  };

  const updateJobLines = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const updateParts = (updatedParts: WorkOrderPart[]) => {
    setAllParts(updatedParts);
  };

  const updateTimeEntries = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };

  return {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    updateJobLines,
    updateParts,
    updateTimeEntries,
    refreshData
  };
}
