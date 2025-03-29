
import React from "react";
import { WorkOrder } from "@/data/workOrdersData";
import { EditFormHeader } from "./edit/EditFormHeader";
import { WorkOrderEditFormContent } from "./edit/WorkOrderEditFormContent";
import { useWorkOrderEditForm } from "@/hooks/useWorkOrderEditForm";

// Mock data for technicians
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
  const { form, onSubmit, isSubmitting, error } = useWorkOrderEditForm(workOrder);

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
    </div>
  );
}
