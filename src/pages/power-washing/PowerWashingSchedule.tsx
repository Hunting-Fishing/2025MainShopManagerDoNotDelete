import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  User,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 6); // 6 AM to 5 PM

export default function PowerWashingSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .not('first_name', 'is', null);
      if (error) throw error;
      return data;
    }
  });

  const { data: slots, isLoading } = useQuery({
    queryKey: ['power-washing-schedule-slots', weekStart, weekEnd, selectedEmployee],
    queryFn: async () => {
      let query = supabase
        .from('power_washing_schedule_slots')
        .select('*, profiles(first_name, last_name), power_washing_jobs(job_number, property_address)')
        .gte('slot_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('slot_date', format(weekEnd, 'yyyy-MM-dd'));
      
      if (selectedEmployee !== 'all') {
        query = query.eq('employee_id', selectedEmployee);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: jobs } = useQuery({
    queryKey: ['power-washing-jobs-scheduled', weekStart, weekEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('power_washing_jobs')
        .select('*, customers(first_name, last_name)')
        .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('scheduled_date');
      if (error) throw error;
      return data;
    }
  });

  const getJobsForDay = (day: Date) => {
    return jobs?.filter(job => 
      job.scheduled_date && isSameDay(new Date(job.scheduled_date), day)
    ) || [];
  };

  const getSlotsForDayAndHour = (day: Date, hour: number) => {
    return slots?.filter(slot => {
      const slotDate = new Date(slot.slot_date);
      const slotHour = parseInt(slot.start_time?.split(':')[0] || '0');
      return isSameDay(slotDate, day) && slotHour === hour;
    }) || [];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-blue-500" />
            Schedule
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee schedules and job assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button variant="link" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 border-r bg-muted/50">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {weekDays.map((day) => (
                    <div 
                      key={day.toISOString()} 
                      className={`p-3 text-center border-r ${
                        isSameDay(day, new Date()) ? 'bg-primary/10' : 'bg-muted/50'
                      }`}
                    >
                      <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                      <p className={`text-lg ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </p>
                      <div className="mt-2 space-y-1">
                        {getJobsForDay(day).slice(0, 2).map((job) => (
                          <Badge key={job.id} variant="secondary" className="text-xs truncate max-w-full">
                            {job.job_number}
                          </Badge>
                        ))}
                        {getJobsForDay(day).length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{getJobsForDay(day).length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b">
                    <div className="p-2 border-r text-sm text-muted-foreground">
                      {format(new Date().setHours(hour, 0), 'h a')}
                    </div>
                    {weekDays.map((day) => {
                      const daySlots = getSlotsForDayAndHour(day, hour);
                      return (
                        <div 
                          key={`${day.toISOString()}-${hour}`} 
                          className="p-1 border-r min-h-[60px] hover:bg-muted/30 transition-colors"
                        >
                          {daySlots.map((slot) => (
                            <div 
                              key={slot.id} 
                              className={`p-1 rounded text-xs mb-1 ${
                                slot.slot_type === 'available' 
                                  ? 'bg-green-500/20 text-green-700' 
                                  : 'bg-blue-500/20 text-blue-700'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate">
                                  {slot.profiles?.first_name}
                                </span>
                              </div>
                              {slot.power_washing_jobs && (
                                <p className="truncate opacity-75">{slot.power_washing_jobs.job_number}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
