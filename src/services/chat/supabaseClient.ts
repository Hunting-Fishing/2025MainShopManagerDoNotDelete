
import { createClient } from '@supabase/supabase-js';
import { ChatRoom } from '@/types/chat';

// Initialize the supabase client
export const supabase = createClient(
  "https://oudkbrnvommbvtuispla.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGticm52b21tYnZ0dWlzcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTgzODgsImV4cCI6MjA1ODQ5NDM4OH0.Hyo-lkI96GBLt-zp5zZLvCL1bSEWTomIIrzvKRO4LF4"
);

// Helper function to assert the chat room type
export function assertChatRoomType(type: string): 'direct' | 'group' | 'work_order' {
  if (type === 'direct' || type === 'group' || type === 'work_order') {
    return type;
  }
  // Default to direct if invalid type
  console.warn(`Invalid chat room type: ${type}, defaulting to 'direct'`);
  return 'direct';
}

// Define the extended database types
export type DatabaseChatRoom = {
  id: string;
  name: string;
  type: string;
  work_order_id?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  metadata?: any;
};

export type DatabaseChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  file_url?: string;
  reply_to_id?: string;
  is_flagged?: boolean;
  flag_reason?: string;
  metadata?: any;
};
