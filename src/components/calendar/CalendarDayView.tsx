
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { priorityMap } from "@/data/workOrdersData";

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarDayView({ 
  currentDate, 
  events, 
  onEventClick 
}: CalendarDayViewProps) {
  // Filter events for the current day
  const dayEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    return (
      (eventStart <= currentDate && eventEnd >= currentDate) ||
      isSameDay(eventStart, currentDate) ||
      isSameDay(eventEnd, currentDate)
    );
  });

  // Group events by hour
  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventHour = new Date(event.start).getHours();
      return eventHour === hour;
    });
  };

  // Time slots for the day view (8am to 6pm)
  const timeSlots = Array.from({ length: 11 }, (_, i) => 8 + i);

  return (
    <div className="w-full">
      {/* Day header */}
      <div className="py-4 text-center font-bold text-lg border-b">
        {format(currentDate, "EEEE, MMMM d, yyyy")}
      </div>

      {/* Time slots */}
      <div>
        {timeSlots.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div key={hour} className="grid grid-cols-12 border-b">
              {/* Time */}
              <div className="col-span-1 p-3 text-right text-slate-500">
                {hour}:00
              </div>

              {/* Events */}
              <div className="col-span-11 p-2 min-h-[100px] border-l">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "px-3 py-2 text-sm rounded mb-2 cursor-pointer",
                      priorityMap[event.priority].classes.replace("text-xs font-medium", "")
                    )}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="flex justify-between mt-1">
                      <span>{event.customer}</span>
                      <span>{event.technician}</span>
                    </div>
                  </div>
                ))}

                {hourEvents.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-300 italic">
                    No scheduled events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
