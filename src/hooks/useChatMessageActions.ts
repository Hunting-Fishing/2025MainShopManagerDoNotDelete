
import { useState } from 'react';

export interface ChatMessageActionsProps {
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
  onFlagMessage?: (messageId: string, reason: string) => void;
}

export const useChatMessageActions = ({
  onEditMessage,
  onFlagMessage
}: ChatMessageActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditMessage = async (newContent: string, messageId: string) => {
    if (!onEditMessage) return;
    
    try {
      await onEditMessage(messageId, newContent);
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleFlagMessage = (isFlagged: boolean, messageId: string) => {
    if (!onFlagMessage) return;
    
    // Convert boolean to string reason
    const reason = isFlagged ? 'inappropriate content' : '';
    onFlagMessage(messageId, reason);
  };

  return {
    isEditing,
    setIsEditing,
    handleEditMessage,
    handleFlagMessage
  };
};
