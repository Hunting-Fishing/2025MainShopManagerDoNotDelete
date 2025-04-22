
// Chat Room Model
export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'work_order';
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count?: number;
  work_order_id?: string;
  description?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  metadata?: ChatRoomMetadata;
}

// Chat Message Model
export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_read: boolean;
  message_type: 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order';
  file_url?: string;
  file_metadata?: FileMetadata;
  reply_to_id?: string;
  reply_to_message?: ChatMessage;
  is_flagged?: boolean;
  flag_reason?: string;
  metadata?: ChatMessageMetadata;
  is_edited?: boolean;
  edited_at?: string;
  original_content?: string;
  thread_parent_id?: string;
  thread_count?: number;
  reactions?: MessageReaction[];
  read_by?: ReadReceipt[];
}

// Chat Participant Model
export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  user_name?: string;
  user_avatar?: string;
  is_online?: boolean;
  last_seen_at?: string;
  role?: 'owner' | 'admin' | 'member';
}

// File Metadata Model
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  contentType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for audio/video
  thumbnail_url?: string;
}

// Chat Room Metadata Model
export interface ChatRoomMetadata {
  work_order?: {
    id: string;
    number: string;
    status: string;
    customer_name: string;
    vehicle?: string;
  };
  team?: string;
  shop_id?: string;
  is_shift_chat?: boolean;
  shift_date?: string;
  shift_name?: string;
  shift_time?: {
    start: string;
    end: string;
  };
  shift_participants?: string[];
  purpose?: string;
  tags?: string[];
}

// Chat Message Metadata Model
export interface ChatMessageMetadata {
  work_order_id?: string;
  work_order_number?: string;
  part_id?: string;
  part_number?: string;
  vehicle_id?: string;
  warranty_id?: string;
  tagged_users?: string[];
  tagged_items?: {
    workOrderIds: string[];
    partIds: string[];
    warrantyIds: string[];
    jobIds: string[];
  };
  saved_to?: {
    work_order?: string;
    vehicle?: string;
    saved_at?: string;
  };
  important?: boolean;
  needs_attention?: boolean;
  needs_customer_approval?: boolean;
  repair_status_update?: boolean;
  location_data?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// Message Reaction Model
export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  user_name?: string;
  reaction: string;
  created_at: string;
}

// Read Receipt Model
export interface ReadReceipt {
  user_id: string;
  user_name?: string;
  read_at: string;
}

// User Presence Model
export interface UserPresence {
  user_id: string;
  online_at: string;
  typing?: boolean;
  user_name?: string;
  avatar_url?: string;
  status?: 'online' | 'away' | 'do_not_disturb' | 'offline';
  last_active?: string;
}

// Chat Search Query Interface
export interface ChatSearchQuery {
  text?: string;
  room_id?: string;
  sender_id?: string;
  date_from?: string;
  date_to?: string;
  has_files?: boolean;
  file_type?: string;
  is_flagged?: boolean;
  message_type?: string;
  has_reactions?: boolean;
}
