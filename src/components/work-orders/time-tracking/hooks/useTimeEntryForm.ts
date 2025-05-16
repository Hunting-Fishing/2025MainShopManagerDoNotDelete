import { useState, useEffect } from "react";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryFormProps {
  workOrderId: string;
  timeEntry?: TimeEntry;
  onSave: (entry: TimeEntry) => void;
  onCancel: () => void;
}

export const useTimeEntryForm = ({
  workOrderId,
  timeEntry,
  onSave,
  onCancel
}: TimeEntryFormProps) => {
  const [values, setValues] = useState({
    employeeId: timeEntry?.employeeId || '',
    employeeName: timeEntry?.employeeName || '',
    startTime: timeEntry?.startTime || new Date().toISOString(),
    endTime: timeEntry?.endTime || new Date().toISOString(),
    duration: timeEntry?.duration || 0,
    billable: timeEntry?.billable || true,
    notes: timeEntry?.notes || ''
  });
  
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (timeEntry) {
      setValues({
        employeeId: timeEntry.employeeId || '',
        employeeName: timeEntry.employeeName,
        startTime: timeEntry.startTime,
        endTime: timeEntry.endTime || new Date().toISOString(),
        duration: timeEntry.duration,
        billable: timeEntry.billable,
        notes: timeEntry.notes || ''
      });
    }
  }, [timeEntry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = () => {
    // Add validation here
    if (!values.employeeName) {
      setError('Please enter a technician name');
      return;
    }
    
    // Create new time entry
    const newTimeEntry: TimeEntry = {
      id: timeEntry ? timeEntry.id : `te-${Date.now()}`,
      employeeId: values.employeeId || timeEntry?.employeeId || '',
      employeeName: values.employeeName,
      startTime: values.startTime,
      endTime: values.endTime,
      duration: values.duration || 0,
      billable: values.billable,
      notes: values.notes
    };
    
    onSave(newTimeEntry);
  };

  return {
    values,
    error,
    handleChange,
    handleSave,
    onCancel
  };
};
