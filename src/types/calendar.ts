
import { WorkOrderInventoryItem } from "./workOrder";

export type CalendarViewType = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // Changed from Date to string to match events.ts
  end: string;   // Changed from Date to string to match events.ts
  customer: string;
  status: string;
  priority: string;
  technician: string;
  technician_id?: string; // Added for compatibility
  location: string;
  type: 'work-order' | 'invoice' | 'appointment' | 'meeting' | 'break' | 'other';
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
}

export interface CalendarWeekProps {
  startDate: Date;
  events: CalendarEvent[];
}

// Re-export types from the new calendar/events.ts file
export * from './calendar/events';
