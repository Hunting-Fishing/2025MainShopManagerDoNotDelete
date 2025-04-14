
import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CreateShiftChatButton } from "@/components/calendar/CreateShiftChatButton";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { CalendarEvent } from "@/types/calendar/events"; // Import from events.ts specifically

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Use the custom hook to fetch and manage calendar data
  const { events, shiftChats, isLoading, error } = useCalendarEvents(currentDate, view);
  
  // Filter events based on technician and status
  const filteredEvents = events.filter(event => {
    const matchesTechnician = 
      technicianFilter === "all" || event.technician_id === technicianFilter;
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(event.status || '');
    
    return matchesTechnician && matchesStatus;
  });

  // Handle creating a new shift chat from calendar
  const handleCreateShiftChat = () => {
    // Navigate to chat page with pre-filled shift chat date from calendar
    navigate("/chat", { 
      state: { 
        createShiftChat: true, 
        shiftDate: format(currentDate, 'yyyy-MM-dd')
      } 
    });
  };

  // Show toast when there's an error
  if (error) {
    toast({
      title: "Error loading calendar",
      description: error,
      variant: "destructive"
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CalendarHeader 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />
        
        <CreateShiftChatButton onClick={handleCreateShiftChat} />
      </div>
      
      <CalendarFilters 
        technicianFilter={technicianFilter}
        setTechnicianFilter={setTechnicianFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <div className="border rounded-lg bg-white shadow">
        <CalendarView 
          events={filteredEvents}
          currentDate={currentDate}
          view={view}
          loading={isLoading}
          shiftChats={shiftChats}
        />
      </div>
    </div>
  );
}
