
import { supabase } from "@/lib/supabase";
import { ChatMessage, ChatRoom } from "@/types/chat";

// Exporting supabase client
export { supabase };

// Define types for database entities
export type DatabaseChatMessage = Omit<ChatMessage, 'id'> & {
  id: string;
};

export type DatabaseChatRoom = Omit<ChatRoom, 'id'> & {
  id: string;
};
