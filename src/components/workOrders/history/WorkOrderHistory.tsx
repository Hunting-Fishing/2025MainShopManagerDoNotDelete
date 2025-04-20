
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timeline, TimelineItem, TimelineLine, TimelineIcon, TimelineContainer, TimelineContent } from '@/components/ui/timeline';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Loader2, History, ClipboardList, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

interface WorkOrderActivity {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
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
      try {
        const { data, error } = await supabase
          .from('work_order_activities')
          .select('*')
          .eq('work_order_id', workOrderId)
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching work order activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [workOrderId]);
  
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'status_updated':
        return <Clock className="h-4 w-4" />;
      case 'created':
        return <ClipboardList className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'notification_sent':
        return <Bell className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };
  
  const getActivityDescription = (activity: WorkOrderActivity) => {
    switch (activity.action) {
      case 'status_updated':
        return `Status changed from ${activity.details?.oldStatus || 'unknown'} to ${activity.details?.newStatus || 'unknown'}`;
      case 'created':
        return 'Work order created';
      case 'completed':
        return 'Work order completed';
      case 'cancelled':
        return 'Work order cancelled';
      case 'notification_sent':
        return `Notification sent: ${activity.details?.notificationType || 'unknown'}`;
      default:
        return activity.action.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Order History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Work Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No history records found for this work order.</p>
          </div>
        ) : (
          <Timeline>
            {activities.map((activity) => (
              <TimelineItem key={activity.id}>
                <TimelineLine />
                <TimelineIcon>
                  {getActivityIcon(activity.action)}
                </TimelineIcon>
                <TimelineContent>
                  <div className="grid gap-1">
                    <h4 className="text-sm font-medium leading-none">
                      {getActivityDescription(activity)}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {activity.user_name || "System"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  );
}
