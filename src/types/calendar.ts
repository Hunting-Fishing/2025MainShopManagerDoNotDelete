
import { WorkOrderInventoryItem } from "./workOrder";
import { ChatRoom } from "./chat";
import { CalendarEvent } from './calendar/events';

// Re-export types from the new calendar/events.ts file
export * from './calendar/events';

export type CalendarViewType = "month" | "week" | "day";

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

// Note: We're now re-exporting everything from calendar/events.ts
// so we don't need to duplicate the CalendarEvent interface here
