
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';
import { TimeEntry } from '@/types/workOrder';

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
  const totalHours = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  const billableHours = timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + (entry.duration || 0), 0);

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Time Tracking</CardTitle>
            <Badge variant="secondary">{timeEntries.length}</Badge>
          </div>
          {isEditMode && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          )}
        </div>
        
        {timeEntries.length > 0 && (
          <div className="flex gap-4 text-sm text-slate-600">
            <span>Total Hours: {(totalHours / 60).toFixed(1)}</span>
            <span>Billable Hours: {(billableHours / 60).toFixed(1)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {timeEntries.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Clock className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No time entries recorded yet</p>
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add time entries to track work performed on this order
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Time entries will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{entry.employee_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.start_time} - {entry.end_time || 'In Progress'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(entry.duration / 60).toFixed(1)} hrs</p>
                  <Badge variant={entry.billable ? 'default' : 'secondary'}>
                    {entry.billable ? 'Billable' : 'Non-billable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
