import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { priorityMap } from "@/utils/workOrders";

interface CalendarDayDetailDialogProps {
  date: Date | null;
  events: CalendarEvent[];
  isOpen: boolean;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarDayDetailDialog({
  date,
  events,
  isOpen,
  onClose,
  onEventClick
}: CalendarDayDetailDialogProps) {
  if (!date) return null;

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(date, "EEEE, MMMM d, yyyy")}
            </div>
            {events.length > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                {events.length} {events.length === 1 ? 'Job' : 'Jobs'}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this day
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  onEventClick(event);
                  onClose();
                }}
                className={cn(
                  "p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md",
                  priorityMap[event.priority]?.classes || "border-l-gray-300 bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                        </span>
                      </div>
                      
                      {event.technician && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{event.technician}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.customer && (
                      <div className="text-sm">
                        <span className="font-medium">Customer:</span> {event.customer}
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {event.status && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap",
                        event.status === "completed" && "bg-green-100 text-green-800",
                        event.status === "in-progress" && "bg-blue-100 text-blue-800",
                        event.status === "scheduled" && "bg-yellow-100 text-yellow-800",
                        event.status === "cancelled" && "bg-red-100 text-red-800"
                      )}>
                        {event.status}
                      </span>
                    )}
                    
                    {event.type && (
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800 font-medium whitespace-nowrap">
                        {event.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
