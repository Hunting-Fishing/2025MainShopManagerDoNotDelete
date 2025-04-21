
import { ChatRoom } from "@/types/chat";

export interface CreateRoomParams {
  name: string;
  type: 'direct' | 'group' | 'work_order';
  participants: string[];
  workOrderId?: string;
  metadata?: any;
}

export interface RoomSearchParams {
  userId: string;
  query?: string;
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}
