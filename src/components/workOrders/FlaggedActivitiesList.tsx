
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFlaggedActivities } from '@/utils/workOrders/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';
import { toast } from '@/hooks/use-toast';

export function FlaggedActivitiesList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFlaggedActivities();
  }, []);

  const loadFlaggedActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlaggedActivities();
      setActivities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load flagged activities';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Could not load flagged activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (activityId: string) => {
    setResolving(prev => ({ ...prev, [activityId]: true }));
    try {
      // Import on demand to avoid circular dependencies
      const { unflagWorkOrderActivity } = await import('@/utils/workOrders/activity');
      
      const success = await unflagWorkOrderActivity(activityId);
      
      if (success) {
        // Remove the resolved activity from the list
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        
        toast({
          title: "Activity Resolved",
          description: "The flagged activity has been resolved",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resolve flagged activity",
        variant: "destructive",
      });
    } finally {
      setResolving(prev => ({ ...prev, [activityId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading flagged activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="text-xl font-medium">Error Loading Activities</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={loadFlaggedActivities} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
            <h3 className="text-xl font-medium">No Flagged Activities</h3>
            <p className="text-muted-foreground mt-2">
              There are currently no flagged activities that require attention.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <CardHeader className="bg-slate-50 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {activity.work_orders?.description || 'Work Order Activity'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(activity.created_at), 'MMM d, yyyy · h:mm a')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {activity.work_orders?.status && (
                  <WorkOrderStatusBadge status={activity.work_orders.status} />
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResolve(activity.id)}
                  disabled={resolving[activity.id]}
                >
                  {resolving[activity.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {resolving[activity.id] ? 'Resolving...' : 'Resolve Flag'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    Flagged
                  </div>
                  <p className="text-sm">{activity.flag_reason}</p>
                </div>
                
                <div className="bg-slate-50 p-3 rounded border text-sm">
                  <span className="font-medium">{activity.user_name}</span>: {activity.action}
                </div>
              </div>
              
              {activity.work_orders && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Work Order ID:</p> 
                  <a 
                    href={`/work-orders/${activity.work_orders.id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {activity.work_orders.id}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
