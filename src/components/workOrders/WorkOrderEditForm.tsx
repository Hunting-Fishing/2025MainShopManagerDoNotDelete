
import React, { useState } from "react";
import { WorkOrder, WorkOrderInventoryItem } from "@/types/workOrder";
import { EditFormHeader } from "./edit/EditFormHeader";
import { WorkOrderEditFormContent } from "./edit/WorkOrderEditFormContent";
import { useWorkOrderEditForm } from "@/hooks/useWorkOrderEditForm";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderPartsEstimator } from "./parts/WorkOrderPartsEstimator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

// Mock data for technicians - this would eventually be fetched from Supabase
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

interface WorkOrderEditFormProps {
  workOrder: WorkOrder;
}

export default function WorkOrderEditForm({ workOrder }: WorkOrderEditFormProps) {
  const { form, onSubmit, isSubmitting, error, timeEntries, setTimeEntries } = useWorkOrderEditForm(workOrder);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>(
    workOrder.inventoryItems || []
  );

  // Handle updating time entries
  const handleUpdateTimeEntries = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };

  // Handle updating inventory items
  const handleUpdateInventoryItems = (updatedItems: WorkOrderInventoryItem[]) => {
    setInventoryItems(updatedItems);
    form.setValue('inventoryItems', updatedItems);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <EditFormHeader workOrderId={workOrder.id} />

      {/* Form Content */}
      <WorkOrderEditFormContent
        workOrderId={workOrder.id}
        technicians={technicians}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />

      {/* Parts Estimation */}
      <Card>
        <CardHeader className="bg-slate-50 pb-3 border-b">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Estimation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <WorkOrderPartsEstimator 
            initialItems={inventoryItems}
            onItemsChange={handleUpdateInventoryItems}
          />
        </CardContent>
      </Card>

      {/* Time Tracking Section */}
      <TimeTrackingSection 
        workOrderId={workOrder.id}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
      />
    </div>
  );
}
