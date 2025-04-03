import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { parseFileFromMessage } from '@/services/chat/fileService';
import { ChatFileMessage } from './file/ChatFileMessage';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  // Parse the message content for file references
  const { fileInfo, text } = parseFileFromMessage(message.content);
  
  // Format time
  const formattedTime = formatMessageTime(message.created_at);
  
  return (
    <div className={cn(
      "flex mb-2",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && (
          <div className="ml-2 text-xs text-slate-500 mb-1">
            {message.sender_name}
          </div>
        )}
        
        <div className={cn(
          "rounded-lg px-3 py-2 break-words",
          isCurrentUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-slate-200 text-slate-900"
        )}>
          {/* If it's a file message, render the appropriate component */}
          {fileInfo ? (
            <ChatFileMessage fileInfo={fileInfo} caption={text} />
          ) : (
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-slate-500 mt-1",
          isCurrentUser ? "text-right mr-1" : "ml-1"
        )}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

// Helper function to format message time
const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // If the message is from today, just display the time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise, show a relative time
  return formatDistanceToNow(messageDate, { addSuffix: true });
};
