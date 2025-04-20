
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/workOrders/formatters";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkOrderActivity {
  id: string;
  action: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  flagged: boolean;
  flag_reason?: string;
}

interface WorkOrderActivityHistoryProps {
  workOrderId: string;
}

const formatActivityAction = (action: string): { text: string, badge?: string } => {
  if (action.startsWith('status_changed_to_')) {
    const status = action.replace('status_changed_to_', '');
    return { 
      text: `Status changed to ${status}`,
      badge: status
    };
  }
  
  if (action === 'created') {
    return { text: 'Work order created' };
  }
  
  if (action === 'updated') {
    return { text: 'Work order details updated' };
  }
  
  if (action === 'inventory_item_added') {
    return { text: 'Inventory item added' };
  }
  
  if (action === 'inventory_item_removed') {
    return { text: 'Inventory item removed' };
  }
  
  if (action === 'time_entry_added') {
    return { text: 'Time entry added' };
  }
  
  return { text: action.replace(/_/g, ' ') };
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

export function WorkOrderActivityHistory({ workOrderId }: WorkOrderActivityHistoryProps) {
  const [activities, setActivities] = useState<WorkOrderActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
    
    // Set up real-time subscription for activity updates
    const channel = supabase
      .channel('work-order-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_order_activities',
          filter: `work_order_id=eq.${workOrderId}`
        },
        (payload) => {
          setActivities(current => [payload.new as WorkOrderActivity, ...current]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <History className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle className="text-lg">Activity History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading activity history...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No activity recorded yet</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const formattedAction = formatActivityAction(activity.action);
              return (
                <div key={activity.id} className="flex gap-4 pb-4 border-b">
                  <div className="min-w-[100px] text-sm text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{formattedAction.text}</span>
                      {formattedAction.badge && (
                        <Badge variant="outline" className={getStatusBadgeClass(formattedAction.badge)}>
                          {formattedAction.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">by {activity.user_name}</div>
                    {activity.flagged && (
                      <div className="mt-1 text-sm text-red-600">
                        ⚠️ Flagged: {activity.flag_reason || "No reason provided"}
                      </div>
                    )}
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
