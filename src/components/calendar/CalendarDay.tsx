
import React from 'react';
import { format } from 'date-fns';
import { CalendarDayProps } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { WorkOrderCalendarEvent } from './WorkOrderCalendarEvent';

export function CalendarDay({ date, isCurrentMonth = true, isToday = false, events }: CalendarDayProps) {
  const dayNumber = format(date, 'd');
  const workOrderEvents = events.filter(event => event.type === 'work-order' || event.work_order_id);
  const otherEvents = events.filter(event => event.type !== 'work-order' && !event.work_order_id);
  
  // Sort events by priority (high, medium, low) and then by start time
  const sortedWorkOrderEvents = [...workOrderEvents].sort((a, b) => {
    // First by priority
    const priorityOrder: Record<string, number> = { 'high': 0, 'medium': 1, 'low': 2 };
    const aPriority = priorityOrder[a.priority || 'medium'] || 1;
    const bPriority = priorityOrder[b.priority || 'medium'] || 1;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then by start time
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  return (
    <div className={cn(
      "h-full min-h-[8rem] border border-gray-200 p-1",
      !isCurrentMonth && "bg-gray-50/50 text-gray-400",
      isToday && "bg-blue-50/50",
    )}>
      <p className={cn(
        "text-xs font-medium text-right p-1",
        isToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto"
      )}>
        {dayNumber}
      </p>
      <div className="space-y-1 mt-1 max-h-[calc(100%-2rem)] overflow-y-auto">
        {/* Render work order events first with special styling */}
        {sortedWorkOrderEvents.map((event) => (
          <WorkOrderCalendarEvent key={event.id} event={event} />
        ))}
        
        {/* Render other events with normal styling */}
        {otherEvents.map((event) => (
          <div 
            key={event.id}
            className="bg-gray-100 text-xs p-1 rounded truncate border border-gray-200 cursor-pointer"
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}
