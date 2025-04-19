
import { useState } from "react";
import { TimeEntry, WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderTimeTracking = (workOrderId: string) => {
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  const startTimeTracking = async (employeeId: string, employeeName: string) => {
    if (isTracking) return;

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employeeId,
      employeeName,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      billable: true
    };

    try {
      const { error } = await supabase
        .from('work_order_time_entries')
        .insert({
          id: newEntry.id,
          work_order_id: workOrderId,
          employee_id: employeeId,
          employee_name: employeeName,
          start_time: newEntry.startTime,
          end_time: null,
          duration: 0,
          billable: true
        });

      if (error) throw error;

      setActiveEntry(newEntry);
      setIsTracking(true);
      
      toast({
        title: "Time Tracking Started",
        description: "Timer is now running",
      });
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start time tracking",
        variant: "destructive"
      });
    }
  };

  const stopTimeTracking = async () => {
    if (!isTracking || !activeEntry) return;

    const endTime = new Date().toISOString();
    const startTime = new Date(activeEntry.startTime);
    const durationInMinutes = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));

    try {
      const { error } = await supabase
        .from('work_order_time_entries')
        .update({
          end_time: endTime,
          duration: durationInMinutes
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setActiveEntry(null);
      setIsTracking(false);
      
      toast({
        title: "Time Tracking Stopped",
        description: `Recorded ${durationInMinutes} minutes`,
      });

      return {
        ...activeEntry,
        endTime,
        duration: durationInMinutes
      };
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      toast({
        title: "Error",
        description: "Failed to stop time tracking",
        variant: "destructive"
      });
    }
  };

  const fetchTimeEntries = async () => {
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
        billable: entry.billable,
        notes: entry.notes
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  };

  return {
    isTracking,
    activeEntry,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries
  };
};
