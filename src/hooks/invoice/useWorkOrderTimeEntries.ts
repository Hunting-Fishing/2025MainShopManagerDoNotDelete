import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';

interface UseWorkOrderTimeEntriesProps {
  workOrderId: string;
  initialTimeEntries?: TimeEntry[];
}

export const useWorkOrderTimeEntries = ({ workOrderId, initialTimeEntries }: UseWorkOrderTimeEntriesProps) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries || []);

  useEffect(() => {
    // Simulate fetching time entries from an API
    const fetchTimeEntries = async () => {
      // Replace this with your actual API call
      const fetchedEntries: TimeEntry[] = [];
      setTimeEntries(fetchedEntries);
    };

    // If initialTimeEntries is not provided, fetch them
    if (!initialTimeEntries) {
      fetchTimeEntries();
    }
  }, [workOrderId, initialTimeEntries]);

  const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'created_at'>) => {
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...entry
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(timeEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const removeTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };

  const addSampleEntries = () => {
    const sampleEntries: TimeEntry[] = [
      {
        id: crypto.randomUUID(),
        work_order_id: workOrderId,
        employee_id: 'emp-001',
        employee_name: 'John Doe',
        start_time: '2024-01-15T08:00:00',
        end_time: '2024-01-15T10:00:00',
        duration: 120,
        billable: true,
        notes: 'Diagnosed transmission issue',
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        work_order_id: workOrderId,
        employee_id: 'emp-002',
        employee_name: 'Jane Smith',
        start_time: '2024-01-15T10:30:00',
        end_time: '2024-01-15T12:30:00',
        duration: 120,
        billable: true,
        notes: 'Replaced transmission fluid and filter',
        created_at: new Date().toISOString(),
      }
    ];
    setTimeEntries([...timeEntries, ...sampleEntries]);
  };

  return {
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    removeTimeEntry,
    addSampleEntries
  };
};
