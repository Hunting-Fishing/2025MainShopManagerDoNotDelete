
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage, ChatParticipant } from "@/types/chat";

// Type assertion helpers to ensure correct typing from Supabase
export const assertChatRoomType = (type: string): "direct" | "group" | "work_order" => {
  if (type === "direct" || type === "group" || type === "work_order") {
    return type;
  }
  // Default to "direct" if the type is invalid
  console.warn(`Invalid chat room type: ${type}. Defaulting to "direct".`);
  return "direct";
};

// Export supabase client for use in other chat service files
export { supabase };
