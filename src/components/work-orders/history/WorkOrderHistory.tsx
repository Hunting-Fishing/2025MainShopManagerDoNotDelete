
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { History, User, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface WorkOrderActivity {
  id: string;
  workOrderId: string;
  action: string;
  userId: string;
  userName: string;
  createdAt: string;
  details?: any;
}

interface WorkOrderHistoryProps {
  workOrderId: string;
}

export function WorkOrderHistory({ workOrderId }: WorkOrderHistoryProps) {
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
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching work order activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [workOrderId]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'status_updated':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'comment_added':
        return <User className="h-5 w-5 text-green-500" />;
      default:
        return <History className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <History className="mr-2 h-5 w-5" />
          Work Order History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="text-center p-6">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-200 rounded-full mb-3"></div>
              <div className="h-4 w-1/3 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 border-b pb-4">
                <div className="mt-1">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{activity.action.replace('_', ' ')}</p>
                  <p className="text-sm text-slate-500">{activity.userName} • {formatDate(activity.createdAt)}</p>
                  {activity.details && (
                    <p className="text-sm mt-1">{JSON.stringify(activity.details)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed rounded-md">
            <History className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Activity Yet</h3>
            <p className="text-slate-500 mb-3">
              This work order has no recorded activity yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
