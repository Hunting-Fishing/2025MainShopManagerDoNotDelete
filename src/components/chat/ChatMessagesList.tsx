
import React, { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./dialog/TypingIndicator";
import { EmptyStateMessage } from "./message/EmptyStateMessage";
import { useChatMessageActions } from "@/hooks/useChatMessageActions";

interface TypingUser {
  id: string;
  name: string;
}

interface ChatMessagesListProps {
  room: any;
  messages: ChatMessageType[];
  userId: string;
  isTyping?: boolean;
  typingUsers: TypingUser[];
  searchTerm: string;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onFlagMessage: (messageId: string, reason: string) => void;
  onOpenThread?: (messageId: string) => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  customerId?: string | null;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  room,
  messages,
  userId,
  isTyping = false,
  typingUsers = [],
  searchTerm,
  onEditMessage,
  onFlagMessage,
  onOpenThread,
  contentRef,
  customerId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { handleEditMessage, handleFlagMessage } = useChatMessageActions({
    onEditMessage,
    onFlagMessage
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!room) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <EmptyStateMessage type="no-room" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <EmptyStateMessage type="no-messages" />
      </div>
    );
  }

  const handleOpenThread = (messageId: string) => {
    if (onOpenThread) onOpenThread(messageId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900" ref={contentRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === userId;
          return (
            <div id={`message-${message.id}`} key={message.id} className="mb-4">
              <ChatMessage
                message={message}
                isCurrentUser={isCurrentUser}
                userId={userId}
                onEdit={(newContent) => handleEditMessage(newContent, message.id)}
                onFlag={(isFlagged) => handleFlagMessage(isFlagged, message.id)}
                onOpenThread={() => handleOpenThread(message.id)}
                searchTerm={searchTerm}
                customerId={customerId || undefined}
              />
            </div>
          );
        })}
        {isTyping && typingUsers.length > 0 && (
          <div className="px-4 py-2">
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
