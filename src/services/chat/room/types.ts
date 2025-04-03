
import { ChatRoom } from "@/types/chat";
import { DatabaseChatRoom } from "../supabaseClient";

export interface GetRoomOptions {
  includeLastMessage?: boolean;
  includeUnreadCount?: boolean;
  includeParticipants?: boolean;
}

export interface CreateRoomParams {
  name: string;
  type: "direct" | "group" | "work_order";
  participants: string[];
  workOrderId?: string;
  metadata?: any;
}

export type EnhancedRoomResult = ChatRoom;

// Helper function to transform a DatabaseChatRoom into a ChatRoom
export function transformDatabaseRoom(room: DatabaseChatRoom): ChatRoom {
  return {
    ...room,
    type: room.type as "direct" | "group" | "work_order",
    is_pinned: room.is_pinned || false,
    is_archived: room.is_archived || false,
    metadata: room.metadata || null
  };
}
