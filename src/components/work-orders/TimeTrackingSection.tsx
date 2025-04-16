
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from "@/types/workOrder";
import { format } from "date-fns";

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({ 
  workOrderId,
  timeEntries,
  onUpdateTimeEntries
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);

  const startTimeTracking = () => {
    if (isTracking) return;
    
    const newEntry: TimeEntry = {
      id: `temp-${Date.now()}`,
      employeeId: "current-user", // In a real app, this would be the current user's ID
      employeeName: "Current User", // In a real app, this would be the current user's name
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      billable: true
    };
    
    setCurrentEntry(newEntry);
    setIsTracking(true);
  };

  const stopTimeTracking = () => {
    if (!isTracking || !currentEntry) return;
    
    const now = new Date();
    const startTime = new Date(currentEntry.startTime);
    const durationInMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
    
    const updatedEntry: TimeEntry = {
      ...currentEntry,
      endTime: now.toISOString(),
      duration: durationInMinutes
    };
    
    const updatedEntries = [...timeEntries, updatedEntry];
    onUpdateTimeEntries(updatedEntries);
    
    setCurrentEntry(null);
    setIsTracking(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Time Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {isTracking ? (
            <Button variant="destructive" onClick={stopTimeTracking}>
              Stop Tracking
            </Button>
          ) : (
            <Button variant="default" onClick={startTimeTracking}>
              Start Tracking
            </Button>
          )}
        </div>
        
        {isTracking && currentEntry && (
          <div className="text-sm text-muted-foreground mb-4">
            Currently tracking time since {format(new Date(currentEntry.startTime), "h:mm a")}
          </div>
        )}
        
        {timeEntries.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Time Entries</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Staff</th>
                  <th className="text-left py-2">Start</th>
                  <th className="text-left py-2">End</th>
                  <th className="text-right py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map(entry => (
                  <tr key={entry.id} className="border-b">
                    <td className="py-2">{entry.employeeName}</td>
                    <td className="py-2">{format(new Date(entry.startTime), "MMM d, h:mm a")}</td>
                    <td className="py-2">
                      {entry.endTime ? format(new Date(entry.endTime), "MMM d, h:mm a") : "Ongoing"}
                    </td>
                    <td className="py-2 text-right">
                      {entry.duration} {entry.duration === 1 ? "minute" : "minutes"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No time entries yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
