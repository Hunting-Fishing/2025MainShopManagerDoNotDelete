
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderActivity {
  id: string;
  work_order_id: string;
  action: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  flagged: boolean;
  flag_reason?: string;
}

interface WorkOrderActivityTabProps {
  workOrderId: string;
}

export function WorkOrderActivityTab({ workOrderId }: WorkOrderActivityTabProps) {
  const [activities, setActivities] = useState<WorkOrderActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workOrderId) {
      fetchActivities();
    }
  }, [workOrderId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('Fetching activities for work order:', workOrderId);

      const { data, error } = await supabase
        .from('work_order_activities')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      console.log('Fetched activities:', data?.length || 0);
      setActivities(data || []);
    } catch (err) {
      console.error('Exception fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return '🆕';
      case 'status_changed':
        return '🔄';
      case 'assigned':
        return '👤';
      case 'updated':
        return '✏️';
      case 'completed':
        return '✅';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading activity history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activity recorded for this work order</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  activity.flagged ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-2xl">{getActivityIcon(activity.action)}</div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.action.replace('_', ' ')}</span>
                    {activity.flagged && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{activity.user_name}</span>
                    <span>•</span>
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                  
                  {activity.flagged && activity.flag_reason && (
                    <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      <strong>Flag Reason:</strong> {activity.flag_reason}
                    </div>
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
