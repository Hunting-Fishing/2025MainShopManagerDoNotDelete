
import React from "react";
import { WorkOrder } from "@/data/workOrdersData";
import { EditFormHeader } from "./edit/EditFormHeader";
import { WorkOrderEditFormContent } from "./edit/WorkOrderEditFormContent";
import { useWorkOrderEditForm } from "@/hooks/useWorkOrderEditForm";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { TimeEntry } from "@/types/workOrder";

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

  // Handle updating time entries
  const handleUpdateTimeEntries = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
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

      {/* Time Tracking Section */}
      <TimeTrackingSection 
        workOrderId={workOrder.id}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
      />
    </div>
  );
}
