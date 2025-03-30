
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
  message_type?: 'text' | 'audio' | 'image' | 'file';
  file_url?: string;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  user_name?: string;
  user_avatar?: string;
  is_online?: boolean;
  last_seen_at?: string;
}

export interface VoiceCallInfo {
  id: string;
  room_id: string;
  caller_id: string;
  caller_name: string;
  recipient_id: string;
  recipient_name: string;
  status: 'ringing' | 'ongoing' | 'ended' | 'missed';
  started_at: string;
  ended_at?: string;
  duration?: number;
}
