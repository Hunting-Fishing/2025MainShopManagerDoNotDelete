
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { CalendarDayDetailDialog } from '@/components/calendar/CalendarDayDetailDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { CalendarViewType, CalendarEvent } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { isSameDay, isBefore, startOfDay } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { events, shiftChats, isLoading, error } = useCalendarEvents(currentDate, view);
  const { businessHours, isBusinessDay } = useBusinessHours();

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // Technician filter (using technician_id now instead of name)
    if (technicianFilter !== "all" && event.technician_id !== technicianFilter) {
      return false;
    }
    
    // Equipment filter - check if event has equipment in title or description
    if (equipmentFilter !== "all") {
      const eventText = `${event.title} ${event.description || ''}`.toLowerCase();
      if (!eventText.includes(equipmentFilter.toLowerCase())) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter.length > 0 && event.status && !statusFilter.includes(event.status)) {
      return false;
    }
    
    return true;
  });

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? filteredEvents.filter(event => 
        isSameDay(new Date(event.start), selectedDate)
      )
    : [];

  // Get carry-over events (past unfinished jobs)
  const carryOverEvents = selectedDate
    ? filteredEvents.filter(event => {
        const eventDate = startOfDay(new Date(event.start));
        const selected = startOfDay(selectedDate);
        const isBeforeSelected = isBefore(eventDate, selected);
        const isNotCompleted = event.status !== 'completed' && event.status !== 'cancelled';
        return isBeforeSelected && isNotCompleted;
      })
    : [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDetailDialog = () => {
    setSelectedDate(null);
  };

  const handleEventClickFromDetail = (event: CalendarEvent) => {
    // This will open the regular event dialog through CalendarView
    setSelectedDate(null);
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Calendar</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />
      
      <div className="space-y-4">
        <CalendarFilters
          technicianFilter={technicianFilter}
          setTechnicianFilter={setTechnicianFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          equipmentFilter={equipmentFilter}
          setEquipmentFilter={setEquipmentFilter}
          businessHours={businessHours}
          currentDate={currentDate}
        />
        
        <CalendarView
          events={filteredEvents}
          currentDate={currentDate}
          view={view}
          loading={isLoading}
          shiftChats={shiftChats}
          businessHours={businessHours}
          isBusinessDay={isBusinessDay}
          onDateClick={handleDateClick}
        />
      </div>

      <CalendarDayDetailDialog
        date={selectedDate}
        events={selectedDateEvents}
        carryOverEvents={carryOverEvents}
        isOpen={!!selectedDate}
        onClose={handleCloseDetailDialog}
        onEventClick={handleEventClickFromDetail}
      />
    </div>
  );
}
