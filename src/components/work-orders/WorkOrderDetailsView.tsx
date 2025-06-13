
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { WorkOrderTabs } from './WorkOrderTabs';

export interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (workOrderData: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId: propWorkOrderId,
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { id: paramWorkOrderId } = useParams<{ id: string }>();
  const workOrderId = propWorkOrderId || paramWorkOrderId;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workOrderId || workOrderId === 'new' || isCreateMode) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch work order
        const workOrderData = await getWorkOrderById(workOrderId);
        if (!workOrderData) {
          setError('Work order not found');
          return;
        }
        setWorkOrder(workOrderData);

        // Fetch job lines
        try {
          const jobLinesData = await getWorkOrderJobLines(workOrderId);
          setJobLines(jobLinesData || []);
        } catch (jobLinesError) {
          console.error('Error fetching job lines:', jobLinesError);
          setJobLines([]);
        }

        // Fetch parts
        try {
          const partsData = await getWorkOrderParts(workOrderId);
          setAllParts(partsData || []);
        } catch (partsError) {
          console.error('Error fetching parts:', partsError);
          setAllParts([]);
        }

        // Fetch time entries
        try {
          const timeEntriesData = await getWorkOrderTimeEntries(workOrderId);
          setTimeEntries(timeEntriesData || []);
        } catch (timeError) {
          console.error('Error fetching time entries:', timeError);
          setTimeEntries([]);
        }

      } catch (err) {
        console.error('Error fetching work order data:', err);
        setError(typeof err === 'string' ? err : 'Failed to load work order details');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [workOrderId, isCreateMode]);

  const handleUpdateTimeEntries = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };

  if (isCreateMode) {
    // Handle create mode - could return a create form component
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create New Work Order</h1>
          <p className="text-muted-foreground">Create mode functionality would go here</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Comprehensive Overview */}
      <WorkOrderComprehensiveOverview
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
      />

      {/* Detailed Tabs */}
      <WorkOrderTabs
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        isEditMode={false}
      />
    </div>
  );
}
