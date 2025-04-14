
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  customer_id?: string;
  work_order_id?: string;
  technician_id?: string;
  event_type: 'work-order' | 'invoice' | 'appointment' | 'meeting' | 'break' | 'other';
  status: string;
  priority: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Derived/computed properties for UI
  customer?: string;
  technician?: string;
}

export interface ShiftChat {
  id: string;
  chat_room_id: string;
  shift_date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  technician_ids: string[];
  location?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringEvent {
  id: string;
  base_event_id: string;
  recurrence_rule: string;
  recurrence_exception_dates: string[];
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  response_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  created_at: string;
}

export interface EventReminder {
  id: string;
  event_id: string;
  reminder_time: string;
  reminder_type: 'email' | 'notification' | 'sms';
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

export interface CalendarPreference {
  id: string;
  user_id: string;
  default_view: 'month' | 'week' | 'day';
  work_hours_start: string;
  work_hours_end: string;
  first_day_of_week: number;
  displayed_calendars: any[];
  color_settings: Record<string, string>;
  created_at: string;
  updated_at: string;
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
  event_type: 'work-order' | 'invoice' | 'appointment' | 'meeting' | 'break' | 'other';
  status?: string;
  priority?: string;
}

export interface CreateShiftChatDto {
  chat_room_id?: string;
  shift_date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  technician_ids?: string[];
  location?: string;
  notes?: string;
}
