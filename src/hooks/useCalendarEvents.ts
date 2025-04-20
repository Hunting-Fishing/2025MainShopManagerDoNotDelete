
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarEvent, ShiftChat } from '@/types/calendar/events';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export function useCalendarEvents(currentDate: Date, view: 'month' | 'week' | 'day') {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shiftChats, setShiftChats] = useState<ShiftChat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let startDate: Date;
        let endDate: Date;
        
        // Calculate date range based on view
        if (view === 'month') {
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
        } else if (view === 'week') {
          startDate = startOfWeek(currentDate);
          endDate = endOfWeek(currentDate);
        } else {
          // day view
          startDate = currentDate;
          endDate = addDays(currentDate, 1);
        }
        
        // Format dates for query
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        
        // Fetch calendar events
        const { data: calendarEvents, error: calendarError } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', formattedStartDate)
          .lte('start_time', formattedEndDate);
          
        if (calendarError) throw calendarError;
        
        // Fetch shift chats for the same period
        const { data: shiftChatData, error: shiftError } = await supabase
          .from('shift_chats')
          .select('*')
          .gte('shift_date', formattedStartDate)
          .lte('shift_date', formattedEndDate);
          
        if (shiftError) throw shiftError;
        
        // Map the database results to our CalendarEvent type
        const mappedEvents: CalendarEvent[] = calendarEvents.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          allDay: event.all_day,
          description: event.description,
          location: event.location,
          workOrderId: event.work_order_id,
          status: event.status,
          priority: event.priority,
          customer: event.customer,
          technician_id: event.technician_id,
          type: event.event_type,
          // Include the original fields for compatibility
          all_day: event.all_day,
          start_time: event.start_time,
          end_time: event.end_time,
          customer_id: event.customer_id,
          work_order_id: event.work_order_id
        }));
        
        setEvents(mappedEvents);
        setShiftChats(shiftChatData || []);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError(err instanceof Error ? err.message : 'Error fetching calendar data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentDate, view]);

  return { events, shiftChats, isLoading, error };
}
