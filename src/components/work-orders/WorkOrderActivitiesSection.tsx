
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flag } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderActivity {
  id: string;
  work_order_id: string;
  action: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  flagged: boolean;
  flag_reason?: string;
}

interface WorkOrderActivitiesSectionProps {
  workOrderId: string;
}

export function WorkOrderActivitiesSection({ workOrderId }: WorkOrderActivitiesSectionProps) {
  const [activities, setActivities] = useState<WorkOrderActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("work_order_activities")
          .select("*")
          .eq("work_order_id", workOrderId)
          .order("timestamp", { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error("Error fetching work order activities:", err);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [workOrderId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-lg">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">Loading activities...</div>
        ) : error ? (
          <div className="py-4 text-center text-destructive">{error}</div>
        ) : activities.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No activities recorded</div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy 'at' h:mmaaa")}
                    </span>
                  </div>
                  {activity.flagged && (
                    <div className="flex items-center text-red-500 gap-1">
                      <Flag className="h-3.5 w-3.5" />
                      <span className="text-xs">Flagged</span>
                    </div>
                  )}
                </div>
                <p className="mt-1">{activity.action}</p>
                {activity.flag_reason && (
                  <p className="mt-1 text-sm text-red-500">
                    Reason: {activity.flag_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
