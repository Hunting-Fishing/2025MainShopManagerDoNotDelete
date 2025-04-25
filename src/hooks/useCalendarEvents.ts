
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatISO } from 'date-fns';
import { CalendarEvent } from '@/types/calendar/events';

export const useCalendarEvents = (
  startDate?: Date,
  endDate?: Date,
  filters?: {
    technicians?: string[];
    customers?: string[];
    types?: string[];
  }
) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build the query
      let query = supabase
        .from('calendar_events')
        .select('*');

      // Add date range filters if provided
      if (startDate) {
        query = query.gte('start_time', formatISO(startDate));
      }
      if (endDate) {
        query = query.lte('start_time', formatISO(endDate));
      }

      // Add other filters
      if (filters?.technicians && filters.technicians.length > 0) {
        query = query.in('technician_id', filters.technicians);
      }
      if (filters?.customers && filters.customers.length > 0) {
        query = query.in('customer_id', filters.customers);
      }
      if (filters?.types && filters.types.length > 0) {
        query = query.in('event_type', filters.types);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Map to the CalendarEvent type, including customer name
      const mappedEvents: CalendarEvent[] = await Promise.all((data || []).map(async (event) => {
        // Get customer name if customer_id is available
        let customerName = "";
        if (event.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('first_name, last_name')
            .eq('id', event.customer_id)
            .single();
          
          if (customerData) {
            customerName = `${customerData.first_name} ${customerData.last_name}`;
          }
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          start: event.start_time,
          end: event.end_time,
          all_day: event.all_day,
          location: event.location,
          type: event.event_type,
          status: event.status,
          priority: event.priority,
          technician_id: event.technician_id,
          customer_id: event.customer_id,
          work_order_id: event.work_order_id,
          customer: customerName
        };
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filters]);

  // Use effect to fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refreshEvents: fetchEvents };
};
