
export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'work_order';
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
}
