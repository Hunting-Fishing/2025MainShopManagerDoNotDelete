
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { statusConfig, getStatusIcon } from "@/utils/workOrders/statusManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WorkOrder } from "@/types/workOrder"; // Add this import for WorkOrder type

interface StatusActivity {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  details?: any;
}

interface StatusHistoryProps {
  workOrderId: string;
}

export function WorkOrderStatusHistory({ workOrderId }: StatusHistoryProps) {
  const [activities, setActivities] = useState<StatusActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusActivities = async () => {
      setLoading(true);
      try {
        // Get only status change activities
        const { data, error } = await supabase
          .from('work_order_activities')
          .select('*')
          .eq('work_order_id', workOrderId)
          .like('action', 'Status changed%')
          .order('timestamp', { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error("Error fetching status history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatusActivities();
    
    // Set up real-time listener for status changes
    const channel = supabase
      .channel(`work-order-status-${workOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_order_activities',
          filter: `work_order_id=eq.${workOrderId} AND action=like.*Status changed*`
        },
        (payload) => {
          setActivities(current => [payload.new as StatusActivity, ...current]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId]);

  const parseStatusFromAction = (action: string): WorkOrder["status"] | null => {
    const match = action.match(/to\s+(\w+(?:-\w+)?)\s+by/);
    if (match && match[1]) {
      return match[1] as WorkOrder["status"];
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Status Change History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading status history...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No status changes recorded yet</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const status = parseStatusFromAction(activity.action);
              const StatusIcon = status ? getStatusIcon(status) : null;
              const statusStyle = status ? statusConfig[status]?.color : "";
              
              return (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b">
                  {StatusIcon && (
                    <div className={cn("p-2 rounded-full", statusStyle)}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
