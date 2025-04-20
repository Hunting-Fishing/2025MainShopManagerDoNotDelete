
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from '@/types/calendar/events';
import { Badge } from '@/components/ui/badge';

interface CalendarEventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarEventDialog({ event, isOpen, onClose }: CalendarEventDialogProps) {
  const navigate = useNavigate();

  if (!event) return null;

  const handleViewWorkOrder = () => {
    if (event.work_order_id) {
      navigate(`/work-orders/${event.work_order_id}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Time:</span>
              <span>
                {format(new Date(event.start), "PPP 'at' p")} - {format(new Date(event.end), 'p')}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Location:</span>
                <span>{event.location}</span>
              </div>
            )}
            
            {event.description && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Description:</span>
                <p className="text-sm">{event.description}</p>
              </div>
            )}
            
            {event.status && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <Badge variant="outline">
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            )}
          </div>
          
          {event.work_order_id && (
            <Button onClick={handleViewWorkOrder} className="w-full">
              View Work Order
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
