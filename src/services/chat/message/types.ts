
import { ChatMessage } from "@/types/chat";
import { DatabaseChatMessage } from "../supabaseClient";

export type MessageSendParams = Omit<ChatMessage, "id" | "is_read" | "created_at">;

export type MessageFlagParams = {
  messageId: string;
  reason: string;
  userId: string;
};

// Helper function to determine the message type based on content
export const getMessageType = (content: string): ChatMessage['message_type'] => {
  if (content.startsWith('audio:')) return 'audio';
  if (content.startsWith('image:')) return 'image';
  if (content.startsWith('video:')) return 'video';
  if (content.startsWith('file:') || content.startsWith('document:')) return 'file';
  if (content.startsWith('system:')) return 'system';
  if (content.startsWith('work_order:')) return 'work_order';
  return 'text';
};

// Helper function to transform a DatabaseChatMessage into a ChatMessage
export function transformDatabaseMessage(message: DatabaseChatMessage): ChatMessage {
  return {
    ...message,
    message_type: message.message_type as ChatMessage['message_type'] || 'text',
    is_read: message.is_read || false,
    is_flagged: message.is_flagged || false,
    flag_reason: message.flag_reason || undefined,
    metadata: message.metadata || null
  };
}
