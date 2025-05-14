
import React, { useState } from "react";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { EditFormHeader } from "./edit/EditFormHeader";
import { WorkOrderEditFormContent } from "./edit/WorkOrderEditFormContent";
import { useWorkOrderEditForm } from "@/hooks/useWorkOrderEditForm";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { useTechnicians } from "@/hooks/useTechnicians";

interface WorkOrderEditFormProps {
  workOrder: WorkOrder;
}

export default function WorkOrderEditForm({ workOrder }: WorkOrderEditFormProps) {
  const { form, onSubmit, isSubmitting, formError, timeEntries, setTimeEntries } = useWorkOrderEditForm(workOrder);
  const { technicians, isLoading: loadingTechnicians } = useTechnicians();

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
        error={formError}
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
