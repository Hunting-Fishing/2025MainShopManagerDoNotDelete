
import React, { useState, useEffect } from 'react';
import { ChatPageLayout } from '@/components/chat/ChatPageLayout';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleCreateChat = async (name: string, type: string, participants: any[], shiftMetadata: any) => {
    setIsCreatingChat(true);
    try {
      // Mock implementation - replace with actual chat creation logic
      console.log('Creating chat:', { name, type, participants, shiftMetadata });
      
      toast({
        title: "Chat created",
        description: `Chat "${name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="h-full">
      <ChatPageLayout />
    </div>
  );
}
