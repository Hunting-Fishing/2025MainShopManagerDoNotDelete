
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
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  customer_id?: string;
  work_order_id?: string;
  technician_id?: string;
  event_type: 'appointment' | 'work-order' | 'reminder' | 'event' | 'other';
  status?: string;
  priority?: string;
  created_by?: string;
}

export interface ShiftChat {
  id: string;
  chat_room_id: string;
  shift_date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  technician_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateShiftChatDto {
  shift_date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  technician_ids?: string[];
}
