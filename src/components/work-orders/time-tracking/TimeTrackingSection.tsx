
import React from 'react';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode?: boolean;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode = false
}: TimeTrackingSectionProps) {
  const totalTime = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  const billableTime = timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + (entry.duration || 0), 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Time Tracking</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {timeEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time entries recorded yet</p>
            {isEditMode && (
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Time Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-lg font-semibold">{formatTime(totalTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Billable Time</p>
                <p className="text-lg font-semibold text-green-600">{formatTime(billableTime)}</p>
              </div>
            </div>

            {/* Time Entries List */}
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Time Entries</h4>
              {timeEntries.map((entry) => (
                <div key={entry.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.employee_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.start_time} - {entry.end_time || 'In Progress'}
                      </p>
                      <p className="text-sm">
                        Duration: {formatTime(entry.duration)} | 
                        {entry.billable ? ' Billable' : ' Non-billable'}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                    </div>
                    {isEditMode && (
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
