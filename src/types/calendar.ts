
import { WorkOrderInventoryItem } from "./workOrder";

export type CalendarViewType = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customer: string;
  status: string;
  priority: string;
  technician: string;
  location: string;
  type: 'work-order' | 'invoice';
  inventoryItems?: WorkOrderInventoryItem[];
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
