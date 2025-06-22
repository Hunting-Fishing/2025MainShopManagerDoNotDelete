
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarViewType } from '@/types/calendar';
import { Card } from '@/components/ui/card';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { events, shiftChats, isLoading, error } = useCalendarEvents(currentDate, view);

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // Technician filter
    if (technicianFilter !== "all" && event.technician !== technicianFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter.length > 0 && event.status && !statusFilter.includes(event.status)) {
      return false;
    }
    
    return true;
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Calendar</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
      
      <CalendarView
        events={filteredEvents}
        currentDate={currentDate}
        view={view}
        loading={isLoading}
        shiftChats={shiftChats}
      />
    </div>
  );
}
