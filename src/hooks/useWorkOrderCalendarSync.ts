
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { CalendarEvent } from '@/types/calendar';
import { updateCalendarEvent, createCalendarEvent } from '@/services/calendar/calendarEventService';
import { toast } from '@/components/ui/use-toast';

// Define type for DbCalendarEvent with all_day as a required property
interface DbCalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean; // Explicitly required
  location?: string;
  customer_id?: string;
  work_order_id?: string;
  technician_id?: string;
  event_type: "work-order" | "appointment" | "reminder" | "event" | "other";
  status?: string;
  priority?: string;
}

// Helper function to convert DbCalendarEvent to CalendarEvent
const convertToCalendarEvent = (dbEvent: DbCalendarEvent): CalendarEvent => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    start: dbEvent.start_time,
    end: dbEvent.end_time,
    all_day: dbEvent.all_day,
    location: dbEvent.location,
    customer_id: dbEvent.customer_id,
    work_order_id: dbEvent.work_order_id,
    technician_id: dbEvent.technician_id,
    type: dbEvent.event_type,
    status: dbEvent.status,
    priority: dbEvent.priority
  };
};

/**
 * This hook manages synchronization between work orders and calendar events
 */
export function useWorkOrderCalendarSync(workOrder: WorkOrder | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(null);
  
  // Function to sync work order with calendar
  const syncWithCalendar = async () => {
    if (!workOrder) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If work order doesn't have start_time, we can't sync
      if (!workOrder.startTime) {
        throw new Error('Work order must have a scheduled time to sync with calendar');
      }
      
      // Convert work order to calendar event format
      const eventData: DbCalendarEvent = {
        title: workOrder.description || `Work Order #${workOrder.id.substring(0, 8)}`,
        description: workOrder.notes || '',
        start_time: workOrder.startTime,
        end_time: workOrder.endTime || workOrder.startTime, // Use start time as fallback
        all_day: false, // Make sure this is always defined
        location: workOrder.location || '',
        customer_id: workOrder.customer_id,
        work_order_id: workOrder.id,
        technician_id: workOrder.technician_id,
        event_type: "work-order", // Use specific literal type
        status: workOrder.status,
        priority: workOrder.priority
      };
      
      // Create or update the calendar event
      // Check if this work order has already been synced with a calendar event
      if (calendarEvent?.id) {
        // Update existing event
        const updated = await updateCalendarEvent(calendarEvent.id, eventData);
        if (updated) {
          setCalendarEvent(convertToCalendarEvent(updated));
          toast({
            title: "Calendar Updated",
            description: "Work order has been updated in the calendar",
          });
        }
      } else {
        // Create new event
        const created = await createCalendarEvent(eventData);
        if (created) {
          setCalendarEvent(convertToCalendarEvent(created));
          toast({
            title: "Calendar Updated",
            description: "Work order has been added to the calendar",
          });
        }
      }
    } catch (err) {
      console.error("Error syncing with calendar:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: "Calendar Sync Error",
        description: err instanceof Error ? err.message : 'Failed to sync with calendar',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically get calendar event for this work order on load
  useEffect(() => {
    const fetchCalendarEvent = async () => {
      if (!workOrder?.id) return;
      
      // Logic to fetch any existing calendar event for this work order
      // This would typically query the calendar_events table for any events with this work_order_id
      // For now, we'll just leave this as a stub since we don't have the exact implementation
    };
    
    fetchCalendarEvent();
  }, [workOrder?.id]);
  
  return {
    syncWithCalendar,
    isLoading,
    error,
    calendarEvent,
    hasCalendarEvent: !!calendarEvent?.id
  };
}
