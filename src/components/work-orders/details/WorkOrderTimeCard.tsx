
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface WorkOrderTimeCardProps {
  timeEntries: TimeEntry[];
  workOrder: WorkOrder;
}

export function WorkOrderTimeCard({ timeEntries, workOrder }: WorkOrderTimeCardProps) {
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const formatHours = (hours: number) => {
    return (hours / 60).toFixed(1); // Assuming duration is in minutes
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-lg font-semibold">{formatHours(totalHours)}h</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billable Hours</p>
            <p className="text-lg font-semibold">{formatHours(billableHours)}h</p>
          </div>
        </div>
        
        {workOrder.created_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created: {new Date(workOrder.created_at).toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {timeEntries.length} time {timeEntries.length === 1 ? 'entry' : 'entries'}
        </div>
      </CardContent>
    </Card>
  );
}
