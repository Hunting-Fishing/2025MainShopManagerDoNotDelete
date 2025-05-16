
import { useState } from "react";
import { TimeEntry } from "@/types/workOrder";

export function useWorkOrderTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch time entries for a work order
  const fetchTimeEntries = async (workOrderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This would be an API call in a real app
      const mockEntries = mockGetTimeEntries(workOrderId);
      setTimeEntries(mockEntries);
      return mockEntries;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add a time entry
  const addTimeEntry = async (entry: Omit<TimeEntry, "id">) => {
    try {
      // This would be an API call in a real app
      const newEntry: TimeEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
      };
      
      setTimeEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update a time entry
  const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    try {
      const updatedEntries = timeEntries.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
      
      setTimeEntries(updatedEntries);
      return updatedEntries.find(entry => entry.id === entryId);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Remove a time entry
  const removeTimeEntry = async (entryId: string) => {
    try {
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Calculate total billable hours
  const calculateBillableHours = (entries: TimeEntry[]): number => {
    return entries
      .filter(entry => entry.billable)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  return {
    timeEntries,
    isLoading,
    error,
    fetchTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    removeTimeEntry,
    calculateBillableHours
  };
}

// Mock API function
function mockGetTimeEntries(workOrderId: string): TimeEntry[] {
  // Return mock data based on the work order ID
  return [
    {
      id: "entry1",
      work_order_id: workOrderId,
      employee_id: "emp1",
      employee_name: "John Technician",
      start_time: "2023-05-01T09:00:00",
      end_time: "2023-05-01T11:30:00",
      duration: 150, // 2.5 hours in minutes
      billable: true,
      notes: "Initial diagnostics"
    },
    {
      id: "entry2",
      work_order_id: workOrderId,
      employee_id: "emp2",
      employee_name: "Sarah Mechanic",
      start_time: "2023-05-01T13:00:00",
      end_time: "2023-05-01T16:00:00",
      duration: 180, // 3 hours in minutes
      billable: true,
      notes: "Parts replacement"
    }
  ];
}
