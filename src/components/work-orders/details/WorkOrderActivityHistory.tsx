
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  work_order_id?: string;
}

interface WorkOrderActivityHistoryProps {
  workOrderId: string;
}

export function WorkOrderActivityHistory({ workOrderId }: WorkOrderActivityHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('work_order_activities')
          .select('*')
          .eq('work_order_id', workOrderId)
          .order('timestamp', { ascending: false });
          
        if (error) throw error;
        
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [workOrderId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <RotateCw className="animate-spin h-5 w-5 text-slate-400" />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-slate-200 pl-4 py-1">
                <div className="text-sm font-medium">{activity.action}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {activity.user_name} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            No activity recorded for this work order yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
