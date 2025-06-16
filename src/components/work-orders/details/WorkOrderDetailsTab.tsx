
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { WorkOrderInformation } from './WorkOrderInformation';
import { WorkOrderCustomerVehicleInfo } from './WorkOrderCustomerVehicleInfo';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderNotes } from './WorkOrderNotes';
import { updateWorkOrder } from '@/services/workOrder';
import { toast } from '@/hooks/use-toast';

interface WorkOrderDetailsTabProps {
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
  const handleSaveWorkOrder = async (updates: Partial<WorkOrder>) => {
    try {
      const updatedWorkOrder = await updateWorkOrder(workOrder.id, {
        ...workOrder,
        ...updates,
        status: updates.status as any // Cast to handle string vs enum type
      });
      onWorkOrderUpdate(updatedWorkOrder);
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
    } catch (error) {
      console.error('Error updating work order:', error);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    await handleSaveWorkOrder({ notes });
  };

  return (
    <div className="space-y-6">
      {/* Edit Mode Controls */}
      <div className="flex justify-end space-x-2">
        {!isEditMode ? (
          <Button onClick={onStartEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <>
            <Button onClick={onCancelEdit} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onSaveEdit} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </>
        )}
      </div>

      {/* Work Order Information */}
      <WorkOrderInformation 
        workOrder={workOrder}
        onUpdate={handleSaveWorkOrder}
        isEditMode={isEditMode}
      />

      {/* Customer and Vehicle Information */}
      <WorkOrderCustomerVehicleInfo 
        workOrder={workOrder}
        customer={customer}
        onUpdate={handleSaveWorkOrder}
        isEditMode={isEditMode}
      />

      {/* Job Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Labor</CardTitle>
        </CardHeader>
        <CardContent>
          <JobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Parts */}
      <WorkOrderPartsSection 
        workOrderId={workOrder.id}
        isEditMode={isEditMode}
      />

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderNotes 
            workOrderId={workOrder.id}
            notes={workOrder.notes || ''}
            onUpdateNotes={handleNotesUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
