
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useWorkOrderPreferences } from '@/hooks/useWorkOrderPreferences';
import { useJobLines } from '@/hooks/useJobLines';
import { WorkOrderEditForm } from './WorkOrderEditForm';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { Button } from '@/components/ui/button';
import { Edit, Eye, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkOrderDetailsView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences, shouldAutoEdit } = useWorkOrderPreferences();
  
  const isEditRoute = location.pathname.includes('/edit');
  const [isEditMode, setIsEditMode] = useState(isEditRoute || shouldAutoEdit());
  const [timeEntries, setTimeEntries] = useState<any[]>([]);

  const { workOrder, isLoading, error } = useWorkOrder(id!);
  const { jobLines, isLoading: jobLinesLoading } = useJobLines(id!);

  useEffect(() => {
    if (isEditRoute) {
      setIsEditMode(true);
    } else if (shouldAutoEdit()) {
      setIsEditMode(true);
    }
  }, [isEditRoute, shouldAutoEdit]);

  const handleEditToggle = () => {
    if (isEditMode) {
      navigate(`/work-orders/${id}`);
      setIsEditMode(false);
    } else {
      navigate(`/work-orders/${id}/edit`);
      setIsEditMode(true);
    }
  };

  const handleUpdateTimeEntries = (updatedEntries: any[]) => {
    setTimeEntries(updatedEntries);
  };

  const handleCancelEdit = () => {
    navigate(`/work-orders/${id}`);
    setIsEditMode(false);
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving work order...');
    navigate(`/work-orders/${id}`);
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <WorkOrderPageLayout 
        title="Loading Work Order..." 
        backLink="/work-orders"
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </WorkOrderPageLayout>
    );
  }

  if (error || !workOrder) {
    return (
      <WorkOrderPageLayout 
        title="Work Order Not Found" 
        backLink="/work-orders"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Order Not Found</h2>
          <p className="text-gray-600 mb-4">The work order you're looking for could not be found.</p>
          <Button asChild>
            <Link to="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Orders
            </Link>
          </Button>
        </div>
      </WorkOrderPageLayout>
    );
  }

  if (isEditMode) {
    return (
      <WorkOrderEditForm
        workOrderId={id!}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        onCancel={handleCancelEdit}
        onSave={handleSave}
      />
    );
  }

  return (
    <WorkOrderPageLayout 
      title={`Work Order #${workOrder.work_order_number || workOrder.id?.slice(-8)}`}
      description={workOrder.description}
      backLink="/work-orders"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleEditToggle}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="default"
            onClick={handleEditToggle}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      }
    >
      <WorkOrderDetailsTabs 
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        inventoryItems={workOrder.inventoryItems || []}
        notes={workOrder.notes || ''}
        onUpdateNotes={() => {}}
        jobLines={jobLines}
        parts={[]}
        onJobLinesChange={() => {}}
        jobLinesLoading={jobLinesLoading}
        isEditMode={false}
      />
    </WorkOrderPageLayout>
  );
}
