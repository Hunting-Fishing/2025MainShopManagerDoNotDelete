
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday
} from "date-fns";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/calendar";
import { ChatRoom } from "@/types/chat";

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentTime?: Date;
  shiftChats?: ChatRoom[];
  onDateClick?: (date: Date) => void; // Add new prop
  isCustomerView?: boolean; // Add new prop
}

export function CalendarMonthView({ 
  currentDate, 
  events, 
  onEventClick,
  currentTime = new Date(),
  shiftChats = [],
  onDateClick,
  isCustomerView = false
}: CalendarMonthViewProps) {
  // Get days in month view (including days from previous/next month to fill the grid)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInMonth = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Group events by day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Check if the day falls within the event's time range
      return date >= startOfWeek(eventStart) && date <= endOfWeek(eventEnd);
    });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {daysInMonth.map((day, i) => {
          // Get events for this day
          const dayEvents = getEventsForDay(day);
          
          return (
            <CalendarDay
              key={i}
              date={day}
              events={dayEvents}
              isCurrentMonth={isSameMonth(day, monthStart)}
              isToday={isToday(day)}
              onEventClick={onEventClick}
              onDateClick={onDateClick}
              currentTime={currentTime}
              shiftChats={shiftChats}
              isCustomerView={isCustomerView}
            />
          );
        })}
      </div>
    </div>
  );
}
