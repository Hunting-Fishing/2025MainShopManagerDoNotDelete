
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
import { ChatRoom } from "@/types/chat";
import { useEffect as useReactEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; // Assuming you have this

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
}

export function CalendarView({ events, currentDate, view }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [now, setNow] = useState(new Date());
  const [shiftChats, setShiftChats] = useState<ChatRoom[]>([]);

  // Update current time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch shift chats
  useReactEffect(() => {
    // This would be replaced with your real API call
    const fetchShiftChats = async () => {
      try {
        // Mock data for now - replace with actual Supabase call when ready
        // const { data, error } = await supabase
        //   .from('chat_rooms')
        //   .select('*')
        //   .eq('is_shift_chat', true);
        
        // If using mock data for now
        const mockShiftChats: ChatRoom[] = [
          {
            id: "shift-chat-1",
            name: "Morning Shift - Team A",
            type: "group",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              is_shift_chat: true,
              shift_date: format(new Date(), 'yyyy-MM-dd'),
              shift_name: "Morning Shift",
              shift_time: {
                start: "08:00",
                end: "16:00"
              }
            }
          },
          {
            id: "shift-chat-2",
            name: "Afternoon Shift - Team B",
            type: "group",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              is_shift_chat: true,
              shift_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
              shift_name: "Afternoon Shift",
              shift_time: {
                start: "16:00",
                end: "00:00"
              }
            }
          }
        ];
        
        setShiftChats(mockShiftChats);
      } catch (error) {
        console.error("Error fetching shift chats:", error);
      }
    };

    fetchShiftChats();
  }, [currentDate]);

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
            shiftChats={shiftChats}
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
