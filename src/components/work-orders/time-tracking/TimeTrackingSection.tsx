
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
  const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableTime = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Time Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Billable Time</p>
                <p className="text-2xl font-bold">{formatTime(billableTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            {isEditMode && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Time Entry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
              {timeEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{entry.employee_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.start_time).toLocaleDateString()} - {formatTime(entry.duration)}
                      </p>
                      {entry.notes && (
                        <p className="text-sm mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        entry.billable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.billable ? 'Billable' : 'Non-billable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
