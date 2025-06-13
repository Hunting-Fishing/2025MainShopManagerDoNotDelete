import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, X } from 'lucide-react';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { PartsAndLaborTab } from './details/PartsAndLaborTab';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderActivityTab } from './details/WorkOrderActivityTab';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';

export interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    title?: string;
    description?: string;
    priority?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
  onCreateWorkOrder?: (values: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId, 
  isCreateMode = false, 
  prePopulatedData, 
  onCreateWorkOrder 
}: WorkOrderDetailsViewProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchWorkOrderData = async () => {
      if (!workOrderId || workOrderId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch work order details
        const workOrderData = await getWorkOrderById(workOrderId);
        if (!workOrderData) {
          throw new Error('Work order not found');
        }
        setWorkOrder(workOrderData);

        // Fetch job lines
        const jobLinesData = await getWorkOrderJobLines(workOrderId);
        setJobLines(jobLinesData || []);

        // Fetch parts
        const partsData = await getWorkOrderParts(workOrderId);
        setAllParts(partsData || []);

        // Fetch time entries
        const timeEntriesData = await getWorkOrderTimeEntries(workOrderId);
        setTimeEntries(timeEntriesData || []);

      } catch (err) {
        console.error('Error fetching work order data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderData();
  }, [workOrderId]);

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  if (loading) {
    return (
      <WorkOrderPageLayout
        title="Loading Work Order..."
        backLink="/work-orders"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading work order details...</p>
          </div>
        </div>
      </WorkOrderPageLayout>
    );
  }

  if (error) {
    return (
      <WorkOrderPageLayout
        title="Error Loading Work Order"
        backLink="/work-orders"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </WorkOrderPageLayout>
    );
  }

  if (!workOrder) {
    return (
      <WorkOrderPageLayout
        title="Work Order Not Found"
        backLink="/work-orders"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>The requested work order could not be found.</AlertDescription>
        </Alert>
      </WorkOrderPageLayout>
    );
  }

  const pageTitle = workOrder.work_order_number 
    ? `Work Order #${workOrder.work_order_number}` 
    : `Work Order ${workOrder.id.substring(0, 8)}`;

  return (
    <WorkOrderPageLayout
      title={pageTitle}
      description={workOrder.description || 'Work Order Details'}
      backLink="/work-orders"
      actions={
        <Button
          variant={isEditMode ? "destructive" : "outline"}
          onClick={toggleEditMode}
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parts-labor">Parts & Labor</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkOrderComprehensiveOverview
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
            onJobLinesChange={handleJobLinesChange}
            onTimeEntriesChange={setTimeEntries}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts-labor">
          <PartsAndLaborTab
            workOrder={workOrder}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="activity">
          <WorkOrderActivityTab workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="communications">
          <WorkOrderCommunications workOrder={workOrder} />
        </TabsContent>
      </Tabs>
    </WorkOrderPageLayout>
  );
}
