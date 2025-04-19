
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
      
      if (timer) {
        setActiveTimer(timer);
        localStorage.setItem(`timer_${workOrderId}`, JSON.stringify(timer));
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
    }
  };

  const handleStopTimer = async () => {
    try {
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
    }
  };

  // Make sure this function returns the actual entries rather than just being called for side effects
  const fetchEntries = async () => {
    try {
      return await fetchTimeEntries();
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  };

  return {
    activeTimer,
    elapsedTime,
    isTracking,
    handleStartTimer,
    handleStopTimer,
    fetchTimeEntries: fetchEntries
  };
}
