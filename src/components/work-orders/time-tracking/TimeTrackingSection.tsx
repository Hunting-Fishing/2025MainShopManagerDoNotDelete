import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/workOrder";
import { Clock, Play, Pause } from "lucide-react";
import { formatRelativeTime } from "@/utils/dateUtils";
import { TimeTrackingMetrics } from "./TimeTrackingMetrics";
import { useWorkOrderTimeManagement } from "@/hooks/workOrders";
import { format } from "date-fns";

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries
}: TimeTrackingSectionProps) {
  const {
    activeEntry,
    isTracking,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries
  } = useWorkOrderTimeManagement(workOrderId);

  React.useEffect(() => {
    const loadTimeEntries = async () => {
      const entries = await fetchTimeEntries();
      onUpdateTimeEntries(entries);
    };
    
    loadTimeEntries();
  }, [workOrderId, fetchTimeEntries, onUpdateTimeEntries]);

  const handleStartTimer = async () => {
    // In a real app, these would come from auth context
    const userId = "current-user";
    const userName = "Current User";
    
    const newEntry = await startTimeTracking(userId, userName);
    if (newEntry) {
      onUpdateTimeEntries([newEntry, ...timeEntries]);
    }
  };

  const handleStopTimer = async () => {
    const completedEntry = await stopTimeTracking();
    if (completedEntry) {
      onUpdateTimeEntries([completedEntry, ...timeEntries]);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Time Tracking</CardTitle>
        </div>
        <div className="flex gap-2">
          {isTracking ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500" 
              onClick={handleStopTimer}
            >
              <Pause className="mr-1 h-4 w-4" />
              Stop Timer
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500" 
              onClick={handleStartTimer}
            >
              <Play className="mr-1 h-4 w-4" />
              Start Timer
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {activeEntry && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">Timer Running</p>
              <p className="text-sm text-slate-500">
                Started: {formatRelativeTime(activeEntry.startTime)}
              </p>
            </div>
          </div>
        )}
        
        <TimeTrackingMetrics timeEntries={timeEntries} />
        
        {timeEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="border rounded-md divide-y">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.employeeName}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(entry.startTime), 'MMM d, h:mm a')}
                      {entry.endTime ? ` - ${format(new Date(entry.endTime), 'h:mm a')}` : ' - Ongoing'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.duration || 0} minutes</p>
                    <p className="text-sm text-slate-500">
                      {entry.billable ? 'Billable' : 'Non-billable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No time entries yet</p>
            <p className="text-sm">Start the timer to begin tracking time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
