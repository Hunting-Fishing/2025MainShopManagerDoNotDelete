
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarViewType } from '@/types/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { events, shiftChats, isLoading, error } = useCalendarEvents(currentDate, view);

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // Filter by technician
    if (technicianFilter !== 'all' && event.technician !== technicianFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter.length > 0 && !statusFilter.includes(event.status || '')) {
      return false;
    }
    
    return true;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <CalendarHeader 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />
        
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading calendar events: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />
      
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All calendar data is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>

      <CalendarFilters
        technicianFilter={technicianFilter}
        setTechnicianFilter={setTechnicianFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading calendar events from database...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <CalendarView
            events={filteredEvents}
            currentDate={currentDate}
            view={view}
            loading={isLoading}
            shiftChats={shiftChats}
          />
        </div>
      )}
    </div>
  );
}
