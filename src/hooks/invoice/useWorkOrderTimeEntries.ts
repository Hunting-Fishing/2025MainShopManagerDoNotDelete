
import { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { TimeEntry } from '@/types/workOrder';

export const useWorkOrderTimeEntries = (workOrder: WorkOrder) => {
  // Initialize with work order time entries if they exist, or empty array
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder.timeEntries || []);
  
  // Calculate total billable hours
  const totalBillableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + (entry.duration / 60), 0); // Convert minutes to hours
  
  // Format for display: "X hours Y minutes"
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  };
  
  // Add a new time entry
  const addTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
  };
  
  // Remove a time entry
  const removeTimeEntry = (entryId: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
  };
  
  // Update an existing time entry
  const updateTimeEntry = (entryId: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    ));
  };

  return {
    timeEntries,
    setTimeEntries,
    totalBillableHours,
    formatDuration,
    addTimeEntry,
    removeTimeEntry,
    updateTimeEntry
  };
};

export default useWorkOrderTimeEntries;
