
import { useState } from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { InvoiceItem } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

export function useWorkOrderTimeEntries(workOrder: WorkOrder) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder.timeEntries || []);
  const totalBillableHours = calculateTotalBillableHours(timeEntries);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const addTimeEntry = (entry: TimeEntry) => {
    setTimeEntries([...timeEntries, entry]);
  };

  const removeTimeEntry = (entryId: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
  };

  const updateTimeEntry = (entryId: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(timeEntries.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    ));
  };

  const addTimeEntriesToInvoiceItems = (workOrder: WorkOrder, currentItems: InvoiceItem[] = []): InvoiceItem[] => {
    // If the workOrder doesn't have timeEntries, return the current items
    if (!workOrder.timeEntries || workOrder.timeEntries.length === 0) {
      return currentItems;
    }

    // Create a copy of the current items
    const updatedItems = [...currentItems];
    
    // Group billable time entries by employee
    const billableEntriesByEmployee: Record<string, TimeEntry[]> = {};
    workOrder.timeEntries
      .filter(entry => entry.billable)
      .forEach(entry => {
        if (!billableEntriesByEmployee[entry.employeeName]) {
          billableEntriesByEmployee[entry.employeeName] = [];
        }
        billableEntriesByEmployee[entry.employeeName].push(entry);
      });
    
    // Create invoice items for each employee's billable time
    Object.entries(billableEntriesByEmployee).forEach(([employeeName, entries]) => {
      // Calculate total minutes
      const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
      // Convert to hours for billing (round to 2 decimal places)
      const hours = Math.round(totalMinutes / 60 * 100) / 100;
      
      // Default hourly rate - in a real app, this would be retrieved from employee/service settings
      const hourlyRate = 95;
      
      updatedItems.push({
        id: uuidv4(),
        name: `Labor - ${employeeName}`,
        description: `Service labor (${entries.length} entries, ${formatDuration(totalMinutes)})`,
        quantity: hours,
        price: hourlyRate,
        hours: true,
        total: hours * hourlyRate
      });
    });
    
    return updatedItems;
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
}

function calculateTotalBillableHours(entries: TimeEntry[]): number {
  return entries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);
}
