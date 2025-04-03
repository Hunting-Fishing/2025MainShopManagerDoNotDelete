
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatRoom } from '@/types/chat';
import { createChatRoom, getWorkOrderChatRoom } from '@/services/chat';
import { toast } from '@/hooks/use-toast';
import { CreateRoomParams } from '@/services/chat/room/types';

export const useChatRoomActions = (
  userId: string | undefined,
  selectRoom: (room: ChatRoom) => void,
  refreshRooms: () => void
) => {
  const navigate = useNavigate();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // Create new chat
  const handleCreateChat = useCallback(async (
    type: "direct" | "group" | "work_order", 
    participants: string[], 
    name: string,
    workOrderId?: string
  ) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chat",
        variant: "destructive"
      });
      return;
    }

    try {
      // Always add the current user as a participant
      if (!participants.includes(userId)) {
        participants.push(userId);
      }

      const roomParams: CreateRoomParams = {
        name,
        type,
        participants,
        workOrderId,
      };

      const newRoom = await createChatRoom(roomParams);

      toast({
        title: "Success",
        description: "Chat created successfully"
      });

      setShowNewChatDialog(false);
      selectRoom(newRoom);
      refreshRooms();
      
      // Navigate to the new room
      navigate(`/chat/${newRoom.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      });
    }
  }, [userId, selectRoom, refreshRooms, navigate]);

  // Open or create work order chat
  const openWorkOrderChat = useCallback(async (workOrderId: string, workOrderName: string) => {
    if (!userId) return;

    try {
      // Check if a chat room for this work order already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      if (!workOrderRoom) {
        // If not, create a new one with a default name based on the work order
        const roomParams: CreateRoomParams = {
          name: `Work Order: ${workOrderName}`,
          type: "work_order",
          participants: [userId],
          workOrderId,
          metadata: {
            work_order: {
              id: workOrderId,
              number: workOrderName
            }
          }
        };
        
        workOrderRoom = await createChatRoom(roomParams);
        
        toast({
          title: "Work Order Chat Created",
          description: `Chat room for Work Order ${workOrderName} has been created.`
        });
      }
      
      selectRoom(workOrderRoom);
      navigate(`/chat/${workOrderRoom.id}`);
    } catch (error) {
      console.error("Error opening work order chat:", error);
      toast({
        title: "Error",
        description: "Failed to open work order chat",
        variant: "destructive"
      });
    }
  }, [userId, selectRoom, navigate]);

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
