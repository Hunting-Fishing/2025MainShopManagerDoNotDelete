
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatRoom } from '@/types/chat';
import { 
  createChatRoom, 
  getWorkOrderChatRoom, 
  getDirectChatWithUser 
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';

export function useChatRoomActions(userId: string | null, selectRoom: (room: ChatRoom) => Promise<void>, refreshRooms: () => Promise<void>) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const navigate = useNavigate();

  // Handle creating a new chat
  const handleCreateChat = async (name: string, type: 'direct' | 'group', participants: string[]) => {
    if (!userId) return;
    
    try {
      // Add current user to participants if not already included
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      
      // For direct chats, check if a chat already exists
      if (type === 'direct' && participants.length === 2) {
        const otherUserId = participants.find(id => id !== userId);
        if (otherUserId) {
          const existingRoom = await getDirectChatWithUser(userId, otherUserId);
          if (existingRoom) {
            toast({
              title: "Chat already exists",
              description: "Opening existing conversation",
            });
            await selectRoom(existingRoom);
            navigate(`/chat/${existingRoom.id}`);
            return;
          }
        }
      }
      
      // Create a new chat room
      const newRoom = await createChatRoom(name, type, participants);
      
      // Refresh the list of chat rooms
      await refreshRooms();
      
      // Select the new room
      await selectRoom(newRoom);
      
      // Navigate to the new room
      navigate(`/chat/${newRoom.id}`);
      
      toast({
        title: "Conversation created",
        description: `New ${type === 'direct' ? 'direct message' : 'group chat'} started`,
      });
    } catch (err) {
      console.error("Error creating chat:", err);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  // Handle opening work order chat
  const openWorkOrderChat = async (workOrderId: string, workOrderName: string) => {
    if (!userId) return;
    
    try {
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      // If no room exists, create one
      if (!workOrderRoom) {
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrderName}`,
          'work_order',
          [userId], // Initially just add the current user
          workOrderId
        );
        
        await refreshRooms();
      }
      
      // Select the work order room
      await selectRoom(workOrderRoom);
      
      // Navigate to the work order room
      navigate(`/chat/${workOrderRoom.id}`);
    } catch (err) {
      console.error("Error opening work order chat:", err);
      toast({
        title: "Error",
        description: "Failed to open work order chat",
        variant: "destructive",
      });
    }
  };

  // Handle view work order details
  const handleViewWorkOrderDetails = (workOrderId?: string) => {
    if (workOrderId) {
      navigate(`/work-orders/${workOrderId}`);
    }
  };

  return {
    showNewChatDialog,
    setShowNewChatDialog,
    handleCreateChat,
    openWorkOrderChat,
    handleViewWorkOrderDetails
  };
}
