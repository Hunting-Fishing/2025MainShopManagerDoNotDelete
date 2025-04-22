
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
  newMessageText: string;
  setNewMessageText: (txt: string) => void;
  onSendMessage: () => Promise<void>;
  disabled: boolean;
  isSending?: boolean; // Add as optional prop so parent can control this state
  children?: React.ReactNode;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  newMessageText,
  setNewMessageText,
  onSendMessage,
  disabled,
  isSending: externalIsSending,
  children,
}) => {
  // Only create internal state if not provided from parent
  const [internalIsSending, setInternalIsSending] = useState(false);
  
  // Use the external state if provided, otherwise use internal state
  const isSending = externalIsSending !== undefined ? externalIsSending : internalIsSending;

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;
    
    // Only set internal state if not controlled externally
    if (externalIsSending === undefined) {
      setInternalIsSending(true);
    }
    
    try {
      await onSendMessage();
    } catch (error) {
      // error boundary/log only
    } finally {
      // Only set internal state if not controlled externally
      if (externalIsSending === undefined) {
        setInternalIsSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <Textarea
          placeholder="Type a message..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isSending}
          className="flex-1 min-h-[40px] max-h-[120px]"
          rows={1}
        />
        {children}
        <Button 
          onClick={handleSendMessage} 
          disabled={disabled || isSending || !newMessageText.trim()}
          variant="esm"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
