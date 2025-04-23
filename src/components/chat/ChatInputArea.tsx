
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Repeat } from 'lucide-react';
import { CreateRecurringMessageDialog } from './recurring/CreateRecurringMessageDialog';
import { useAuthUser } from '@/hooks/useAuthUser';

interface ChatInputAreaProps {
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSendMessage: () => Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
  roomId?: string;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  newMessageText,
  setNewMessageText,
  onSendMessage,
  disabled = false,
  children,
  roomId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const { userId, userName } = useAuthUser();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessageText.trim() || disabled || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSendMessage();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessageText.trim() && !disabled && !isSubmitting) {
        handleSubmit(e as any);
      }
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={disabled ? "Select a conversation to start messaging" : "Type your message..."}
              className="bg-white dark:bg-gray-800"
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {roomId && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowRecurringDialog(true)}
                title="Create recurring message"
              >
                <Repeat className="h-4 w-4" />
              </Button>
            )}
            
            {children}
            
            <Button
              type="submit"
              disabled={!newMessageText.trim() || disabled || isSubmitting}
              variant="default"
            >
              Send
            </Button>
          </div>
        </div>
      </form>
      
      {roomId && userId && userName && (
        <CreateRecurringMessageDialog
          open={showRecurringDialog}
          onClose={() => setShowRecurringDialog(false)}
          roomId={roomId}
          userId={userId}
          userName={userName}
        />
      )}
    </>
  );
};
