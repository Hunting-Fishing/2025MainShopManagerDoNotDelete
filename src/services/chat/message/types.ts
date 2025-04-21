
import { ChatMessage } from '@/types/chat';

export interface MessageSendParams {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType?: 'text' | 'audio' | 'image' | 'video' | 'file' | 'system';
  threadParentId?: string;
}

export interface MessageEditParams {
  messageId: string;
  content: string;
}

export interface MessageFlagParams {
  messageId: string;
  reason: string;
}

export interface MessageQueryParams {
  roomId: string;
  limit?: number;
  offset?: number;
}

export interface ThreadMessagesParams {
  parentMessageId: string;
}

export function validateMessageType(type: string): void {
  const validTypes = ['text', 'audio', 'image', 'video', 'file', 'system'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid message type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }
}

export function transformDatabaseMessage(dbMessage: any): ChatMessage {
  return {
    id: dbMessage.id,
    room_id: dbMessage.room_id,
    sender_id: dbMessage.sender_id,
    sender_name: dbMessage.sender_name,
    content: dbMessage.content,
    created_at: dbMessage.created_at,
    is_read: dbMessage.is_read || false,
    message_type: dbMessage.message_type || 'text',
    file_url: dbMessage.file_url,
    reply_to_id: dbMessage.reply_to_id,
    is_flagged: dbMessage.is_flagged || false,
    flag_reason: dbMessage.flag_reason,
    is_edited: dbMessage.is_edited || false,
    edited_at: dbMessage.edited_at,
    original_content: dbMessage.original_content,
    thread_parent_id: dbMessage.thread_parent_id,
    thread_count: dbMessage.thread_count || 0,
    metadata: dbMessage.metadata
  };
}
