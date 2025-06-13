
import React, { useState, useEffect } from 'react';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useWorkOrderJobLines } from '@/hooks/useWorkOrderJobLines';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { WorkOrderActivityTab } from './details/WorkOrderActivityTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';

export interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (values: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId, 
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder 
}: WorkOrderDetailsViewProps) {
  const { workOrder, isLoading: workOrderLoading, error: workOrderError } = useWorkOrder(workOrderId);
  const { jobLines, isLoading: jobLinesLoading, updateJobLines } = useWorkOrderJobLines(workOrderId);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);

  // Fetch parts and time entries
  useEffect(() => {
    if (workOrderId && workOrderId !== 'new') {
      const fetchData = async () => {
        try {
          setPartsLoading(true);
          const parts = await getWorkOrderParts(workOrderId);
          setAllParts(parts);
        } catch (error) {
          console.error('Error fetching parts:', error);
          toast.error('Failed to load parts');
        } finally {
          setPartsLoading(false);
        }

        try {
          setTimeEntriesLoading(true);
          const entries = await getWorkOrderTimeEntries(workOrderId);
          setTimeEntries(entries);
        } catch (error) {
          console.error('Error fetching time entries:', error);
          toast.error('Failed to load time entries');
        } finally {
          setTimeEntriesLoading(false);
        }
      };

      fetchData();
    }
  }, [workOrderId]);

  if (workOrderLoading || jobLinesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (workOrderError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading work order: {workOrderError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Work order not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEditMode = false; // For now, always view mode

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parts-labor">Parts & Labor</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkOrderComprehensiveOverview
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
            onJobLinesChange={updateJobLines}
            onTimeEntriesChange={setTimeEntries}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts-labor" className="space-y-6">
          <WorkOrderComprehensiveOverview
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
            onJobLinesChange={updateJobLines}
            onTimeEntriesChange={setTimeEntries}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Documents functionality coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <WorkOrderActivityTab workOrderId={workOrderId} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Communications functionality coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
