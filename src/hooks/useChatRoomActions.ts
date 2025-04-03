
import { useState, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { 
  createChatRoom, 
  getWorkOrderChatRoom,
  getDirectChatWithUser
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { findWorkOrderById } from '@/utils/workOrderUtils';

export const useChatRoomActions = (
  userId: string | null, 
  selectRoom: (room: ChatRoom) => void,
  refreshRooms: () => void
) => {
  const navigate = useNavigate();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // Create a new chat room
  const handleCreateChat = useCallback(async (
    chatType: 'direct' | 'group', 
    participants: string[], 
    name: string
  ) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You need to be logged in to create a chat.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Make sure current user is included in participants
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      
      // For direct chats, check if a chat with this user already exists
      if (chatType === 'direct' && participants.length === 2) {
        const otherUserId = participants.find(id => id !== userId);
        if (otherUserId) {
          const existingRoom = await getDirectChatWithUser(userId, otherUserId);
          if (existingRoom) {
            selectRoom(existingRoom);
            navigate(`/chat/${existingRoom.id}`);
            setShowNewChatDialog(false);
            return;
          }
        }
      }
      
      // Create a new chat room
      const newRoom = await createChatRoom(
        name,
        chatType,
        participants
      );
      
      // Select the new room and navigate to it
      selectRoom(newRoom);
      navigate(`/chat/${newRoom.id}`);
      setShowNewChatDialog(false);
      
      toast({
        title: "Chat created",
        description: "New chat room has been created.",
      });
      
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat room.",
        variant: "destructive",
      });
    }
  }, [userId, selectRoom, navigate]);

  // Open or create a work order chat
  const openWorkOrderChat = useCallback(async (workOrderId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You need to be logged in to access work order chats.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      if (!workOrderRoom) {
        // Get work order details for the chat name
        const workOrder = await findWorkOrderById(workOrderId);
        
        if (!workOrder) {
          toast({
            title: "Error",
            description: "Work order not found.",
            variant: "destructive",
          });
          return;
        }
        
        // Create a work order chat room with metadata
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrder.id}`,
          'work_order',
          [userId],
          workOrderId,
          {
            work_order: {
              id: workOrder.id,
              number: workOrder.id,
              status: workOrder.status,
              customer_name: workOrder.customer
            }
          }
        );
        
        toast({
          title: "Work Order Chat Created",
          description: `Chat room for Work Order ${workOrder.id} has been created.`,
        });
      }
      
      // Select the work order room and navigate to it
      selectRoom(workOrderRoom);
      navigate(`/chat/${workOrderRoom.id}`);
      
      // Refresh room list to show the new/updated room
      refreshRooms();
      
    } catch (error) {
      console.error("Error opening work order chat:", error);
      toast({
        title: "Error",
        description: "Failed to open work order chat.",
        variant: "destructive",
      });
    }
  }, [userId, selectRoom, navigate, refreshRooms]);

  // View work order details
  const handleViewWorkOrderDetails = useCallback((workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  }, [navigate]);

  return {
    showNewChatDialog,
    setShowNewChatDialog,
    handleCreateChat,
    openWorkOrderChat,
    handleViewWorkOrderDetails
  };
};
