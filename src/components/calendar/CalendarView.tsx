
import { useState, useEffect } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addDays,
  getDay,
  parse,
  startOfDay,
  endOfDay,
  isSameDay,
  isPast
} from "date-fns";
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarEventDialog } from "./CalendarEventDialog";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
}

export function CalendarView({ events, currentDate, view }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [now, setNow] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Open event details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Close event details
  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="h-[800px] overflow-auto relative">
      {view === "month" && (
        <CalendarMonthView 
          currentDate={currentDate} 
          events={events} 
          onEventClick={handleEventClick}
          currentTime={now}
        />
      )}
      
      {view === "week" && (
        <>
          <CalendarWeekView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
            currentTime={now}
          />
          {/* Current time indicator for week view */}
          <CurrentTimeIndicator currentTime={now} view="week" />
        </>
      )}
      
      {view === "day" && (
        <>
          <CalendarDayView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
            currentTime={now}
          />
          {/* Current time indicator for day view */}
          <CurrentTimeIndicator currentTime={now} view="day" />
        </>
      )}

      {selectedEvent && (
        <CalendarEventDialog 
          event={selectedEvent} 
          open={!!selectedEvent} 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
}
