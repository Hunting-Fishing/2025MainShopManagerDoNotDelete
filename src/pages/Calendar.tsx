
import { useState, useEffect } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { workOrders } from "@/data/workOrdersData";
import { CalendarEvent } from "@/types/calendar";
import { CreateShiftChatButton } from "@/components/calendar/CreateShiftChatButton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Create calendar events from work orders
  const calendarEvents = workOrders.map(order => ({
    id: order.id,
    title: order.description,
    start: new Date(order.date),
    end: new Date(order.dueDate),
    customer: order.customer,
    status: order.status,
    priority: order.priority,
    technician: order.technician,
    location: order.location,
    type: 'work-order' as const
  }));

  // Filter events based on technician and status
  const filteredEvents = calendarEvents.filter(event => {
    const matchesTechnician = 
      technicianFilter === "all" || event.technician === technicianFilter;
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(event.status);
    
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
        />
      </div>
    </div>
  );
}
