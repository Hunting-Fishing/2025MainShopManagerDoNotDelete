
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFlaggedActivities, unflagWorkOrderActivity } from "@/utils/workOrders/activity";
import { Loader2, AlertTriangle, Flag, Check, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export function FlaggedActivitiesList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlaggedActivities = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching flagged activities:", err);
      setError("Failed to load flagged activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedActivities();
  }, []);

  const handleUnflag = async (activityId: string) => {
    try {
      const success = await unflagWorkOrderActivity(activityId);
      if (success) {
        setActivities(activities.filter(activity => activity.id !== activityId));
        toast({
          title: "Flag Removed",
          description: "The flag has been removed from this activity",
        });
      }
    } catch (err) {
      console.error("Error unflagging activity:", err);
      toast({
        title: "Error",
        description: "Failed to remove flag",
        variant: "destructive",
      });
    }
  };

  const handleResolve = async (activityId: string) => {
    try {
      // In a real app, you might have a more complex resolution process
      // For now, we'll just unflag the item
      const success = await unflagWorkOrderActivity(activityId);
      if (success) {
        setActivities(activities.filter(activity => activity.id !== activityId));
        toast({
          title: "Issue Resolved",
          description: "The flagged activity has been marked as resolved",
        });
      }
    } catch (err) {
      console.error("Error resolving flagged activity:", err);
      toast({
        title: "Error",
        description: "Failed to resolve flagged activity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
        <p>Loading flagged activities...</p>
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
        <Flag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-1">No Flagged Activities</h3>
        <p className="text-slate-500">
          There are currently no flagged activities that require attention.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-amber-50">
        <CardTitle className="flex items-center text-lg">
          <Flag className="h-5 w-5 mr-2 text-amber-600" />
          Flagged Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 mt-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {activity.action}
                      <Badge variant="destructive" className="ml-2">Flagged</Badge>
                    </h3>
                    <p className="text-sm text-slate-500">
                      Work Order: {activity.work_orders?.id || "Unknown"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-red-200 my-3">
                  <p className="text-sm font-medium text-red-700">Flag reason:</p>
                  <p className="text-sm text-red-600">{activity.flag_reason}</p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/work-orders/${activity.work_order_id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> View Work Order
                    </Link>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnflag(activity.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Unflag
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleResolve(activity.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Mark Resolved
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
