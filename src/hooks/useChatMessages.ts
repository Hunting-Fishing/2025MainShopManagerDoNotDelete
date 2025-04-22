
import { useState } from 'react';
import { ChatMessage } from '@/types/chat';

interface UseChatMessageActionsProps {
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onFlagMessage: (messageId: string, reason: string) => void;
}

export const useChatMessageActions = ({ 
  onEditMessage, 
  onFlagMessage 
}: UseChatMessageActionsProps) => {
  
  const handleEditWrapper = (newContent: string, messageId: string) => {
    return onEditMessage(messageId, newContent);
  };

  const handleFlagWrapper = (isFlagged: boolean, messageId: string) => {
    if (isFlagged) {
      onFlagMessage(messageId, "Flagged by user");
    }
  };

  return {
    handleEditMessage: handleEditWrapper,
    handleFlagMessage: handleFlagWrapper
  };
};
