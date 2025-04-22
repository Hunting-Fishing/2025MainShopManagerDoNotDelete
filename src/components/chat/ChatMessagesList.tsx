
import React, { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./dialog/TypingIndicator";
import { MessageSquare, Clipboard } from "lucide-react";

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Clipboard className="h-12 w-12 mb-2" />
        <p className="text-center">Select a conversation</p>
        <p className="text-center text-sm">or start a new one</p>
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <MessageSquare className="h-12 w-12 mb-2" />
        <p className="text-center">No messages yet</p>
        <p className="text-center text-sm">Start the conversation!</p>
      </div>
    );
  }

  const handleEditWrapper = (newContent: string, messageId: string) => {
    onEditMessage(messageId, newContent);
  };

  const handleFlagWrapper = (isFlagged: boolean, messageId: string) => {
    if (isFlagged) {
      onFlagMessage(messageId, "Flagged by user");
    }
  };

  const handleOpenThread = (messageId: string) => {
    if (onOpenThread) onOpenThread(messageId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4" ref={contentRef}>
      <>
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === userId;
          return (
            <div id={`message-${message.id}`} key={message.id}>
              <ChatMessage
                message={message}
                isCurrentUser={isCurrentUser}
                userId={userId}
                onEdit={(newContent) => handleEditWrapper(newContent, message.id)}
                onFlag={(isFlagged) => handleFlagWrapper(isFlagged, message.id)}
                onOpenThread={() => handleOpenThread(message.id)}
                searchTerm={searchTerm}
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
      </>
    </div>
  );
};
