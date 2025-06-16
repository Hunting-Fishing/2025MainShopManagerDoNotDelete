
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { WorkOrderNotes } from '../details/WorkOrderNotes';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderFormValues } from '@/types/workOrder';

export interface WorkOrderDetailsTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderDetailsTab({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onJobLinesChange,
  onTimeEntriesChange,
  onWorkOrderUpdate,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabProps) {
  
  const handleFormSubmit = async (values: Partial<WorkOrderFormValues>) => {
    // Convert form values to WorkOrder format with proper type casting
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: values.status as WorkOrder['status'] || workOrder.status,
      description: values.description || workOrder.description,
      notes: values.notes || workOrder.notes,
      // Handle other form fields as needed
    };
    
    onWorkOrderUpdate(updatedWorkOrder);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800', 
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on-hold': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Work Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Work Order Overview</span>
            <Badge className={getStatusColor(workOrder.status)}>
              {workOrder.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
              <p className="text-sm">
                {workOrder.created_at ? new Date(workOrder.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
              <p className="text-sm">{workOrder.description || 'No description'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                <p className="text-sm">
                  {customer.first_name} {customer.last_name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                <p className="text-sm">{customer.email || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
                <p className="text-sm">{customer.phone || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                <p className="text-sm">{customer.address || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services & Parts Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Parts Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Information */}
          {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year) && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Vehicle</h4>
              <p className="text-sm">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                {workOrder.vehicle_license_plate && ` - ${workOrder.vehicle_license_plate}`}
              </p>
            </div>
          )}

          {/* Job Lines Section */}
          <JobLinesSection
            workOrderId={workOrder.id}
            description={workOrder.description}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
            shopId={workOrder.shop_id}
          />

          {/* Parts Section */}
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Notes Section */}
      <WorkOrderNotes workOrderId={workOrder.id} />

      {/* Time Tracking Section */}
      <TimeTrackingSection
        workOrderId={workOrder.id}
        timeEntries={timeEntries}
        onUpdateTimeEntries={onTimeEntriesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}
