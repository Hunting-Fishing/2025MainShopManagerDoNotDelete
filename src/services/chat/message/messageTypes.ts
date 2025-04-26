
import { ChatMessage } from '@/types/chat';

export interface MessageSendParams {
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  metadata?: any;
  message_type?: string; // Added to fix the error
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

export const getMessageType = (content: string): string => {
  // Detect if message contains a URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (urlRegex.test(content)) {
    return 'text';
  }
  
  // Default to text message
  return 'text';
};

export const transformDatabaseMessage = (dbMessage: any): ChatMessage => {
  // Transform database message object to application model
  return {
    ...dbMessage,
    // Add any transformations needed
  };
};
