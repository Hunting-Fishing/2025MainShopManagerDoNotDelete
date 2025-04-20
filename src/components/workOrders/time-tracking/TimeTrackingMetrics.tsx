
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from '@/types/workOrder';
import { formatTimeInHoursAndMinutes } from '@/utils/workOrders';

interface TimeTrackingMetricsProps {
  timeEntries: TimeEntry[];
}

export function TimeTrackingMetrics({ timeEntries }: TimeTrackingMetricsProps) {
  const totalTime = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  const billableTime = timeEntries.reduce((total, entry) => 
    entry.billable ? total + (entry.duration || 0) : total, 0
  );
  const nonBillableTime = totalTime - billableTime;
  const billablePercentage = totalTime > 0 ? (billableTime / totalTime) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">
            {formatTimeInHoursAndMinutes(totalTime)}
          </div>
          <p className="text-sm text-muted-foreground">Total Time</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">
            {formatTimeInHoursAndMinutes(billableTime)}
          </div>
          <p className="text-sm text-muted-foreground">Billable Time</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-orange-600">
            {formatTimeInHoursAndMinutes(nonBillableTime)}
          </div>
          <p className="text-sm text-muted-foreground">Non-Billable Time</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600">
            {billablePercentage.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">Billable Percentage</p>
        </CardContent>
      </Card>
    </div>
  );
}
