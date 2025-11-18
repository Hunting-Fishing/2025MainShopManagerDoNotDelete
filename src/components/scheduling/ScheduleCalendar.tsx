import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { useScheduling } from '@/hooks/useScheduling';
import { AddScheduleDialog } from './AddScheduleDialog';
import { ScheduleWeekView } from './ScheduleWeekView';

export function ScheduleCalendar() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { schedules, loading } = useScheduling();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Schedule</CardTitle>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Week of {format(currentWeek, 'MMM d, yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading schedules...</div>
          ) : (
            <ScheduleWeekView schedules={schedules} weekStart={currentWeek} />
          )}
        </CardContent>
      </Card>

      <AddScheduleDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
