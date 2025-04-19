
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useWorkOrderTimeManagement(workOrderId: string) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedTimer = localStorage.getItem(`timer_${workOrderId}`);
    if (storedTimer) {
      const timer = JSON.parse(storedTimer);
      setActiveEntry(timer);
      setIsTracking(true);
    }
  }, [workOrderId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(activeEntry.startTime).getTime();
        const currentTime = new Date().getTime();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeEntry]);

  const startTimeTracking = async (employeeId: string, employeeName: string) => {
    if (isTracking) return null;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert({
          work_order_id: workOrderId,
          employee_id: employeeId,
          employee_name: employeeName,
          start_time: new Date().toISOString(),
          end_time: null,
          duration: 0,
          billable: true
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: TimeEntry = {
        id: data.id,
        employeeId,
        employeeName,
        startTime: data.start_time,
        endTime: null,
        duration: 0,
        billable: true
      };

      setActiveEntry(newEntry);
      setIsTracking(true);
      localStorage.setItem(`timer_${workOrderId}`, JSON.stringify(newEntry));

      toast({
        title: "Time Tracking Started",
        description: "Timer is now running"
      });

      return newEntry;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start time tracking",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const stopTimeTracking = async () => {
    if (!isTracking || !activeEntry) return null;
    
    setLoading(true);
    
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(activeEntry.startTime);
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));

      const { data, error } = await supabase
        .from('work_order_time_entries')
        .update({
          end_time: endTime,
          duration
        })
        .eq('id', activeEntry.id)
        .select()
        .single();

      if (error) throw error;

      setActiveEntry(null);
      setIsTracking(false);
      setElapsedTime(0);
      localStorage.removeItem(`timer_${workOrderId}`);

      toast({
        title: "Time Tracking Stopped",
        description: `Recorded ${duration} minutes`
      });

      return {
        ...activeEntry,
        endTime,
        duration
      };
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      toast({
        title: "Error",
        description: "Failed to stop time tracking",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeEntries = async (): Promise<TimeEntry[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return data.map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        employeeName: entry.employee_name,
        startTime: entry.start_time,
        endTime: entry.end_time,
        duration: entry.duration,
        billable: entry.billable
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    isTracking,
    activeEntry,
    elapsedTime,
    loading,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries
  };
}
