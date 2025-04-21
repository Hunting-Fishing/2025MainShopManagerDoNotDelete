
import { ChatRoom } from "@/types/chat";

export interface CreateRoomParams {
  name: string;
  type: 'direct' | 'group' | 'work_order';
  participants: string[];
  workOrderId?: string;
  metadata?: any;
  id?: string; // Added to support custom IDs for shift chats
}

export interface RoomSearchParams {
  userId: string;
  query?: string;
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}

// Transform database room object to application model
export const transformDatabaseRoom = (dbRoom: any): ChatRoom => {
  return {
    ...dbRoom,
    // Ensure type is one of the allowed values
    type: validateRoomType(dbRoom.type),
    // If there's a last_message, ensure its message_type is valid
    ...(dbRoom.last_message && {
      last_message: {
        ...dbRoom.last_message,
        message_type: validateMessageType(dbRoom.last_message.message_type)
      }
    })
  };
};

// Helper function to validate room type
function validateRoomType(type: string): 'direct' | 'group' | 'work_order' {
  if (type === 'direct' || type === 'group' || type === 'work_order') {
    return type;
  }
  // Default to 'group' if the type is not valid
  console.warn(`Invalid room type: ${type}. Defaulting to 'group'`);
  return 'group';
}

// Helper function to validate message type
function validateMessageType(type: string | null): 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread' {
  const validTypes = ['text', 'audio', 'image', 'video', 'file', 'system', 'work_order', 'thread'];
  if (type && validTypes.includes(type)) {
    return type as 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread';
  }
  // Default to 'text' if the type is not valid
  return 'text';
}
