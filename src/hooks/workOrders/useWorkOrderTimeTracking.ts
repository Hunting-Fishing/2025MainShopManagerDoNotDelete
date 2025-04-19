
import { useState } from "react";
import { TimeEntry } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderTimeTracking = (workOrderId: string) => {
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const startTimeTracking = async (employeeId: string, employeeName: string) => {
    if (isTracking) return;
    
    setLoading(true);
    
    const newEntry: Omit<TimeEntry, 'id'> = {
      employeeId,
      employeeName,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      billable: true,
      notes: ''
    };

    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert({
          work_order_id: workOrderId,
          employee_id: employeeId,
          employee_name: employeeName,
          start_time: newEntry.startTime,
          end_time: null,
          duration: 0,
          billable: true,
          notes: ''
        })
        .select()
        .single();

      if (error) throw error;

      setActiveEntry({
        id: data.id,
        ...newEntry
      });
      
      setIsTracking(true);
      
      toast({
        title: "Time Tracking Started",
        description: "Timer is now running"
      });
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start time tracking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stopTimeTracking = async (notes: string = '') => {
    if (!isTracking || !activeEntry) return null;
    
    setLoading(true);
    
    const endTime = new Date().toISOString();
    const startTime = new Date(activeEntry.startTime);
    const durationInMinutes = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));

    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .update({
          end_time: endTime,
          duration: durationInMinutes,
          notes: notes || activeEntry.notes
        })
        .eq('id', activeEntry.id)
        .select()
        .single();

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
        duration: durationInMinutes,
        notes
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

  const fetchTimeEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      const formattedEntries: TimeEntry[] = data.map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        employeeName: entry.employee_name,
        startTime: entry.start_time,
        endTime: entry.end_time,
        duration: entry.duration,
        billable: entry.billable,
        notes: entry.notes || ''
      }));

      // Check for any active time tracking session
      const activeEntryData = data.find(entry => entry.end_time === null);
      if (activeEntryData) {
        const activeEntry: TimeEntry = {
          id: activeEntryData.id,
          employeeId: activeEntryData.employee_id,
          employeeName: activeEntryData.employee_name,
          startTime: activeEntryData.start_time,
          endTime: null,
          duration: 0,
          billable: activeEntryData.billable,
          notes: activeEntryData.notes || ''
        };
        setActiveEntry(activeEntry);
        setIsTracking(true);
      }

      return formattedEntries;
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
    loading,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries,
  };
};
