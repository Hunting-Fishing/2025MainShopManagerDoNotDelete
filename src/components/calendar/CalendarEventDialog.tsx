
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Calendar as CalendarIcon, FileText } from "lucide-react";
import { statusMap } from "@/utils/workOrders"; // Updated import path
import { formatDate } from "@/utils/date";
import { Link } from "react-router-dom";

interface CalendarEventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean; // Changed from 'open' to 'isOpen' for consistency
  onClose: () => void;
}

export function CalendarEventDialog({ event, isOpen, onClose }: CalendarEventDialogProps) {
  if (!event) return null;

  // Format the event times for display
  const startTime = event.start instanceof Date 
    ? event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const endTime = event.end instanceof Date
    ? event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const eventDate = typeof event.start === 'string' 
    ? formatDate(event.start)
    : formatDate(event.start.toISOString());

  // Determine if this is a work order event
  const isWorkOrder = event.type === 'work-order';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Event Type Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={event.type === 'work-order' ? 'default' : 'secondary'}>
              {event.type === 'work-order' ? 'Work Order' : 'Appointment'}
            </Badge>
            
            {/* Status Badge - Only for work orders */}
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
          
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>{eventDate}</span>
            <span className="text-gray-500">•</span>
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{startTime} - {endTime}</span>
          </div>
          
          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.location}</span>
            </div>
          )}
          
          {/* Assigned To */}
          {event.technician && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span>Assigned to {event.technician}</span>
            </div>
          )}
          
          {/* Description */}
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
