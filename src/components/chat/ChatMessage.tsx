
import React, { useState } from 'react';
import { MoreHorizontal, Flag, Reply, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { ChatFileMessage } from './ChatFileMessage';
import { StatusBadge } from './dialog/StatusBadge';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  onReply?: () => void;
  onFlag?: (isFlagged: boolean) => void;
  onEdit?: (newContent: string) => void;
  replyCount?: number;
  showThread?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  onReply,
  onFlag,
  onEdit,
  replyCount = 0,
  showThread = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim()) {
      onEdit(editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const renderMessageTime = () => {
    const messageDate = new Date(message.created_at);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'p'); // "1:30 PM"
    } else {
      return format(messageDate, 'MMM d, p'); // "Jan 1, 1:30 PM"
    }
  };

  const renderMessageContent = () => {
    if (message.file_url) {
      return <ChatFileMessage message={message} />;
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            autoFocus
          />
          <div className="flex space-x-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="h-8 px-2 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {message.content}
        {message.is_edited && (
          <span className="ml-1 text-xs text-gray-500">(edited)</span>
        )}
      </div>
    );
  };

  const renderMessageStatusBadges = () => {
    const badges = [];
    
    if (message.is_flagged) {
      badges.push(
        <StatusBadge key="flagged" status="error" text="Flagged" size="sm" />
      );
    }
    
    if (message.message_type === 'system') {
      badges.push(
        <StatusBadge key="system" status="info" text="System" size="sm" />
      );
    }
    
    if (message.message_type === 'work_order') {
      badges.push(
        <StatusBadge key="work-order" status="success" text="Work Order" size="sm" />
      );
    }
    
    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-1">{badges}</div>
    ) : null;
  };

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[75%] ${
          isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 order-1' : 'bg-white dark:bg-gray-800 order-2'
        } rounded-lg shadow-sm p-3 border`}
      >
        {/* Message Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium text-sm">
            <span className={isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}>
              {isCurrentUser ? 'You' : message.sender_name}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {renderMessageTime()}
          </div>
        </div>

        {/* Message Content */}
        {renderMessageContent()}
        
        {/* Message Status Badges */}
        {renderMessageStatusBadges()}

        {/* Message Actions */}
        <div className="flex justify-between items-center mt-2">
          <div className="space-x-1">
            {replyCount > 0 && !showThread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReply}
                className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {onReply && !isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onReply}
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
              >
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            )}
            {isCurrentUser && !isEditing && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {!isEditing && onFlag && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onFlag(!message.is_flagged)}
                    className={message.is_flagged ? 'text-red-600' : ''}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {message.is_flagged ? 'Remove flag' : 'Flag message'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
