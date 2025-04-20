
import { WorkOrderInventoryItem } from "./workOrder";
import { ChatRoom } from "./chat";

export type CalendarViewType = "month" | "week" | "day";

// Make the CalendarEvent interface match the one in calendar/events.ts
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // Using string consistently for date fields
  end: string;   // Using string consistently for date fields
  customer?: string; // Make this optional to match events.ts
  status?: string;
  priority?: string;
  technician?: string;
  technician_id?: string;
  location?: string;
  type?: 'work-order' | 'invoice' | 'appointment' | 'meeting' | 'break' | 'other' | string;
  inventoryItems?: WorkOrderInventoryItem[];
  
  // Original database fields
  description?: string;
  customer_id?: string;
  work_order_id?: string;
  all_day?: boolean;
  start_time?: string;
  end_time?: string;
}

export interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  currentTime?: Date;
  shiftChats?: ChatRoom[];
}

export interface CalendarWeekProps {
  startDate: Date;
  events: CalendarEvent[];
}

// Re-export types from the new calendar/events.ts file
export * from './calendar/events';
