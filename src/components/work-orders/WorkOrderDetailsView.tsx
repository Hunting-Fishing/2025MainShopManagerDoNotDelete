
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkOrderErrorBoundary } from './WorkOrderErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderStatsCards } from './details/WorkOrderStatsCards';
import { useWorkOrderEditMode } from '@/hooks/useWorkOrderEditMode';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

function WorkOrderDetailsContent({ workOrderId }: { workOrderId: string }) {
  const navigate = useNavigate();
  
  const {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    refreshData
  } = useWorkOrderData(workOrderId);

  const { isEditMode, isReadOnly } = useWorkOrderEditMode(workOrder);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const currentStatus = workOrder?.status || 'draft';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading work order: {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Work order not found. It may have been deleted or you may not have permission to view it.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      // Status update logic would go here
      console.log('Updating status to:', newStatus);
      await refreshData();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleWorkOrderUpdate = async () => {
    await refreshData();
  };

  const handlePartsChange = async () => {
    await refreshData();
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/work-orders')}
          className="hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Work Orders
        </Button>
      </div>

      {/* Header */}
      <WorkOrderDetailsHeader
        workOrder={workOrder}
        customer={customer}
        currentStatus={currentStatus}
        isUpdatingStatus={isUpdatingStatus}
        onStatusChange={handleStatusChange}
        isEditMode={isEditMode}
      />

      {/* Statistics Cards */}
      <WorkOrderStatsCards
        workOrder={workOrder}
        jobLines={jobLines}
        parts={allParts}
        timeEntries={timeEntries}
      />

      {/* Tabs */}
      <WorkOrderDetailsTabs
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
        customer={customer}
        onWorkOrderUpdate={handleWorkOrderUpdate}
        onPartsChange={handlePartsChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export function WorkOrderDetailsView({ workOrderId: propWorkOrderId }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const workOrderId = propWorkOrderId || id;

  if (!workOrderId) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No work order ID provided.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => navigate('/work-orders')}>
                  Back to Work Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <WorkOrderErrorBoundary>
      <WorkOrderDetailsContent workOrderId={workOrderId} />
    </WorkOrderErrorBoundary>
  );
}
