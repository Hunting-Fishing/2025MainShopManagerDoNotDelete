
import { supabase } from "@/lib/supabase";
import { CalendarEvent, CreateCalendarEventDto } from "@/types/calendar/events";
import { handleApiError } from "@/utils/errorHandling";

// Create a type to represent the internal database structure
interface DbCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean; // Make all_day required
  location?: string;
  customer_id?: string;
  work_order_id?: string;
  technician_id?: string;
  event_type: string;
  status?: string;
  priority?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer?: string;
  technician?: string;
}

/**
 * Fetch calendar events for a specified date range
 */
export async function getCalendarEvents(
  startDate: string, 
  endDate: string
): Promise<DbCalendarEvent[]> {
  try {
    // Fetch events based on the date range
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        all_day,
        location,
        customer_id,
        work_order_id,
        technician_id,
        event_type,
        status,
        priority,
        created_by,
        created_at,
        updated_at
      `)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;

    // Format the events for the UI
    const formattedEvents = await Promise.all(
      data.map(async (event) => {
        // Get customer name if customer_id exists
        let customer = undefined;
        if (event.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('first_name, last_name')
            .eq('id', event.customer_id)
            .single();
          
          if (customerData) {
            customer = `${customerData.first_name} ${customerData.last_name}`;
          }
        }
        
        // Get technician name if technician_id exists
        let technician = undefined;
        if (event.technician_id) {
          const { data: technicianData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', event.technician_id)
            .single();
          
          if (technicianData) {
            technician = `${technicianData.first_name} ${technicianData.last_name}`;
          }
        }
        
        return {
          ...event,
          customer,
          technician
        };
      })
    );

    return formattedEvents;
  } catch (error) {
    handleApiError(error, "Failed to fetch calendar events");
    return [];
  }
}

/**
 * Fetch work order events for the calendar
 */
export async function getWorkOrderEvents(): Promise<DbCalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        status,
        start_time,
        end_time,
        customer_id,
        technician_id,
        vehicle_id
      `)
      .not('start_time', 'is', null);

    if (error) throw error;

    // Format the work orders as calendar events
    const workOrderEvents = await Promise.all(
      data.map(async (wo) => {
        // Get customer name
        let customer = "Unknown Customer";
        if (wo.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('first_name, last_name')
            .eq('id', wo.customer_id)
            .single();
          
          if (customerData) {
            customer = `${customerData.first_name} ${customerData.last_name}`;
          }
        }
        
        // Get technician name
        let technician = "Unassigned";
        if (wo.technician_id) {
          const { data: technicianData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', wo.technician_id)
            .single();
          
          if (technicianData) {
            technician = `${technicianData.first_name} ${technicianData.last_name}`;
          }
        }

        // Get location
        let location = "";
        if (wo.vehicle_id) {
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('make, model')
            .eq('id', wo.vehicle_id)
            .single();
          
          if (vehicleData) {
            location = `${vehicleData.make} ${vehicleData.model}`;
          }
        }

        return {
          id: wo.id,
          title: wo.description || 'Work Order',
          description: wo.description,
          start_time: wo.start_time,
          end_time: wo.end_time || wo.start_time, // Use start_time as fallback
          all_day: false,
          location,
          customer_id: wo.customer_id,
          work_order_id: wo.id,
          technician_id: wo.technician_id,
          event_type: 'work-order',
          status: wo.status,
          priority: 'medium', // Default priority
          customer,
          technician,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      })
    );

    return workOrderEvents;
  } catch (error) {
    handleApiError(error, "Failed to fetch work order events");
    return [];
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  eventData: CreateCalendarEventDto
): Promise<DbCalendarEvent | null> {
  try {
    // Ensure all_day is defined before inserting
    const dataToInsert = {
      ...eventData,
      all_day: eventData.all_day ?? false // Default to false if not provided
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, "Failed to create calendar event");
    return null;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  id: string,
  eventData: Partial<DbCalendarEvent>
): Promise<DbCalendarEvent | null> {
  try {
    // Ensure all_day is defined before updating
    const dataToUpdate = {
      ...eventData,
      all_day: eventData.all_day ?? false // Default to false if not provided
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, "Failed to update calendar event");
    return null;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleApiError(error, "Failed to delete calendar event");
    return false;
  }
}
