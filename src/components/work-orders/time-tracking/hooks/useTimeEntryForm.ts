
import { useState } from "react";
import { TimeEntry } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";
import { validateTimeEntry } from "../utils/timeEntryValidation";

interface UseTimeEntryFormProps {
  workOrderId: string;
  timeEntry?: TimeEntry | null;
  onSave: (timeEntry: TimeEntry) => void;
  onCancel: () => void;
}

export function useTimeEntryForm({
  workOrderId,
  timeEntry,
  onSave,
  onCancel
}: UseTimeEntryFormProps) {
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
    
    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Calculate duration in minutes if not manually entered
    let durationInMinutes = parseFloat(duration) * 60;
    if (!durationInMinutes || isNaN(durationInMinutes)) {
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      durationInMinutes = Math.round(diffMs / (1000 * 60));
    }
    
    // Run validation
    const validationResult = validateTimeEntry({
      employee,
      startDateTime,
      endDateTime,
      durationInMinutes
    });

    if (!validationResult.valid) {
      alert(validationResult.message);
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

  return {
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
    isEditing: !!timeEntry,
    onCancel
  };
}
