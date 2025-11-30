import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailyShopInspection } from '@/types/safety';

interface InspectionCompletionWidgetProps {
  inspections: DailyShopInspection[];
  loading?: boolean;
}

export function InspectionCompletionWidget({ inspections, loading }: InspectionCompletionWidgetProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInspections = inspections.filter(i => i.inspection_date === todayStr);
  
  // Expected inspections (morning, afternoon shifts at minimum)
  const expectedInspections = ['morning', 'afternoon'];
  const completedShifts = todayInspections.map(i => i.shift);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today's Inspections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expectedInspections.map((shift) => {
            const inspection = todayInspections.find(i => i.shift === shift);
            const isCompleted = !!inspection;
            
            return (
              <div
                key={shift}
                className={`flex items-center justify-between p-3 rounded-lg border
                  ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-muted/50'}`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium capitalize">{shift} Shift</p>
                    {isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        by {inspection.inspector_name}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={isCompleted ? 'default' : 'secondary'}>
                  {isCompleted ? 'Completed' : 'Pending'}
                </Badge>
              </div>
            );
          })}
          
          {todayInspections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No inspections completed today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
