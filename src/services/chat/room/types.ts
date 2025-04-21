
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
    // Add any specific transformations needed
  };
};
