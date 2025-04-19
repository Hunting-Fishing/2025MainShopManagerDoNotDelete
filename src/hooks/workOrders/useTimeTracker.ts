
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';
import { useWorkOrderTimeTracking } from './useWorkOrderTimeTracking';

export function useTimeTracker(workOrderId: string) {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const {
    startTimeTracking,
    stopTimeTracking,
    isTracking,
    fetchTimeEntries
  } = useWorkOrderTimeTracking(workOrderId);

  // Handle browser refresh sync
  useEffect(() => {
    const storedTimer = localStorage.getItem(`timer_${workOrderId}`);
    if (storedTimer) {
      const timer = JSON.parse(storedTimer);
      setActiveTimer(timer);
    }
  }, [workOrderId]);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.startTime).getTime();
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
  }, [activeTimer]);

  const handleStartTimer = async () => {
    try {
      const timer = await startTimeTracking(
        "current-user", // This would come from auth context
        "Current User"
      );
      
      // Fixed: Check if timer is defined before using it
      if (timer) {
        setActiveTimer(timer);
        localStorage.setItem(`timer_${workOrderId}`, JSON.stringify(timer));
        return timer;
      }
      return null;
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleStopTimer = async () => {
    try {
      if (!activeTimer) return null;
      
      const completedEntry = await stopTimeTracking();
      if (completedEntry) {
        setActiveTimer(null);
        localStorage.removeItem(`timer_${workOrderId}`);
        setElapsedTime(0);
      }
      return completedEntry;
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive"
      });
      return null;
    }
  };

  // Ensure fetchEntries always returns an array and is explicitly typed
  const fetchEntries = async (): Promise<TimeEntry[]> => {
    try {
      // Explicitly await the result and ensure it's always an array
      const entries = await fetchTimeEntries();
      // TypeScript sees this as possibly void, so we need to be explicit
      return Array.isArray(entries) ? entries : [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive"
      });
      return []; // Always return an array, even on error
    }
  };

  return {
    activeTimer,
    elapsedTime,
    isTracking,
    handleStartTimer,
    handleStopTimer,
    fetchTimeEntries: fetchEntries // Explicitly assign the function
  };
}
