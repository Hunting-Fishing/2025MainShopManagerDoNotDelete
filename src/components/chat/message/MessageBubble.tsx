
import React from "react";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { highlightText } from "@/utils/textUtils";

export interface MessageBubbleProps {
  content: string;
  timestamp: string;
  senderName?: string;
  messageType?: 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread';
  isEdited?: boolean;
  isFlagged?: boolean;
  isCurrentUser: boolean;
  onEdit?: () => void;
  onFlag?: (flag: boolean) => void;
  onOpenThread?: () => void;
  searchTerm?: string;
  showFullTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  senderName,
  messageType = "text",
  isEdited = false,
  isFlagged = false,
  isCurrentUser,
  onEdit,
  onFlag,
  onOpenThread,
  searchTerm = "",
  showFullTimestamp = false,
}) => {
  // Function to format the timestamp
  const formatMessageTime = (timestamp: string, showFull: boolean): string => {
    try {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return showFull 
        ? format(date, "MMM d, yyyy h:mm a") 
        : format(date, "h:mm a");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  // Determine the background color based on message type and sender
  const getBubbleStyles = () => {
    if (messageType === "system") {
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm";
    }
    
    return isCurrentUser
      ? "bg-blue-500 text-white"
      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  };

  // Handle system messages
  if (messageType === "system") {
    return (
      <div className="my-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm text-center">
        {content}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatMessageTime(timestamp, showFullTimestamp)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-2 rounded-lg ${getBubbleStyles()} ${
        isCurrentUser ? "ml-auto" : "mr-auto"
      } relative group max-w-full`}
    >
      {!isCurrentUser && senderName && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {senderName}
        </div>
      )}

      <div className="whitespace-pre-wrap break-words">
        {searchTerm
          ? highlightText(content, searchTerm)
          : content}
      </div>

      <div className="flex items-center justify-between mt-1 text-xs">
        <div className={`${isCurrentUser ? "text-blue-200" : "text-gray-500"}`}>
          {formatMessageTime(timestamp, showFullTimestamp)}
          {isEdited && <span className="ml-1">(edited)</span>}
        </div>

        {isFlagged && (
          <AlertTriangle
            size={12}
            className="text-yellow-500 dark:text-yellow-400"
          />
        )}
      </div>
    </div>
  );
};
