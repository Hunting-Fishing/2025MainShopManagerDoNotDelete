
import { supabase } from "@/integrations/supabase/client";

// Define types for recurring messages
export interface RecurringMessage {
  id: string;
  room_id: string;
  created_by: string;
  content: string;
  frequency: "daily" | "weekly" | "monthly";
  day_of_week?: number; // 0-6, Sunday to Saturday
  day_of_month?: number; // 1-31
  time_of_day: string; // Format: "HH:MM"
  is_active: boolean;
  last_sent?: string;
  created_at: string;
}

export const getRecurringMessages = async (roomId?: string) => {
  try {
    /* 
    // Commented out due to missing table - will need to create it via migration first
    let query = supabase.from("chat_recurring_messages").select("*");
    
    if (roomId) {
      query = query.eq("room_id", roomId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as RecurringMessage[];
    */
    
    // Return empty array for now
    console.log("Note: getRecurringMessages is returning empty array because chat_recurring_messages table doesn't exist yet");
    return [];
  } catch (error) {
    console.error("Error fetching recurring messages:", error);
    return [];
  }
};

export const createRecurringMessage = async (messageData: Omit<RecurringMessage, "id" | "created_at" | "last_sent">) => {
  try {
    /* 
    // Commented out due to missing table
    const { data, error } = await supabase
      .from("chat_recurring_messages")
      .insert(messageData)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as RecurringMessage;
    */
    
    // Return mock data for now
    console.log("Note: createRecurringMessage is mocked because chat_recurring_messages table doesn't exist yet");
    console.log("Message data:", messageData);
    
    return {
      id: "mock-id-" + Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      last_sent: null
    } as RecurringMessage;
  } catch (error) {
    console.error("Error creating recurring message:", error);
    throw error;
  }
};

export const updateRecurringMessage = async (id: string, updates: Partial<RecurringMessage>) => {
  try {
    /*
    // Commented out due to missing table
    const { data, error } = await supabase
      .from("chat_recurring_messages")
      .update(updates)
      .eq("id", id)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as RecurringMessage;
    */
    
    // Return mock data for now
    console.log("Note: updateRecurringMessage is mocked because chat_recurring_messages table doesn't exist yet");
    console.log("Update data:", { id, updates });
    
    return {
      id,
      ...updates,
      updated_at: new Date().toISOString()
    } as unknown as RecurringMessage;
  } catch (error) {
    console.error("Error updating recurring message:", error);
    throw error;
  }
};

export const deleteRecurringMessage = async (id: string) => {
  try {
    /*
    // Commented out due to missing table
    const { error } = await supabase
      .from("chat_recurring_messages")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw error;
    }
    */
    
    // Log mock deletion for now
    console.log("Note: deleteRecurringMessage is mocked because chat_recurring_messages table doesn't exist yet");
    console.log("Deleting message with ID:", id);
    
    return true;
  } catch (error) {
    console.error("Error deleting recurring message:", error);
    throw error;
  }
};
