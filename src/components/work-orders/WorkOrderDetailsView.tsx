
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useWorkOrderPreferences } from '@/hooks/useWorkOrderPreferences';
import { WorkOrderEditForm } from './WorkOrderEditForm';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderOverviewHeader } from './details/WorkOrderOverviewHeader';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkOrderDetailsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workOrder, isLoading, error } = useWorkOrder(id!);
  const { shouldAutoEdit } = useWorkOrderPreferences();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Auto-edit logic based on user preferences and work order status
    if (workOrder && shouldAutoEdit()) {
      // Don't auto-edit if work order is completed or cancelled
      const nonEditableStatuses = ['completed', 'cancelled'];
      if (!nonEditableStatuses.includes(workOrder.status)) {
        setIsEditing(true);
      }
    }
  }, [workOrder, shouldAutoEdit]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Order Not Found</h2>
          <p className="text-gray-600 mb-4">The work order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <WorkOrderEditForm 
        workOrderId={workOrder.id}
        timeEntries={workOrder.timeEntries || []}
        onUpdateTimeEntries={() => {}}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/work-orders')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Work Orders
        </Button>
        
        <Button
          onClick={() => setIsEditing(true)}
          className="mb-4"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Work Order
        </Button>
      </div>

      <WorkOrderOverviewHeader 
        workOrder={workOrder}
        jobLines={workOrder.jobLines || []}
        allParts={[]}
      />
      <WorkOrderDetailsTabs 
        workOrder={workOrder}
        timeEntries={workOrder.timeEntries || []}
        onUpdateTimeEntries={() => {}}
        inventoryItems={workOrder.inventoryItems || []}
        notes={workOrder.notes || ''}
        onUpdateNotes={() => {}}
        jobLines={workOrder.jobLines || []}
        parts={[]}
        onJobLinesChange={() => {}}
        jobLinesLoading={false}
        isEditMode={false}
      />
    </div>
  );
}
