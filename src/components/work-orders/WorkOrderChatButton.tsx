
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWorkOrderChatRoom, createChatRoom } from '@/services/chat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderChatButtonProps {
  workOrderId: string;
  workOrderName: string;
}

export const WorkOrderChatButton: React.FC<WorkOrderChatButtonProps> = ({ workOrderId, workOrderName }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChat = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use the chat feature",
          variant: "destructive",
        });
        return;
      }
      
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      // If no room exists, create one
      if (!workOrderRoom) {
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrderName}`,
          'work_order',
          [user.id],
          workOrderId
        );
        
        toast({
          title: "Chat created",
          description: "New work order chat room created",
        });
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleOpenChat}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      <MessageCircle className="h-4 w-4" />
      <span>{isLoading ? 'Opening...' : 'Chat'}</span>
    </Button>
  );
};
