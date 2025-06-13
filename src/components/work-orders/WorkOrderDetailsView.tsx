
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/timeTrackingService';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { TimeTrackingSection } from './time-tracking/TimeTrackingSection';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { WorkOrderActivityTab } from './details/WorkOrderActivityTab';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const finalWorkOrderId = workOrderId || routeId;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (finalWorkOrderId) {
      fetchAllWorkOrderData(finalWorkOrderId);
    }
  }, [finalWorkOrderId]);

  const fetchAllWorkOrderData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all work order data for:', id);

      // Fetch all data in parallel
      const [workOrderData, jobLinesData, partsData, timeEntriesData] = await Promise.all([
        getWorkOrderById(id),
        getWorkOrderJobLines(id),
        getWorkOrderParts(id),
        getWorkOrderTimeEntries(id)
      ]);

      console.log('Fetched work order data:', {
        workOrder: workOrderData,
        jobLines: jobLinesData?.length || 0,
        parts: partsData?.length || 0,
        timeEntries: timeEntriesData?.length || 0
      });

      setWorkOrder(workOrderData);
      setJobLines(jobLinesData || []);
      setAllParts(partsData || []);
      setTimeEntries(timeEntriesData || []);
    } catch (err) {
      console.error('Error fetching work order data:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const handleTimeEntriesUpdate = (updatedTimeEntries: TimeEntry[]) => {
    setTimeEntries(updatedTimeEntries);
  };

  if (!finalWorkOrderId) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No work order ID provided</AlertDescription>
        </Alert>
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
          <AlertDescription>{error || 'Work order not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkOrderComprehensiveOverview
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
          />
        </TabsContent>

        <TabsContent value="parts">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={true}
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={handleTimeEntriesUpdate}
            isEditMode={true}
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
