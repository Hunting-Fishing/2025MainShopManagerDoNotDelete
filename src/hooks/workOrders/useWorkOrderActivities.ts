
import { useState, useCallback } from 'react';
import { 
  getWorkOrderActivity, 
  flagWorkOrderActivity,
  unflagWorkOrderActivity 
} from '@/utils/workOrders/activity';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderActivities(workOrderId: string) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWorkOrderActivity(workOrderId);
      setActivities(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Could not load work order activities",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  const flagActivity = async (activityId: string, reason: string) => {
    try {
      const success = await flagWorkOrderActivity(activityId, reason);
      
      if (success) {
        // Update local state
        setActivities(prev => 
          prev.map(activity => 
            activity.id === activityId 
              ? { ...activity, flagged: true, flag_reason: reason } 
              : activity
          )
        );
        
        toast({
          title: "Activity Flagged",
          description: "The activity has been flagged for review",
        });
        
        return true;
      } else {
        throw new Error("Failed to flag activity");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to flag activity",
        variant: "destructive",
      });
      return false;
    }
  };

  const unflagActivity = async (activityId: string) => {
    try {
      const success = await unflagWorkOrderActivity(activityId);
      
      if (success) {
        // Update local state
        setActivities(prev => 
          prev.map(activity => 
            activity.id === activityId 
              ? { ...activity, flagged: false, flag_reason: null } 
              : activity
          )
        );
        
        toast({
          title: "Flag Removed",
          description: "The flag has been removed from this activity",
        });
        
        return true;
      } else {
        throw new Error("Failed to remove flag");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove flag",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    activities,
    loading,
    error,
    fetchActivities,
    flagActivity,
    unflagActivity
  };
}
