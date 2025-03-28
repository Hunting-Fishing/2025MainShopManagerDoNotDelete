
import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { workOrders } from "@/data/workOrdersData";
import { CalendarEvent } from "@/types/calendar";

export default function Calendar() {
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

  return (
    <div className="space-y-6">
      <CalendarHeader 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />
      
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
