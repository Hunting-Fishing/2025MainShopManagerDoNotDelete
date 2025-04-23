
import React from 'react';
import { format, isPast, isToday, isSameDay } from 'date-fns';
import { CalendarDayProps } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { WorkOrderCalendarEvent } from './WorkOrderCalendarEvent';
import { CalendarCheck } from 'lucide-react'; // Use allowed icons

export function CalendarDay({ 
  date, 
  isCurrentMonth = true, 
  isToday = false, 
  events, 
  onEventClick,
  currentTime,
  shiftChats 
}: CalendarDayProps) {
  const dayNumber = format(date, 'd');
  const now = new Date();

  // Check if this day is in the past (before today, ignore time)
  const simpleToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const simpleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isPastDay = simpleDate < simpleToday;
  const isActiveDay = isToday || (currentTime && isSameDay(date, currentTime));
  const isFutureDay = simpleDate > simpleToday;

  // Find if the day has a carry-over/Uninvoiced work order
  const carryOverWorkOrder = events.find(event =>
    (event.type === 'work-order' || event.work_order_id) &&
    ((new Date(event.start) < simpleDate && new Date(event.end) >= simpleDate) || // Spans over this day
      isSameDay(new Date(event.start), date)
    ) &&
    (!event.invoice_id) // Not invoiced
  );

  // Style classes
  const dayBgClass = !isCurrentMonth
    ? "bg-gray-50/50 text-gray-400"
    : isPastDay
      ? "bg-[#ea384c22] text-[#ea384c] border-[#ea384c66]" // soft red bg/text/border
      : isActiveDay
        ? "bg-green-100 text-green-900 border-green-300"
        : isFutureDay
          ? "bg-white"
          : "";

  return (
    <div className={cn(
      "h-full min-h-[8rem] border p-1 relative transition-colors",
      dayBgClass
    )}>
      {/* Floating carry-over icon for carry-over and not invoiced */}
      {carryOverWorkOrder && (
        <div className="absolute top-2 right-2 z-10" title="Carry-over Un-Invoiced Work Order">
          <CalendarCheck className="w-4 h-4 text-blue-600 animate-pulse" />
        </div>
      )}
      <p className={cn(
        "text-xs font-medium text-right p-1",
        isActiveDay && "bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto"
      )}>
        {dayNumber}
      </p>
      <div className="space-y-1 mt-1 max-h-[calc(100%-2rem)] overflow-y-auto">
        {/* Render work order events first with special styling */}
        {events
          .filter(event => event.type === 'work-order' || event.work_order_id)
          .map((event) => (
            <WorkOrderCalendarEvent 
              key={event.id} 
              event={event} 
              onClick={onEventClick ? () => onEventClick(event) : undefined}
            />
        ))}
        
        {/* Render other events with normal styling */}
        {events
          .filter(event => event.type !== 'work-order' && !event.work_order_id)
          .map((event) => (
            <div 
              key={event.id}
              className="bg-gray-100 text-xs p-1 rounded truncate border border-gray-200 cursor-pointer"
              onClick={onEventClick ? () => onEventClick(event) : undefined}
            >
              {event.title}
            </div>
        ))}
      </div>
    </div>
  );
}
