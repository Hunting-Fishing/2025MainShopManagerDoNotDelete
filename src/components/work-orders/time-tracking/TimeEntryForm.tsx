
import React, { useState } from "react";
import { TimeEntry } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";
import { TimeEntryFormFields } from "./components/TimeEntryFormFields";
import { TimeEntryFormActions } from "./components/TimeEntryFormActions";

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
  const [employee, setEmployee] = useState<string>(timeEntry?.employeeName || "");
  const [startDate, setStartDate] = useState<string>(
    timeEntry?.startTime 
      ? new Date(timeEntry.startTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(
    timeEntry?.startTime 
      ? new Date(timeEntry.startTime).toTimeString().slice(0, 5) 
      : new Date().toTimeString().slice(0, 5)
  );
  const [endDate, setEndDate] = useState<string>(
    timeEntry?.endTime 
      ? new Date(timeEntry.endTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState<string>(
    timeEntry?.endTime 
      ? new Date(timeEntry.endTime).toTimeString().slice(0, 5) 
      : new Date().toTimeString().slice(0, 5)
  );
  const [duration, setDuration] = useState<string>(
    timeEntry?.duration ? (timeEntry.duration / 60).toString() : ""
  );
  const [notes, setNotes] = useState<string>(timeEntry?.notes || "");
  const [billable, setBillable] = useState<boolean>(timeEntry?.billable ?? true);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!employee) {
      alert("Employee name is required");
      return;
    }
    
    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Calculate duration in minutes if not manually entered
    let durationInMinutes = parseFloat(duration) * 60;
    if (!durationInMinutes || isNaN(durationInMinutes)) {
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      durationInMinutes = Math.round(diffMs / (1000 * 60));
    }
    
    if (durationInMinutes <= 0) {
      alert("Duration must be greater than zero");
      return;
    }
    
    const updatedEntry: TimeEntry = {
      id: timeEntry?.id || `TE-${uuidv4().substring(0, 8)}`,
      employeeId: timeEntry?.employeeId || `EMP-${uuidv4().substring(0, 8)}`,
      employeeName: employee,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: durationInMinutes,
      notes: notes,
      billable: billable
    };
    
    onSave(updatedEntry);
  };

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
        isEditing={!!timeEntry}
        onCancel={onCancel}
      />
    </form>
  );
}
