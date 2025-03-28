
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";
import { priorityMap } from "@/data/workOrdersData";

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarDay({ 
  date, 
  events, 
  isCurrentMonth = true, 
  isToday = false,
  onEventClick
}: CalendarDayProps) {
  // Sort events by priority (high first)
  const sortedEvents = [...events].sort((a, b) => {
    const priorityOrder = { "high": 0, "medium": 1, "low": 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  // Limit the number of events displayed
  const maxVisibleEvents = 3;
  const visibleEvents = sortedEvents.slice(0, maxVisibleEvents);
  const hiddenEventsCount = sortedEvents.length - maxVisibleEvents;

  return (
    <div 
      className={cn(
        "min-h-[120px] border p-1",
        !isCurrentMonth && "bg-slate-50",
        isToday && "bg-blue-50"
      )}
    >
      <div className="flex justify-between mb-1">
        <span 
          className={cn(
            "text-sm font-medium",
            !isCurrentMonth && "text-slate-400",
            isToday && "rounded-full bg-blue-600 text-white h-6 w-6 flex items-center justify-center"
          )}
        >
          {format(date, "d")}
        </span>
      </div>

      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <div 
            key={event.id}
            onClick={() => onEventClick(event)}
            className={cn(
              "px-2 py-1 text-xs rounded truncate cursor-pointer",
              priorityMap[event.priority].classes.replace("text-xs font-medium", "")
            )}
          >
            <div className="font-medium truncate">{event.title}</div>
            <div className="text-[10px] truncate">{event.technician}</div>
          </div>
        ))}

        {hiddenEventsCount > 0 && (
          <div className="text-xs text-slate-500 px-2">
            + {hiddenEventsCount} more
          </div>
        )}
      </div>
    </div>
  );
}
