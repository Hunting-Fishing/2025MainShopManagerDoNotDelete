
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types/chat";

// Exporting supabase client
export { supabase };

// Define types for database entities
export type DatabaseChatMessage = Omit<ChatMessage, 'id'> & {
  id: string;
};
