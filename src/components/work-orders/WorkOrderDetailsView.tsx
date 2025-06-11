
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { workOrder, isLoading, error } = useWorkOrder(id!);
  const { shouldAutoEdit } = useWorkOrderPreferences();
  
  // Check if we're on the edit route
  const isEditRoute = location.pathname.includes('/edit');
  const [isEditing, setIsEditing] = useState(isEditRoute);

  useEffect(() => {
    // If we're on the edit route, start in edit mode
    if (isEditRoute) {
      setIsEditing(true);
      return;
    }

    // Auto-edit logic based on user preferences and work order status
    if (workOrder && shouldAutoEdit()) {
      // Don't auto-edit if work order is completed or cancelled
      const nonEditableStatuses = ['completed', 'cancelled'];
      if (!nonEditableStatuses.includes(workOrder.status)) {
        setIsEditing(true);
      }
    }
  }, [workOrder, shouldAutoEdit, isEditRoute]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // If currently editing, go back to view mode
      setIsEditing(false);
      // Update URL to remove /edit if present
      if (isEditRoute) {
        navigate(`/work-orders/${id}`);
      }
    } else {
      // If currently viewing, go to edit mode
      setIsEditing(true);
      // Update URL to include /edit
      navigate(`/work-orders/${id}/edit`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    navigate(`/work-orders/${id}`);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    navigate(`/work-orders/${id}`);
  };

  if (isEditing) {
    return (
      <WorkOrderEditForm 
        workOrderId={workOrder.id}
        timeEntries={workOrder.timeEntries || []}
        onUpdateTimeEntries={() => {}}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
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
          onClick={handleEditToggle}
          className="mb-4"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Work Order
        </Button>
      </div>

      {/* Work Order Header with Real Data */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
            </h1>
            <p className="text-lg text-gray-600 mt-1">{workOrder.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
              {workOrder.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
            <p className="text-lg font-semibold">{workOrder.customer_name || 'Unknown Customer'}</p>
            <p className="text-sm text-gray-600">{workOrder.customer_city}, {workOrder.customer_state}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Vehicle</h3>
            <p className="text-lg font-semibold">
              {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
            </p>
            <p className="text-sm text-gray-600">VIN: {workOrder.vehicle_vin}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
            <p className="text-lg font-semibold">
              {new Date(workOrder.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(workOrder.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <WorkOrderDetailsTabs 
        workOrder={workOrder}
        timeEntries={workOrder.timeEntries || []}
        onUpdateTimeEntries={() => {}}
        inventoryItems={workOrder.inventoryItems || []}
        notes={workOrder.notes || workOrder.description || ''}
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
