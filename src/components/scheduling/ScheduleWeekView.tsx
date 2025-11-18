import React from 'react';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { WorkScheduleAssignment } from '@/types/scheduling';

interface ScheduleWeekViewProps {
  schedules: WorkScheduleAssignment[];
  weekStart: Date;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleWeekView({ schedules, weekStart }: ScheduleWeekViewProps) {
  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedules.filter(s => s.day_of_week === dayOfWeek);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS.map((day, index) => {
        const date = addDays(weekStart, index);
        const daySchedules = getSchedulesForDay(index);

        return (
          <div key={day} className="border rounded-lg p-3 min-h-[200px]">
            <div className="font-medium text-sm mb-2">
              <div>{day.slice(0, 3)}</div>
              <div className="text-xs text-muted-foreground">
                {format(date, 'M/d')}
              </div>
            </div>
            <div className="space-y-2">
              {daySchedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="bg-primary/10 rounded p-2 text-xs"
                >
                  <div className="font-medium">
                    {schedule.profiles?.first_name} {schedule.profiles?.last_name}
                  </div>
                  <div className="text-muted-foreground">
                    {schedule.shift_start} - {schedule.shift_end}
                  </div>
                  {schedule.schedule_name && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {schedule.schedule_name}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
