
export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  category?: string;
}

export interface CustomerCommunication {
  id: string;
  customer_id: string;
  date: string;
  type: 'email' | 'phone' | 'text' | 'in-person';
  direction: 'incoming' | 'outgoing';
  content: string;
  subject?: string | null;
  staff_member_id: string;
  staff_member_name: string;
  template_id?: string | null;
  template_name?: string | null;
  status: 'completed' | 'pending' | 'failed';
}
