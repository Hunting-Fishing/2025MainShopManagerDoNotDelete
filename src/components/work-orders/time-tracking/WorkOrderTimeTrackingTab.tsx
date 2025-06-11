
import React from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkOrderTimeTrackingTabProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function WorkOrderTimeTrackingTab({
  workOrder,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode
}: WorkOrderTimeTrackingTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries && timeEntries.length > 0 ? (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h4 className="font-medium">{entry.employee_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.start_time).toLocaleString()} - {new Date(entry.end_time).toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.duration} min</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.billable ? 'Billable' : 'Non-billable'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No time entries found for this work order.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
