
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

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: any;
}

export function WorkOrderDetailsView({ 
  workOrderId, 
  isCreateMode = false, 
  prePopulatedData, 
  onCreateWorkOrder 
}: WorkOrderDetailsViewProps) {
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [jobLines, setJobLines] = useState<any[]>([]);
  const [allParts, setAllParts] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
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

  const handleJobLinesChange = (updatedJobLines: any[]) => {
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
      {/* Comprehensive Overview */}
      <WorkOrderComprehensiveOverview
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
        onJobLinesChange={handleJobLinesChange}
        isEditMode={isEditMode}
      />

      {/* Tabbed Content */}
      <Tabs defaultValue="parts-labor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parts-labor">Parts & Labor</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="parts-labor" className="mt-6">
          <PartsAndLaborTab
            workOrder={workOrder}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <WorkOrderActivityTab workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <WorkOrderCommunications workOrder={workOrder} />
        </TabsContent>
      </Tabs>
    </WorkOrderPageLayout>
  );
}
