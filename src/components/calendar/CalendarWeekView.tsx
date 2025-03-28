
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isToday,
  isSameDay
} from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { priorityMap } from "@/data/workOrdersData";

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarWeekView({ 
  currentDate, 
  events, 
  onEventClick 
}: CalendarWeekViewProps) {
  // Get days in week
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(weekStart);
  
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // Group events by day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Check if this day falls within the event timeframe
      return (
        (eventStart <= date && eventEnd >= date) ||
        isSameDay(eventStart, date) ||
        isSameDay(eventEnd, date)
      );
    });
  };

  // Time slots for the week view (8am to 6pm)
  const timeSlots = Array.from({ length: 11 }, (_, i) => 8 + i);

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        <div className="py-2 text-center font-medium"></div>
        {daysInWeek.map((day, i) => (
          <div 
            key={i} 
            className={cn(
              "py-2 text-center font-medium",
              isToday(day) && "bg-blue-50"
            )}
          >
            <div>{format(day, "EEE")}</div>
            <div className={cn(
              "text-sm",
              isToday(day) && "rounded-full bg-blue-600 text-white h-6 w-6 mx-auto flex items-center justify-center"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="relative">
        {timeSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            {/* Time label */}
            <div className="p-2 text-right text-sm text-slate-500">
              {hour}:00
            </div>

            {/* Day columns */}
            {daysInWeek.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day).filter(event => {
                const eventHour = new Date(event.start).getHours();
                return eventHour === hour;
              });

              return (
                <div 
                  key={dayIndex} 
                  className={cn(
                    "border-l min-h-[80px] p-1",
                    isToday(day) && "bg-blue-50"
                  )}
                >
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "px-2 py-1 text-xs rounded mb-1 cursor-pointer",
                        priorityMap[event.priority].classes.replace("text-xs font-medium", "")
                      )}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-[10px] truncate">{event.technician}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
