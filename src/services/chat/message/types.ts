import { DatabaseChatMessage } from '../supabaseClient';
import { ChatMessage } from '@/types/chat';

export interface MessageSendParams {
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type?: string;
  thread_parent_id?: string;
  metadata?: Record<string, any>;
}

export interface MessageEditParams {
  messageId: string;
  content: string;
  userId: string;
}

export interface MessageFlagParams {
  messageId: string;
  reason: string;
  userId: string;
}

// Determine message type based on content
export function getMessageType(content: string): string {
  if (content.startsWith('image:')) return 'image';
  if (content.startsWith('video:')) return 'video';
  if (content.startsWith('audio:')) return 'audio';
  if (content.startsWith('file:')) return 'file';
  if (content.startsWith('document:')) return 'document';
  if (content.startsWith('thread:')) return 'thread';
  return 'text';
}

// Convert database message to frontend message
export const transformDatabaseMessage = (dbMessage: DatabaseChatMessage): ChatMessage => {
  return {
    id: dbMessage.id,
    room_id: dbMessage.room_id,
    sender_id: dbMessage.sender_id,
    sender_name: dbMessage.sender_name,
    content: dbMessage.content,
    created_at: dbMessage.created_at,
    is_read: dbMessage.is_read || false,
    message_type: dbMessage.message_type as any || 'text',
    file_url: dbMessage.file_url,
    reply_to_id: dbMessage.reply_to_id,
    is_flagged: dbMessage.is_flagged || false,
    flag_reason: dbMessage.flag_reason,
    metadata: dbMessage.metadata,
    is_edited: dbMessage.is_edited || false,
    edited_at: dbMessage.edited_at,
    original_content: dbMessage.original_content,
    thread_parent_id: dbMessage.thread_parent_id,
    thread_count: dbMessage.thread_count || 0
  };
};

// Parse tagged items from message content
export const parseTaggedItems = (content: string): { 
  workOrderIds: string[], 
  partIds: string[], 
  warrantyIds: string[],
  jobIds: string[] 
} => {
  const workOrderPattern = /#WO-([a-zA-Z0-9-]+)/g;
  const partPattern = /#PART-([a-zA-Z0-9-]+)/g;
  const warrantyPattern = /#WARRANTY-([a-zA-Z0-9-]+)/g;
  const jobPattern = /#JOB-([a-zA-Z0-9-]+)/g;
  
  const workOrderMatches = [...content.matchAll(workOrderPattern)];
  const partMatches = [...content.matchAll(partPattern)];
  const warrantyMatches = [...content.matchAll(warrantyPattern)];
  const jobMatches = [...content.matchAll(jobPattern)];
  
  return {
    workOrderIds: workOrderMatches.map(match => match[1]),
    partIds: partMatches.map(match => match[1]),
    warrantyIds: warrantyMatches.map(match => match[1]),
    jobIds: jobMatches.map(match => match[1])
  };
};

// For compatibility if we missed a function in our updates
export const mapDatabaseMessageToMessage = transformDatabaseMessage;
