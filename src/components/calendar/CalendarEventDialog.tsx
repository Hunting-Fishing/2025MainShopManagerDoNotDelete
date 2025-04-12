
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { statusMap, priorityMap } from "@/utils/workOrders";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";

interface CalendarEventDialogProps {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
}

export function CalendarEventDialog({ 
  event, 
  open, 
  onClose 
}: CalendarEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Work Order #{event.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-sm text-slate-500">Customer</div>
              <div className="font-medium">{event.customer}</div>
            </div>
            <Badge className={priorityMap[event.priority].classes.replace("text-xs font-medium", "")}>
              {priorityMap[event.priority].label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <div>{format(new Date(event.start), "MMM d, yyyy")}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <div>{format(new Date(event.end), "MMM d, yyyy")}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <User className="h-4 w-4" />
                Technician
              </div>
              <div>{event.technician}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <div>{event.location}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Status</div>
            <div className="inline-block">
              <span className={`status-badge status-${event.status}`}>
                {String(statusMap[event.status])}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/invoices/from-work-order/${event.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
            
            <Button asChild>
              <Link to={`/work-orders/${event.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
