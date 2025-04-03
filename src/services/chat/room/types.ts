
import { ChatRoom, ChatRoomMetadata } from "@/types/chat";
import { DatabaseChatRoom } from "../supabaseClient";

export interface CreateRoomParams {
  name: string;
  type: "direct" | "group" | "work_order";
  participants: string[];
  workOrderId?: string; 
  metadata?: ChatRoomMetadata;
  id?: string; // Custom ID for special cases like shift chats
}

export interface GetRoomOptions {
  includeLastMessage?: boolean;
  includeParticipants?: boolean;
}

// Transform a database chat room to our application model
export const transformDatabaseRoom = (dbRoom: DatabaseChatRoom): ChatRoom => {
  return {
    id: dbRoom.id,
    name: dbRoom.name,
    type: dbRoom.type as 'direct' | 'group' | 'work_order',
    work_order_id: dbRoom.work_order_id,
    created_at: dbRoom.created_at,
    updated_at: dbRoom.updated_at,
    is_pinned: dbRoom.is_pinned,
    is_archived: dbRoom.is_archived,
    metadata: dbRoom.metadata
  };
};
