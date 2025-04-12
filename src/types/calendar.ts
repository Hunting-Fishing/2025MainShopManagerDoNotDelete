
import { WorkOrderInventoryItem } from "./workOrder";
import { CalendarEvent as CalendarEventFromEvents } from "./calendar/events";

export type CalendarViewType = "month" | "week" | "day";

// Re-export the CalendarEvent type from calendar/events.ts
export type CalendarEvent = CalendarEventFromEvents;

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
