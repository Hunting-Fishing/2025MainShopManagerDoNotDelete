
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWorkOrderChatRoom, createChatRoom } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

// This would normally come from an auth context
const MOCK_USER_ID = "TM001";

interface WorkOrderChatButtonProps {
  workOrderId: string;
  workOrderName: string;
}

export const WorkOrderChatButton: React.FC<WorkOrderChatButtonProps> = ({ workOrderId, workOrderName }) => {
  const navigate = useNavigate();

  const handleOpenChat = async () => {
    try {
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      // If no room exists, create one
      if (!workOrderRoom) {
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrderName}`,
          'work_order',
          [MOCK_USER_ID], // Initially just add the current user
          workOrderId
        );
      }
      
      // Navigate to the chat room
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

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleOpenChat}
      className="flex items-center gap-1"
    >
      <MessageCircle className="h-4 w-4" />
      <span>Chat</span>
    </Button>
  );
};
