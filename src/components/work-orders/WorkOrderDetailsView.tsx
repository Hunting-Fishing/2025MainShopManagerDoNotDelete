
import React, { useState, useEffect } from 'react';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useWorkOrderJobLines } from '@/hooks/useWorkOrderJobLines';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { PartsAndLaborTab } from './details/PartsAndLaborTab';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { TimeTrackingSection } from './time-tracking/TimeTrackingSection';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { WorkOrderActivityTab } from './details/WorkOrderActivityTab';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const { workOrder, isLoading: workOrderLoading, error } = useWorkOrder(workOrderId);
  const { jobLines, isLoading: jobLinesLoading, updateJobLines } = useWorkOrderJobLines(workOrderId);
  
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);

  // Fetch parts and time entries
  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;

      try {
        // Fetch parts
        setPartsLoading(true);
        const parts = await getWorkOrderParts(workOrderId);
        setAllParts(parts);

        // Fetch time entries
        setTimeLoading(true);
        const entries = await getWorkOrderTimeEntries(workOrderId);
        setTimeEntries(entries);
      } catch (error) {
        console.error('Error fetching work order data:', error);
      } finally {
        setPartsLoading(false);
        setTimeLoading(false);
      }
    };

    fetchData();
  }, [workOrderId]);

  const isLoading = workOrderLoading || jobLinesLoading || partsLoading || timeLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading work order details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Work Order</h2>
            <p className="text-muted-foreground">
              {error?.message || 'Work order not found or could not be loaded.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateTimeEntries = (newEntries: TimeEntry[]) => {
    setTimeEntries(newEntries);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="labour">Labour</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkOrderComprehensiveOverview
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
          />
        </TabsContent>

        <TabsContent value="labour">
          <PartsAndLaborTab
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            onJobLinesChange={updateJobLines}
            isEditMode={false}
          />
        </TabsContent>

        <TabsContent value="parts">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={false}
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={handleUpdateTimeEntries}
            isEditMode={false}
          />
        </TabsContent>

        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="communications">
          <WorkOrderCommunications workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="activity">
          <WorkOrderActivityTab workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
