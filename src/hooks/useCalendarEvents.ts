
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
        const [calendarEvents, workOrderEvents, shiftChatsData] = await Promise.all([
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

        // Combine and format all events for the calendar
        const formattedEvents = [
          ...calendarEvents,
          ...workOrderEvents.filter(wo => {
            // Only include work orders that aren't already in calendar_events
            return !calendarEvents.some(event => 
              event.work_order_id === wo.id && event.event_type === 'work-order'
            );
          })
        ].map(event => ({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time)
        }));

        setEvents(formattedEvents);
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
