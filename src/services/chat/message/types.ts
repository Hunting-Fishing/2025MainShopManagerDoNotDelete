
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

// Parse tagged items from message content
export function parseTaggedItems(content: string): { 
  workOrderIds: string[], 
  partIds: string[], 
  warrantyIds: string[], 
  jobIds: string[] 
} {
  const result = {
    workOrderIds: [] as string[],
    partIds: [] as string[],
    warrantyIds: [] as string[],
    jobIds: [] as string[]
  };
  
  // Match work order tags: #WO-1234 or #WorkOrder-1234
  const workOrderRegex = /#(?:WO|WorkOrder)-(\w+)/g;
  let match;
  while ((match = workOrderRegex.exec(content)) !== null) {
    if (match[1]) result.workOrderIds.push(match[1]);
  }
  
  // Match part tags: #Part-5678
  const partRegex = /#Part-(\w+)/g;
  while ((match = partRegex.exec(content)) !== null) {
    if (match[1]) result.partIds.push(match[1]);
  }
  
  // Match warranty tags: #Warranty-999
  const warrantyRegex = /#Warranty-(\w+)/g;
  while ((match = warrantyRegex.exec(content)) !== null) {
    if (match[1]) result.warrantyIds.push(match[1]);
  }
  
  // Match job line tags: #Job-3
  const jobRegex = /#Job-(\w+)/g;
  while ((match = jobRegex.exec(content)) !== null) {
    if (match[1]) result.jobIds.push(match[1]);
  }
  
  return result;
}

// Format message content with clickable links for tagged items
export function formatMessageWithTags(content: string): string {
  // Replace work order tags with clickable links
  let formattedContent = content.replace(
    /#(WO|WorkOrder)-(\w+)/g,
    '<a href="/work-orders/$2" class="tag-link work-order-tag">#$1-$2</a>'
  );
  
  // Replace part tags with clickable links
  formattedContent = formattedContent.replace(
    /#Part-(\w+)/g,
    '<a href="/inventory/parts/$1" class="tag-link part-tag">#Part-$1</a>'
  );
  
  // Replace warranty tags with clickable links
  formattedContent = formattedContent.replace(
    /#Warranty-(\w+)/g,
    '<a href="/warranties/$1" class="tag-link warranty-tag">#Warranty-$1</a>'
  );
  
  // Replace job line tags with clickable links
  formattedContent = formattedContent.replace(
    /#Job-(\w+)/g,
    '<a href="/jobs/$1" class="tag-link job-tag">#Job-$1</a>'
  );
  
  return formattedContent;
}
