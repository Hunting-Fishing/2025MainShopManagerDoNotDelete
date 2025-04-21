import { ChatMessage, ChatMessageMetadata } from "@/types/chat";

export interface MessageSendParams {
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type?: 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread';
  reply_to_id?: string;
  thread_parent_id?: string;
  file_url?: string;
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
}

export interface MessageQueryParams {
  roomId: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface ThreadMessagesParams {
  parentId: string;
}

// Transform database message object to application model
export const transformDatabaseMessage = (dbMessage: any): ChatMessage => {
  // Transform database message object to application model
  return {
    ...dbMessage,
    // Ensure message_type is one of the allowed values
    message_type: validateMessageType(dbMessage.message_type),
    // Convert metadata from JSON to proper type
    metadata: dbMessage.metadata ? dbMessage.metadata as ChatMessageMetadata : undefined,
    // Add any specific transformations needed
    created_at: dbMessage.created_at || new Date().toISOString(),
    updated_at: dbMessage.updated_at || dbMessage.created_at || new Date().toISOString(),
    is_read: dbMessage.is_read != null ? dbMessage.is_read : false,
  };
};

// Helper function to validate message type
export function validateMessageType(type: string | null | undefined): 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread' {
  const validTypes = ['text', 'audio', 'image', 'video', 'file', 'system', 'work_order', 'thread'];
  if (type && validTypes.includes(type)) {
    return type as 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread';
  }
  // Default to 'text' if the type is not valid
  return 'text';
}

// Helper function to save messages to other records
export const saveMessageToRecord = async (
  messageId: string, 
  recordType: 'work_order' | 'vehicle', 
  recordId: string
): Promise<void> => {
  // Implementation of saving message to a record
  console.log(`Saving message ${messageId} to ${recordType} ${recordId}`);
  return Promise.resolve();
};
