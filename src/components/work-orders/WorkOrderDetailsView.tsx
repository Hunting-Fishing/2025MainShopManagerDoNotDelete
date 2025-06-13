import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, FileText, MessageSquare, Activity, Wrench, DollarSign } from 'lucide-react';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { PartsAndLaborTab } from './details/PartsAndLaborTab';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { TimeTrackingSection } from './time-tracking/TimeTrackingSection';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { WorkOrderActivityTab } from './details/WorkOrderActivityTab';
import { WorkOrderCustomerVehicleInfo } from './details/WorkOrderCustomerVehicleInfo';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: Partial<WorkOrder>;
  onCreateWorkOrder?: (workOrder: WorkOrder) => void;
}

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange: Dispatch<SetStateAction<WorkOrderJobLine[]>>;
  isEditMode: boolean;
}

export function WorkOrderDetailsView({ 
  workOrderId, 
  isCreateMode = false, 
  prePopulatedData, 
  onCreateWorkOrder 
}) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isEditMode, setIsEditMode] = useState(isCreateMode);

  // Fetch work order data
  const { data: workOrder, isLoading, error } = useQuery({
    queryKey: ['workOrder', workOrderId],
    queryFn: () => getWorkOrderById(workOrderId),
    enabled: !isCreateMode && workOrderId !== 'new'
  });

  // Fetch related data
  useEffect(() => {
    const fetchData = async () => {
      if (!isCreateMode && workOrderId && workOrderId !== 'new') {
        try {
          const [jobLinesData, partsData, timeEntriesData] = await Promise.all([
            getWorkOrderJobLines(workOrderId),
            getWorkOrderParts(workOrderId),
            getWorkOrderTimeEntries(workOrderId)
          ]);
          setJobLines(jobLinesData);
          setAllParts(partsData);
          setTimeEntries(timeEntriesData);
        } catch (error) {
          console.error('Error fetching work order data:', error);
        }
      }
    };
    fetchData();
  }, [workOrderId, isCreateMode]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || (!workOrder && !isCreateMode)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-destructive">Error Loading Work Order</h2>
              <p className="text-muted-foreground mt-2">
                {error ? 'Failed to load work order data' : 'Work order not found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For create mode, use a default work order structure
  const displayWorkOrder = workOrder || {
    id: 'new',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...prePopulatedData
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const handleTimeEntriesUpdate = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {!isCreateMode && (
        <WorkOrderCustomerVehicleInfo workOrder={displayWorkOrder} />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="parts-labor" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Labour
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkOrderComprehensiveOverview
            workOrder={displayWorkOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
            onJobLinesChange={handleJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts-labor">
          <PartsAndLaborTab
            workOrder={displayWorkOrder}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={displayWorkOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={handleTimeEntriesUpdate}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={displayWorkOrder.id} />
        </TabsContent>

        <TabsContent value="communications">
          <WorkOrderCommunications workOrderId={displayWorkOrder.id} />
        </TabsContent>

        <TabsContent value="activity">
          <WorkOrderActivityTab workOrderId={displayWorkOrder.id} />
        </TabsContent>

        <TabsContent value="financial">
          <div className="text-center py-8 text-muted-foreground">
            Financial information coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
