import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/workOrder";
import { Clock, Play, Pause } from "lucide-react";
import { formatRelativeTime } from "@/utils/dateUtils";
import { useWorkOrderTimeTracking } from "@/hooks/workOrders/useWorkOrderTimeTracking";

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
    isTracking,
    activeEntry,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries
  } = useWorkOrderTimeTracking(workOrderId);

  useEffect(() => {
    const loadTimeEntries = async () => {
      const entries = await fetchTimeEntries();
      onUpdateTimeEntries(entries);
    };
    
    loadTimeEntries();
  }, [workOrderId, fetchTimeEntries, onUpdateTimeEntries]);

  // Current user info would come from auth context in a real app
  const currentUser = {
    id: "current-user",
    name: "Current User"
  };

  const handleStartTracking = () => {
    startTimeTracking(currentUser.id, currentUser.name);
  };

  const handleStopTracking = async () => {
    const completedEntry = await stopTimeTracking();
    if (completedEntry) {
      onUpdateTimeEntries([completedEntry, ...timeEntries]);
    }
  };

  const totalBillableTime = timeEntries.reduce((total, entry) => {
    return entry.billable ? total + (entry.duration || 0) : total;
  }, 0);

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
              onClick={handleStopTracking}
            >
              <Pause className="mr-1 h-4 w-4" />
              Stop Timer
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500" 
              onClick={handleStartTracking}
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
        
        {timeEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <p className="text-sm text-slate-500">Total Billable Time</p>
              <p className="font-medium">{totalBillableTime} minutes</p>
            </div>
            
            <div className="border rounded-md divide-y">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.employeeName}</p>
                    <p className="text-sm text-slate-500">
                      {formatRelativeTime(entry.startTime)}
                      {entry.endTime ? ` - ${formatRelativeTime(entry.endTime)}` : ' - Ongoing'}
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
