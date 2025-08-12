
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { getCalendarEvents, getWorkOrderEvents } from '@/services/calendar/calendarEventService';
import { getShiftChats } from '@/services/calendar/shiftChatService';
import { ChatRoom } from '@/types/chat';
import { format, startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export function useCalendarEvents(currentDate: Date, view: 'month' | 'week' | 'day') {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shiftChats, setShiftChats] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine date range based on view
      let startDate: Date, endDate: Date;
      if (view === 'month') {
        startDate = startOfWeek(startOfMonth(currentDate));
        endDate = endOfWeek(endOfMonth(currentDate));
      } else if (view === 'week') {
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
      } else {
        startDate = currentDate;
        endDate = currentDate;
      }

      // Format dates for API calls
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Fetch calendar events (DB + work orders + shift chats)
      const [calendarEvents, workOrderEvents, shiftChatsData] = await Promise.all([
        getCalendarEvents(startDateStr, endDateStr),
        getWorkOrderEvents(startDateStr, endDateStr),
        getShiftChats(startDateStr, endDateStr)
      ]);

      // Format shift chats as ChatRoom objects for the calendar
      const formattedShiftChats: ChatRoom[] = shiftChatsData.map(shift => ({
        id: shift.chat_room_id,
        name: shift.shift_name,
        type: 'group',
        created_at: shift.created_at,
        updated_at: shift.updated_at,
        metadata: {
          is_shift_chat: true,
          shift_date: shift.shift_date,
          shift_name: shift.shift_name,
          shift_time: {
            start: shift.start_time,
            end: shift.end_time
          }
        }
      }));

      // Combine and format all events for the calendar
      const formattedEvents: CalendarEvent[] = [
        ...calendarEvents,
        ...workOrderEvents.filter(wo =>
          !calendarEvents.some(event => event.workOrderId === wo.id && event.type === 'work-order')
        )
      ].map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time || event.start,
        end: event.end_time || event.end,
        customer: event.customer || '',
        status: event.status,
        priority: event.priority,
        technician: event.technician || '',
        location: event.location || '',
        type: event.event_type || event.type || 'event',
        description: event.description,
        workOrderId: event.work_order_id || event.workOrderId,
        allDay: event.all_day || event.allDay,
        technician_id: event.technician_id,
        customer_id: event.customer_id,
        work_order_id: event.work_order_id || event.workOrderId
      }));

      setEvents(formattedEvents);
      setShiftChats(formattedShiftChats);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Realtime updates: refetch when calendar_events or work_orders change
  useEffect(() => {
    const channel = supabase
      .channel('calendar-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        console.log('Realtime: calendar_events changed');
        fetchCalendarData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () => {
        console.log('Realtime: work_orders changed');
        fetchCalendarData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCalendarData]);

  return { events, shiftChats, isLoading, error };
}
