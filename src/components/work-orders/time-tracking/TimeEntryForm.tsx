
import React from "react";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryFormFields } from "./components/TimeEntryFormFields";
import { TimeEntryFormActions } from "./components/TimeEntryFormActions";
import { useTimeEntryForm } from "./hooks/useTimeEntryForm";

interface TimeEntryFormProps {
  workOrderId: string;
  timeEntry?: TimeEntry | null;
  onSave: (timeEntry: TimeEntry) => void;
  onCancel: () => void;
}

export function TimeEntryForm({ 
  workOrderId, 
  timeEntry, 
  onSave, 
  onCancel 
}: TimeEntryFormProps) {
  const {
    formData,
    errors,
    handleChange,
    calculateDuration,
    handleSubmit,
    handleCancel,
    isEditing
  } = useTimeEntryForm({
    workOrderId,
    timeEntry,
    onSave,
    onCancel
  });

  return (
    <form onSubmit={handleSubmit}>
      <TimeEntryFormFields
        employee={formData.employee_id || ""}
        setEmployee={(value) => handleChange('employee_id', value)}
        startDate={formData.start_date || ""}
        setStartDate={(value) => handleChange('start_date', value)}
        startTime={formData.start_time || ""}
        setStartTime={(value) => handleChange('start_time', value)}
        endDate={formData.end_date || ""}
        setEndDate={(value) => handleChange('end_date', value)}
        endTime={formData.end_time || ""}
        setEndTime={(value) => handleChange('end_time', value)}
        duration={String(formData.duration || "0")}
        setDuration={(value) => handleChange('duration', parseInt(value) || 0)}
        notes={formData.notes || ""}
        setNotes={(value) => handleChange('notes', value)}
        billable={formData.billable || true}
        setBillable={(value) => handleChange('billable', value)}
      />
      
      <TimeEntryFormActions
        isEditing={isEditing}
        onCancel={handleCancel}
      />
    </form>
  );
}
