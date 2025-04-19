
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Clock, Check, X, RotateCw } from "lucide-react";

interface WorkOrderActivity {
  id: string;
  action: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  flagged: boolean;
  flag_reason?: string;
}

interface WorkOrderActivitiesSectionProps {
  workOrderId: string;
}

export function WorkOrderActivitiesSection({ workOrderId }: WorkOrderActivitiesSectionProps) {
  const [activities, setActivities] = useState<WorkOrderActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [workOrderId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('work_order_activities')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching work order activities:", err);
      setError("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  // Get an appropriate icon based on the action
  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('status') && action.toLowerCase().includes('completed')) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (action.toLowerCase().includes('status') && action.toLowerCase().includes('cancelled')) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    if (action.toLowerCase().includes('status')) {
      return <RotateCw className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div>Activity Log</div>
          <button 
            onClick={fetchActivities} 
            className="text-xs text-blue-600 hover:underline flex items-center"
            disabled={isLoading}
          >
            <RotateCw className="h-3 w-3 mr-1" />
            Refresh
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <span className="text-muted-foreground">Loading activities...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 flex flex-col items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-muted-foreground">No activities recorded yet</span>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                <div className="mt-0.5">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                    <span>{activity.user_name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                    
                    {activity.flagged && (
                      <>
                        <span>•</span>
                        <Badge variant="destructive" className="text-[10px] py-0 h-4">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      </>
                    )}
                  </div>
                  {activity.flagged && activity.flag_reason && (
                    <p className="text-xs mt-1 text-red-500">
                      Reason: {activity.flag_reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
