
import { useState } from "react";
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
  isSameDay
} from "date-fns";
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarEventDialog } from "./CalendarEventDialog";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
}

export function CalendarView({ events, currentDate, view }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Open event details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Close event details
  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="h-[800px] overflow-auto">
      {view === "month" && (
        <CalendarMonthView 
          currentDate={currentDate} 
          events={events} 
          onEventClick={handleEventClick}
        />
      )}
      
      {view === "week" && (
        <CalendarWeekView 
          currentDate={currentDate} 
          events={events} 
          onEventClick={handleEventClick}
        />
      )}
      
      {view === "day" && (
        <CalendarDayView 
          currentDate={currentDate} 
          events={events} 
          onEventClick={handleEventClick}
        />
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
