
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from '@/types/workOrder';
import { Clock, Play, Pause, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface TimeTrackingSectionProps {
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  timeEntries,
  onUpdateTimeEntries
}) => {
  const [activeTimer, setActiveTimer] = React.useState<TimeEntry | null>(null);

  const handleStartTimer = () => {
    const newTimer: TimeEntry = {
      id: `TE-${Date.now()}`,
      employeeId: "current-user", // In a real app, this would come from auth context
      employeeName: "Current User", // This would come from auth context
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      billable: true
    };
    
    setActiveTimer(newTimer);
    toast({
      title: "Timer Started",
      description: "Time tracking has begun",
    });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      const completedEntry: TimeEntry = {
        ...activeTimer,
        endTime: endTime.toISOString(),
        duration: durationMinutes
      };
      
      onUpdateTimeEntries([...timeEntries, completedEntry]);
      setActiveTimer(null);
      
      toast({
        title: "Timer Stopped",
        description: `Recorded ${durationMinutes} minutes`,
      });
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
          {activeTimer ? (
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // This would open a dialog to manually add time entry
              toast({
                title: "Coming Soon",
                description: "Manual time entry will be implemented soon",
              });
            }}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Time Entry
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {activeTimer && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-green-700">Timer Active</p>
              <p className="text-sm text-green-600">
                Started at {format(new Date(activeTimer.startTime), 'h:mm a')}
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleStopTimer}
            >
              Stop Timer
            </Button>
          </div>
        )}
        
        {timeEntries.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium">Time Entries</h3>
            <div className="border rounded-md divide-y">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.employeeName}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(entry.startTime), 'MMM d, h:mm a')} - 
                      {entry.endTime ? format(new Date(entry.endTime), ' h:mm a') : ' ongoing'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.duration} minutes</p>
                    <p className="text-sm text-gray-500">
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
            <p className="text-sm">Start the timer or add time manually</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
