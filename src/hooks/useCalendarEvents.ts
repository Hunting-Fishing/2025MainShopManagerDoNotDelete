
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar/events';
import { getCalendarEvents, getWorkOrderEvents } from '@/services/calendar/calendarEventService';
import { getShiftChats } from '@/services/calendar/shiftChatService';
import { ChatRoom } from '@/types/chat';
import { format, startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek } from 'date-fns';

export function useCalendarEvents(currentDate: Date, view: 'month' | 'week' | 'day') {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shiftChats, setShiftChats] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
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
        } else { // day view
          startDate = currentDate;
          endDate = currentDate;
        }

        // Format dates for API calls
        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');

        // Fetch calendar events
        const [dbCalendarEvents, dbWorkOrderEvents, shiftChatsData] = await Promise.all([
          getCalendarEvents(startDateStr, endDateStr),
          getWorkOrderEvents(),
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

        // Transform database events to CalendarEvent format for UI
        const calendarEvents: CalendarEvent[] = dbCalendarEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          allDay: event.all_day,
          description: event.description,
          location: event.location || '',
          status: event.status || '',
          priority: event.priority || 'medium',
          customer: event.customer || '',
          technician: event.technician || '',
          type: event.event_type,
          workOrderId: event.work_order_id,
        }));

        // Transform work order events to CalendarEvent format
        const workOrderEvents: CalendarEvent[] = dbWorkOrderEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          allDay: event.all_day || false,
          description: event.description,
          location: event.location || '',
          status: event.status || '',
          priority: event.priority || 'medium',
          customer: event.customer || '',
          technician: event.technician || '',
          type: 'work-order',
          workOrderId: event.id,
        }));

        // Combine and filter events
        const combinedEvents = [
          ...calendarEvents,
          ...workOrderEvents.filter(wo => {
            return !calendarEvents.some(event => 
              event.workOrderId === wo.id && event.type === 'work-order'
            );
          })
        ];

        setEvents(combinedEvents);
        setShiftChats(formattedShiftChats);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load calendar data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate, view]);

  return { events, shiftChats, isLoading, error };
}
