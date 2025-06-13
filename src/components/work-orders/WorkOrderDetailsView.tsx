
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderTimeTrackingService';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { TimeTrackingSection } from './time-tracking/TimeTrackingSection';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId: propWorkOrderId }: WorkOrderDetailsViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrderId = propWorkOrderId || id;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (workOrderId) {
      fetchAllData();
    }
  }, [workOrderId]);

  const fetchAllData = async () => {
    if (!workOrderId) return;

    try {
      console.log('Fetching comprehensive work order data for:', workOrderId);
      setLoading(true);
      setError(null);

      // Fetch all data concurrently
      const [workOrderData, jobLinesData, partsData, timeEntriesData] = await Promise.all([
        getWorkOrderById(workOrderId),
        getWorkOrderJobLines(workOrderId).catch(err => {
          console.warn('Failed to fetch job lines:', err);
          return [];
        }),
        getWorkOrderParts(workOrderId).catch(err => {
          console.warn('Failed to fetch parts:', err);
          return [];
        }),
        getWorkOrderTimeEntries(workOrderId).catch(err => {
          console.warn('Failed to fetch time entries:', err);
          return [];
        })
      ]);

      if (workOrderData) {
        console.log('Work order data loaded:', workOrderData);
        console.log('Job lines loaded:', jobLinesData.length);
        console.log('Parts loaded:', partsData.length);
        console.log('Time entries loaded:', timeEntriesData.length);

        setWorkOrder(workOrderData);
        setJobLines(jobLinesData);
        setParts(partsData);
        setTimeEntries(timeEntriesData);
      } else {
        setError('Work order not found');
      }
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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    console.log('Invoice created:', invoiceId);
    // Refresh work order data to get updated invoice status
    fetchAllData();
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WorkOrderDetailsHeader
        workOrder={workOrder}
        onEdit={handleEdit}
        onInvoiceCreated={handleInvoiceCreated}
        isEditMode={isEditMode}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="parts" className="text-sm">Parts & Inventory</TabsTrigger>
            <TabsTrigger value="time" className="text-sm">Time Tracking</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
            <TabsTrigger value="communications" className="text-sm">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WorkOrderComprehensiveOverview
              workOrder={workOrder}
              jobLines={jobLines}
              parts={parts}
              timeEntries={timeEntries}
              onJobLinesChange={handleJobLinesChange}
              isEditMode={isEditMode}
            />
          </TabsContent>

          <TabsContent value="parts">
            <WorkOrderPartsSection
              workOrderId={workOrder.id}
              isEditMode={isEditMode}
            />
          </TabsContent>

          <TabsContent value="time">
            <TimeTrackingSection
              workOrderId={workOrder.id}
              timeEntries={timeEntries}
              onUpdateTimeEntries={handleTimeEntriesUpdate}
              isEditMode={isEditMode}
            />
          </TabsContent>

          <TabsContent value="documents">
            <WorkOrderDocuments workOrderId={workOrder.id} />
          </TabsContent>

          <TabsContent value="communications">
            <WorkOrderCommunications workOrder={workOrder} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
