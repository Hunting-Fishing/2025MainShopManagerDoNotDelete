
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
    employee,
    setEmployee,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    duration,
    setDuration,
    notes,
    setNotes,
    billable,
    setBillable,
    handleSubmit,
    isEditing,
    onCancel: handleCancel
  } = useTimeEntryForm({
    workOrderId,
    timeEntry,
    onSave,
    onCancel
  });

  return (
    <form onSubmit={handleSubmit}>
      <TimeEntryFormFields
        employee={employee}
        setEmployee={setEmployee}
        startDate={startDate}
        setStartDate={setStartDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endDate={endDate}
        setEndDate={setEndDate}
        endTime={endTime}
        setEndTime={setEndTime}
        duration={duration}
        setDuration={setDuration}
        notes={notes}
        setNotes={setNotes}
        billable={billable}
        setBillable={setBillable}
      />
      
      <TimeEntryFormActions
        isEditing={isEditing}
        onCancel={handleCancel}
      />
    </form>
  );
}
