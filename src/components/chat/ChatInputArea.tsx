
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
  newMessageText: string;
  setNewMessageText: (txt: string) => void;
  onSendMessage: () => Promise<void>;
  disabled: boolean;
  children?: React.ReactNode;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  newMessageText,
  setNewMessageText,
  onSendMessage,
  disabled,
  children,
}) => {
  const [isSending, setIsSending] = React.useState(false);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage();
    } catch (error) {
      // error boundary/log only
    } finally {
      setIsSending(false);
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
          disabled={disabled}
          className="flex-1 min-h-[40px] max-h-[120px]"
          rows={1}
        />
        {children}
        <Button onClick={handleSendMessage} disabled={disabled || !newMessageText.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};
