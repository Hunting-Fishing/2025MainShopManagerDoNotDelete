
import { useState } from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { InvoiceItem } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Add time entries to invoice items
  const addTimeEntriesToInvoiceItems = (workOrder: WorkOrder, existingItems: InvoiceItem[]): InvoiceItem[] => {
    if (!workOrder.timeEntries || workOrder.timeEntries.length === 0) {
      return existingItems;
    }
    
    const newItems = [...existingItems];
    
    // Group billable entries by employee
    const employeeEntries = workOrder.timeEntries
      .filter(entry => entry.billable)
      .reduce((acc, entry) => {
        const employeeName = entry.employeeName;
        if (!acc[employeeName]) {
          acc[employeeName] = { totalMinutes: 0, entries: [] };
        }
        
        acc[employeeName].totalMinutes += entry.duration;
        acc[employeeName].entries.push(entry);
        
        return acc;
      }, {} as Record<string, { totalMinutes: number; entries: TimeEntry[] }>);
    
    // Convert each employee's time to an invoice item
    Object.entries(employeeEntries).forEach(([employeeName, data]) => {
      const hours = data.totalMinutes / 60; // Convert minutes to hours
      const roundedHours = Math.round(hours * 100) / 100; // Round to 2 decimal places
      
      // Create description from entries
      const description = data.entries
        .map(entry => {
          const startTime = new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endTime = entry.endTime 
            ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'In Progress';
          return `${startTime} - ${endTime}: ${entry.notes || 'Labor'}`;
        })
        .join('\n');
      
      // Add labor item to invoice
      newItems.push({
        id: uuidv4(),
        name: `Labor - ${employeeName}`,
        description: description,
        quantity: roundedHours,
        price: 85.00, // Default labor rate - in a real app this would be configurable
        hours: true,
        total: roundedHours * 85.00
      });
    });
    
    return newItems;
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
    updateTimeEntry,
    addTimeEntriesToInvoiceItems
  };
};

export default useWorkOrderTimeEntries;
