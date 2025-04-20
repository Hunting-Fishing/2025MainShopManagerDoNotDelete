
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useWorkOrderActivities } from "@/hooks/workOrders/useWorkOrderActivities";
import { 
  Loader2, 
  AlertTriangle, 
  Check, 
  X, 
  PlayCircle, 
  Clock, 
  CalendarClock,
  Flag,
  AlertOctagon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ActivityItem {
  id: string;
  work_order_id: string;
  action: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  flagged?: boolean;
  flag_reason?: string;
}

interface WorkOrderActivitiesSectionProps {
  workOrderId: string;
}

export const WorkOrderActivitiesSection: React.FC<WorkOrderActivitiesSectionProps> = ({ 
  workOrderId 
}) => {
  const { 
    activities, 
    loading, 
    error, 
    fetchActivities,
    flagActivity,
    unflagActivity
  } = useWorkOrderActivities(workOrderId);
  
  const [flagReason, setFlagReason] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchActivities();

    // Set up real-time listener for new activities
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
          // Update activities when a new one is added
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workOrderId, fetchActivities]);

  // Render icon based on activity type
  const getActivityIcon = (action: string) => {
    switch(action) {
      case "Created":
        return <CalendarClock className="h-4 w-4 text-blue-500" />;
      case "Updated":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "Cancelled":
        return <X className="h-4 w-4 text-red-500" />;
      case "Started":
        return <PlayCircle className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleFlagActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
    setFlagReason("");
    setDialogOpen(true);
  };

  const handleSubmitFlag = async () => {
    if (selectedActivityId && flagReason.trim()) {
      await flagActivity(selectedActivityId, flagReason);
      setDialogOpen(false);
    }
  };

  const handleUnflagActivity = async (activityId: string) => {
    await unflagActivity(activityId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
        <p>Loading activity history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 text-red-500">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 border rounded-lg">
        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">No Activity Yet</h3>
        <p className="text-slate-500">
          There is no recorded activity for this work order yet.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity: ActivityItem) => (
            <div 
              key={activity.id} 
              className={`p-3 border rounded-lg flex items-start ${activity.flagged ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}
            >
              <div className="mr-3">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between mb-1">
                  <span className="font-medium flex items-center">
                    {activity.action} 
                    {activity.flagged && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertOctagon className="h-3 w-3 mr-1" /> Flagged
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">by {activity.user_name}</p>
                {activity.flagged && activity.flag_reason && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                    Flag reason: {activity.flag_reason}
                  </p>
                )}
                <div className="flex justify-end mt-2">
                  {activity.flagged ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs" 
                      onClick={() => handleUnflagActivity(activity.id)}
                    >
                      <X className="h-3 w-3 mr-1" /> Remove Flag
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs text-amber-600 hover:text-amber-700"
                      onClick={() => handleFlagActivity(activity.id)}
                    >
                      <Flag className="h-3 w-3 mr-1" /> Flag
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Activity</DialogTitle>
              <DialogDescription>
                Provide a reason for flagging this activity. Flags help identify issues that need attention.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter the reason for flagging this activity..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitFlag} disabled={!flagReason.trim()}>Flag Activity</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
