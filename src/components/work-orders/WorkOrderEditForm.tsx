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
  const { 
    workOrder: editWorkOrder, 
    updateField, 
    handleSubmit, 
    loading, 
    saving: isSubmitting, 
    error: formError 
  } = useWorkOrderEditForm(workOrder.id);
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder.timeEntries || []);
  const { technicians, isLoading: loadingTechnicians } = useTechnicians();

  // Handle updating time entries
  const handleUpdateTimeEntries = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };
  
  const onSubmit = async (data: any) => {
    await handleSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <EditFormHeader workOrderId={workOrder.id} />

      {/* Form Content */}
      <WorkOrderEditFormContent
        workOrderId={workOrder.id}
        technicians={technicians}
        form={{ handleSubmit: onSubmit }}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={formError}
      />

      {/* Time Tracking Section */}
      <TimeTrackingSection 
        workOrder_id={workOrder.id}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
      />
    </div>
  );
}
