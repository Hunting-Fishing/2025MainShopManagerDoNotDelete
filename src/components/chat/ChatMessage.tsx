
import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { MessageBubble } from "./message/MessageBubble";
import { ChatFileMessage } from "./file/ChatFileMessage";
import { ReminderBadge } from "./message/ReminderBadge";
import { useNavigate } from "react-router-dom";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  userId: string;
  onEdit: (content: string) => void;
  onFlag: (flag: boolean) => void;
  onOpenThread?: () => void;
  searchTerm?: string;
  customerId?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  userId,
  onEdit,
  onFlag,
  onOpenThread,
  searchTerm = "",
  customerId,
}) => {
  const navigate = useNavigate();
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  
  const handleClick = () => {
    setShowFullTimestamp(!showFullTimestamp);
  };
  
  // Check if the message has reminder metadata
  const hasReminder = message.metadata && message.metadata.reminder_id;
  
  const handleReminderClick = () => {
    // If the reminder is associated with a customer, navigate to the reminders tab
    if (customerId && message.metadata?.reminder_id) {
      navigate(`/customers/${customerId}?tab=reminders&reminder=${message.metadata.reminder_id}`);
    }
  };
  
  // Handle different message types
  if (message.message_type === 'file') {
    return <ChatFileMessage message={message} isCurrentUser={isCurrentUser} />;
  }

  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } group relative`}
      onClick={handleClick}
    >
      <div className={`max-w-[80%] ${message.message_type === 'system' ? 'w-full text-center' : ''}`}>
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          onEdit={onEdit}
          onFlag={onFlag}
          onOpenThread={onOpenThread}
          searchTerm={searchTerm}
          showFullTimestamp={showFullTimestamp}
        />
        
        {/* Display reminder badge if message has reminder metadata */}
        {hasReminder && message.metadata?.reminder_due_date && (
          <div className="mt-1">
            <ReminderBadge 
              reminderType={message.metadata.reminder_type || 'general'} 
              dueDate={message.metadata.reminder_due_date}
              priority={message.metadata.reminder_priority || 'medium'}
              onClick={handleReminderClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};
