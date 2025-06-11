
import React from "react";
import { useWorkOrder } from "@/hooks/useWorkOrder";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { WorkOrderOverviewHeader } from "./details/WorkOrderOverviewHeader";
import { Button } from "@/components/ui/button";
import { Save, X, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkOrderEditFormProps {
  workOrderId: string;
  timeEntries: any[];
  onUpdateTimeEntries: (updatedEntries: any[]) => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export const WorkOrderEditForm: React.FC<WorkOrderEditFormProps> = ({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  onCancel,
  onSave
}) => {
  const { workOrder, isLoading, error } = useWorkOrder(workOrderId);

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
          <p className="text-gray-600 mb-4">Unable to load work order for editing.</p>
          <Button onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Edit Mode Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Work Order</h1>
            <p className="text-muted-foreground">Work Order #{workOrder.work_order_number}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Work Order Overview Header */}
      <WorkOrderOverviewHeader 
        workOrder={workOrder}
        jobLines={workOrder.jobLines || []}
        allParts={[]}
      />

      {/* Work Order Details Tabs in Edit Mode */}
      <WorkOrderDetailsTabs 
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={onUpdateTimeEntries}
        inventoryItems={workOrder.inventoryItems || []}
        notes={workOrder.notes || ''}
        onUpdateNotes={() => {}}
        jobLines={workOrder.jobLines || []}
        parts={[]}
        onJobLinesChange={() => {}}
        jobLinesLoading={false}
        isEditMode={true}
      />
    </div>
  );
};
