
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  user_name: string;
  flagged: boolean;
  flag_reason?: string;
}

interface WorkOrderActivitiesSectionProps {
  workOrderId: string;
}

export function WorkOrderActivitiesSection({ workOrderId }: WorkOrderActivitiesSectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscription for new activities
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
          setActivities(prev => [payload.new as ActivityItem, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b">
        <div className="flex items-center">
          <History className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Activity History</CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No activity recorded for this work order yet.
          </div>
        ) : (
          <ul className="divide-y">
            {activities.map((activity) => (
              <li 
                key={activity.id}
                className={`p-4 ${activity.flagged ? 'bg-red-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold text-sm">
                    {activity.user_name?.substring(0, 2).toUpperCase() || 'SY'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user_name || 'System'}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy • h:mm a')}
                    </p>
                    {activity.flagged && activity.flag_reason && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                        <strong>Flagged:</strong> {activity.flag_reason}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
