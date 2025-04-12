
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  workOrderId?: string;
  status?: string;
  priority?: string;
  customer?: string;
  technician?: string;
  assignedTo?: string;
  color?: string;
  type?: 'appointment' | 'work-order' | 'reminder' | 'event' | string;
}

export interface CalendarEventDialogProps {
  event: CalendarEvent;
  onClose: () => void;
  open?: boolean;
}
