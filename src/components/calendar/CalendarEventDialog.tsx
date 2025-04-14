import React from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarEvent, CalendarEventDialogProps } from "@/types/calendar/events";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Calendar as CalendarIcon, FileText } from "lucide-react";
import { statusMap } from "@/utils/workOrders"; 
import { formatDate } from "@/utils/date";

export function CalendarEventDialog({ event, isOpen, onClose }: CalendarEventDialogProps) {
  if (!event) return null;

  const startTime = new Date(event.start).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const endTime = new Date(event.end).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const eventDate = formatDate(event.start);

  const isWorkOrder = event.type === 'work-order';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Badge variant={event.type === 'work-order' ? 'default' : 'secondary'}>
              {event.type === 'work-order' ? 'Work Order' : 'Appointment'}
            </Badge>
            
            {isWorkOrder && event.status && (
              <Badge 
                variant="outline" 
                className={`
                  ${event.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${event.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                  ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                `}
              >
                {statusMap[event.status] || event.status}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>{eventDate}</span>
            <span className="text-gray-500">•</span>
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{startTime} - {endTime}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.technician && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span>Assigned to {event.technician}</span>
            </div>
          )}
          
          {event.description && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm mb-1">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Description</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{event.description}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {isWorkOrder && event.id && (
            <Button asChild>
              <Link to={`/work-orders/${event.id}`}>
                View Work Order
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
