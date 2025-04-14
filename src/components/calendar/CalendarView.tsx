
import { useState, useEffect } from "react";
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarEventDialog } from "./CalendarEventDialog";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { ChatRoom } from "@/types/chat";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
  loading?: boolean;
  shiftChats?: ChatRoom[];
}

export function CalendarView({ 
  events, 
  currentDate, 
  view,
  loading = false,
  shiftChats = []
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
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
    setShowEventDialog(true);
  };

  // Close event details
  const handleCloseDialog = () => {
    setShowEventDialog(false);
    setSelectedEvent(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-[800px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500">Loading calendar events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px] overflow-auto relative">
      {view === "month" && (
        <CalendarMonthView 
          currentDate={currentDate} 
          events={events} 
          onEventClick={handleEventClick}
          currentTime={now}
          shiftChats={shiftChats}
        />
      )}
      
      {view === "week" && (
        <>
          <CalendarWeekView 
            currentDate={currentDate} 
            events={events} 
            onEventClick={handleEventClick}
            currentTime={now}
            shiftChats={shiftChats}
          />
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
            shiftChats={shiftChats}
          />
          <CurrentTimeIndicator currentTime={now} view="day" />
        </>
      )}

      <CalendarEventDialog 
        event={selectedEvent} 
        isOpen={showEventDialog} 
        onClose={handleCloseDialog} 
      />
    </div>
  );
}
