
import React from "react";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { TimeEntry } from "@/types/workOrder";

interface WorkOrderEditFormProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
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
  return (
    <div className="space-y-8">
      <TimeTrackingSection
        workOrderId={workOrderId}
        timeEntries={timeEntries}
        onUpdateTimeEntries={onUpdateTimeEntries}
      />
    </div>
  );
};
