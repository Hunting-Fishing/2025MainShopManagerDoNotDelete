
import { ChatMessage } from "@/types/chat";
import { supabase, DatabaseChatMessage } from "../supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { transformDatabaseMessage } from "./types";

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (message: ChatMessage) => void): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const newMessage = transformDatabaseMessage(payload.new as DatabaseChatMessage);
      callback(newMessage);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Subscribe to message updates (e.g., read status, flags)
export const subscribeToMessageUpdates = (roomId: string, callback: (message: ChatMessage) => void): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`room-updates-${roomId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const updatedMessage = transformDatabaseMessage(payload.new as DatabaseChatMessage);
      callback(updatedMessage);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
