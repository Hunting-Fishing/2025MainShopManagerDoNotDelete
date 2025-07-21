
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { BusinessHoursInfo } from '@/components/calendar/BusinessHoursInfo';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { CalendarViewType } from '@/types/calendar';
import { Card } from '@/components/ui/card';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { events, shiftChats, isLoading, error } = useCalendarEvents(currentDate, view);
  const { businessHours, isBusinessDay } = useBusinessHours();

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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
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
            businessHours={businessHours}
            isBusinessDay={isBusinessDay}
          />
        </div>
        
        <div className="lg:col-span-1">
          <BusinessHoursInfo 
            businessHours={businessHours}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  );
}
