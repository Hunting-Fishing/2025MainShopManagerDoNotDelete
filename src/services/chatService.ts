
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, ChatMessage } from "@/types/chat";

// Mock data for development and testing
const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: "room-1",
    name: "Team Chat",
    type: "group",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: {
      id: "msg-1",
      room_id: "room-1",
      sender_id: "user-1",
      sender_name: "Admin User",
      content: "Hello team! How's everyone doing today?",
      created_at: new Date().toISOString(),
      is_read: true
    },
    unread_count: 0
  }
];

// Get all chat rooms for a user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    // In a real app, this would get rooms where the user is a participant
    // For now, return mock data
    return MOCK_CHAT_ROOMS;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

// Get messages for a specific chat room
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    // In a real app, this would query the database
    // For now, return mock data
    return [
      {
        id: "msg-1",
        room_id: roomId,
        sender_id: "user-1",
        sender_name: "Admin User",
        content: "Hello team! How's everyone doing today?",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_read: true
      },
      {
        id: "msg-2",
        room_id: roomId,
        sender_id: "user-2",
        sender_name: "Sarah Johnson",
        content: "Doing great! Just finished the electrical job at Metro Hotel.",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_read: true
      },
      {
        id: "msg-3",
        room_id: roomId,
        sender_id: "user-3",
        sender_name: "Michael Brown",
        content: "I need some help with the HVAC repair at Acme Corp. Anyone available?",
        created_at: new Date().toISOString(),
        is_read: false
      }
    ];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

// Send a message to a chat room
export const sendMessage = async (message: Omit<ChatMessage, "id" | "is_read" | "created_at">): Promise<ChatMessage> => {
  try {
    // In a real app, this would insert a new message in the database
    // For now, mock a successful response
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      ...message,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    return newMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  try {
    // In a real app, this would update the is_read status in the database
    console.log(`Marking messages as read in room ${roomId} for user ${userId}`);
    return;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Get a chat room by work order ID
export const getWorkOrderChatRoom = async (workOrderId: string): Promise<ChatRoom | null> => {
  try {
    // In a real app, this would query the database
    // For now, return mock data or null to simulate no existing room
    const found = MOCK_CHAT_ROOMS.find(room => 
      room.type === "work_order" && room.work_order_id === workOrderId
    );
    
    return found || null;
  } catch (error) {
    console.error("Error fetching work order chat room:", error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (
  name: string,
  type: "direct" | "group" | "work_order",
  participants: string[],
  workOrderId?: string
): Promise<ChatRoom> => {
  try {
    // In a real app, this would insert a new room in the database
    // and also add participants
    
    // Mock a successful response
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      work_order_id: workOrderId
    };
    
    // Add the new room to our mock data
    MOCK_CHAT_ROOMS.push(newRoom);
    
    return newRoom;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (message: ChatMessage) => void) => {
  // In a real app, this would use Supabase realtime subscriptions
  // For now, we'll just return a fake unsubscribe function
  
  // Mock a new message coming in every 30 seconds for demo purposes
  const interval = setInterval(() => {
    const senders = [
      { id: "user-2", name: "Sarah Johnson" },
      { id: "user-3", name: "Michael Brown" },
      { id: "user-4", name: "Emily Davis" }
    ];
    
    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    const messages = [
      "How's that work order coming along?",
      "Do we need any additional parts for this job?",
      "I'll be there in about 30 minutes to help.",
      "Just finished another job, I can swing by if needed.",
      "Let me know if you need any assistance with that."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    callback({
      id: `msg-${Date.now()}`,
      room_id: roomId,
      sender_id: randomSender.id,
      sender_name: randomSender.name,
      content: randomMessage,
      created_at: new Date().toISOString(),
      is_read: false
    });
  }, 30000);
  
  // Return unsubscribe function
  return () => {
    clearInterval(interval);
  };
};

// Get chat room details
export const getChatRoomDetails = async (roomId: string): Promise<ChatRoom> => {
  try {
    // In a real app, this would query the database for the room details
    const room = MOCK_CHAT_ROOMS.find(r => r.id === roomId);
    
    if (!room) {
      throw new Error("Chat room not found");
    }
    
    return room;
  } catch (error) {
    console.error("Error fetching chat room details:", error);
    throw error;
  }
};
