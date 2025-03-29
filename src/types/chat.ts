
export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'work_order';
  work_order_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}
