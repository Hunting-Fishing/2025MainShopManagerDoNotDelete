
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isToday,
  isSameDay,
  isPast,
  set
} from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { priorityMap } from "@/types/workOrder"; // Updated import
import { ChatRoom } from "@/types/chat";

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentTime?: Date;
  shiftChats?: ChatRoom[];
}

export function CalendarWeekView({ 
  currentDate, 
  events, 
  onEventClick,
  currentTime = new Date(),
  shiftChats = []
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

  const now = currentTime;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
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
              isToday(day) && "bg-blue-50",
              isPast(day) && !isToday(day) && "bg-red-50 bg-opacity-30"
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
        {timeSlots.map((hour) => {
          return (
            <div key={hour} className="grid grid-cols-8 border-b">
              {/* Time label */}
              <div className={cn(
                "p-2 text-right text-sm", 
                hour < currentHour ? "text-gray-400" : "text-slate-500"
              )}>
                {hour}:00
              </div>

              {/* Day columns */}
              {daysInWeek.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day).filter(event => {
                  const eventHour = new Date(event.start).getHours();
                  return eventHour === hour;
                });

                // Check if this day is in the past
                const isPastDay = isPast(day) && !isToday(day);
                
                // Check if this is the current day and hour
                const isCurrentDayAndHour = isToday(day) && hour === currentHour;
                
                // Check if this hour is fully in the past for today
                const isFullyPastHour = isToday(day) && hour < currentHour;

                return (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "border-l min-h-[80px] p-1 relative",
                      isToday(day) && "bg-blue-50",
                      isPastDay && "bg-red-50 bg-opacity-30"
                    )}
                  >
                    {/* Current hour partial overlay */}
                    {isCurrentDayAndHour && (
                      <div 
                        className="absolute left-0 top-0 bg-red-50 bg-opacity-20 pointer-events-none"
                        style={{
                          width: '100%',
                          height: `${(currentMinute / 60) * 100}%`
                        }}
                      ></div>
                    )}
                    
                    {/* Past day overlay */}
                    {isPastDay && (
                      <div className="absolute inset-0 bg-red-100 bg-opacity-20 pointer-events-none"></div>
                    )}
                    
                    {/* Fully past hour overlay for current day */}
                    {isFullyPastHour && (
                      <div className="absolute inset-0 bg-red-100 bg-opacity-20 pointer-events-none"></div>
                    )}
                    
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "px-2 py-1 text-xs rounded mb-1 cursor-pointer relative z-10",
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
          );
        })}
      </div>
    </div>
  );
}
