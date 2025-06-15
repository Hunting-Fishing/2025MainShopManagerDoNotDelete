import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { Customer } from '@/types/customer';
import { getCustomerById } from '@/services/customer/customerQueryService';

// Updated props interface
interface WorkOrderDetailsViewProps {
  isCreateMode?: boolean;
  prePopulatedData?: Record<string, any>; // For creation, pre-populate certain values
  onCreateWorkOrder?: (values: any) => Promise<void>;
}

export function WorkOrderDetailsView({
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { id: workOrderId } = useParams<{ id: string }>();

  // If in create mode, do not load an existing work order
  const shouldLoadData = !isCreateMode && !!workOrderId && workOrderId !== 'new';

  const { workOrder, isLoading: isWorkOrderLoading, error: workOrderError } = useWorkOrder(shouldLoadData ? workOrderId! : '');
  const { jobLines, setJobLines, isLoading: isJobLinesLoading, error: jobLinesError } = useJobLines(shouldLoadData ? workOrderId! : '');
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);

  // --- ADDED: Customer state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // --- Fetch parts logic unchanged
  useEffect(() => {
    if (shouldLoadData) {
      const fetchParts = async () => {
        try {
          setPartsLoading(true);
          const parts = await getWorkOrderParts(workOrderId!);
          setAllParts(parts);
        } catch (error) {
          console.error('Error fetching work order parts:', error);
          setAllParts([]);
        } finally {
          setPartsLoading(false);
        }
      };

      fetchParts();
    }
  }, [shouldLoadData, workOrderId]);

  // --- NEW: Fetch customer info when workOrder.customer_id is present
  useEffect(() => {
    if (!shouldLoadData || !workOrder?.customer_id) {
      setCustomer(null);
      setCustomerError(null);
      setCustomerLoading(false);
      return;
    }
    let cancelled = false;
    setCustomerLoading(true);
    setCustomerError(null);
    getCustomerById(workOrder.customer_id)
      .then((data) => {
        if (!cancelled) {
          setCustomer(data || null);
          if (!data) setCustomerError('No customer found for this work order.');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCustomer(null);
          setCustomerError('Failed to load customer information.');
          console.error('Error loading customer info:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setCustomerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldLoadData, workOrder?.customer_id]);

  const handleJobLinesChange = (newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
  };

  const handleTimeEntriesChange = (newTimeEntries: TimeEntry[]) => {
    setTimeEntries(newTimeEntries);
  };

  // Create Mode UI (render a creation form or workflow)
  if (isCreateMode) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Work Order</h1>
          {/* Replace below with actual form implementation as needed */}
          {/* Example: <WorkOrderCreateForm prePopulatedData={prePopulatedData} onSubmit={onCreateWorkOrder} /> */}
          <p className="text-muted-foreground">Work order creation coming soon.</p>
        </div>
      </div>
    );
  }

  if (!workOrderId || isWorkOrderLoading || isJobLinesLoading || partsLoading || customerLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Work Order...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the details.</p>
        </div>
      </div>
    );
  }

  if (workOrderError || jobLinesError || customerError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            {workOrderError?.message || jobLinesError?.message || customerError || 'Failed to load work order details.'}
          </p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Work Order Not Found</h1>
          <p className="text-muted-foreground">The requested work order does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pass customer as prop */}
      <WorkOrderDetailsHeader workOrder={workOrder} customer={customer} />
      <WorkOrderComprehensiveOverview
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
        onJobLinesChange={handleJobLinesChange}
        onTimeEntriesChange={handleTimeEntriesChange}
        isEditMode={isEditMode}
        customer={customer}
      />
    </div>
  );
}
