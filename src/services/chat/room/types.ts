
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
    // Add any other specific transformations needed
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
