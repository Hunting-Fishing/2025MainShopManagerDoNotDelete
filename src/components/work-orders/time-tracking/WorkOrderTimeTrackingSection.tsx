
import React from 'react';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface WorkOrderTimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function WorkOrderTimeTrackingSection({
  workOrderId,
  timeEntries,
  onTimeEntriesChange,
  isEditMode
}: WorkOrderTimeTrackingSectionProps) {
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatHours(totalHours)}h</p>
            <p className="text-sm text-muted-foreground">Total Hours</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatHours(billableHours)}h</p>
            <p className="text-sm text-muted-foreground">Billable Hours</p>
          </div>
        </div>

        {timeEntries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No time entries recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{entry.employee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatHours(entry.duration)} hours
                      {entry.billable ? ' (Billable)' : ' (Non-billable)'}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
